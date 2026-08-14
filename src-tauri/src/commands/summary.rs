use std::collections::BTreeMap;

use jiff::civil::Date;
use serde::Serialize;
use tauri::AppHandle;

use crate::error::AppResult;
use crate::models::date_range::DateRange;
use crate::models::expense_entry::ExpenseEntry;
use crate::models::income_entry::IncomeEntry;
use crate::models::investment_entry::InvestmentEntry;
use crate::storage::{csv_store, paths};

const MONTH_FORMAT: &str = "%Y-%m";

fn month_key(date: Date) -> String {
    date.strftime(MONTH_FORMAT).to_string()
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct AccountMonthGain {
    pub account_id: String,
    pub month: String,
    pub date: Date,
    pub balance: f64,
    pub prior_balance: Option<f64>,
    pub contribution: f64,
    /// `None` when there is no prior snapshot for this account — a gain of
    /// `0` would falsely imply "no growth this period" instead of "no data
    /// to compare against".
    pub gain_dollar: Option<f64>,
    pub gain_percent: Option<f64>,
}

fn gain_dollar(balance: f64, contribution: f64, prior_balance: f64) -> f64 {
    balance - contribution - prior_balance
}

fn gain_percent(gain_dollar: f64, prior_balance: f64) -> Option<f64> {
    if prior_balance == 0.0 {
        return None;
    }

    Some(gain_dollar / prior_balance)
}

fn compute_investment_gains(entries: Vec<InvestmentEntry>, range: DateRange) -> Vec<AccountMonthGain> {
    let mut by_account: BTreeMap<String, Vec<InvestmentEntry>> = BTreeMap::new();

    for entry in entries {
        by_account.entry(entry.account_id.clone()).or_default().push(entry);
    }

    let mut rows = Vec::new();

    for account_entries in by_account.values_mut() {
        account_entries.sort_by_key(|entry| entry.date);

        let mut prior_balance: Option<f64> = None;

        for entry in account_entries.iter() {
            if range.contains(entry.date) {
                let mut row = AccountMonthGain {
                    account_id: entry.account_id.clone(),
                    month: month_key(entry.date),
                    date: entry.date,
                    balance: entry.balance,
                    prior_balance,
                    contribution: entry.contribution,
                    gain_dollar: None,
                    gain_percent: None,
                };

                if let Some(prior) = prior_balance {
                    let gain = gain_dollar(entry.balance, entry.contribution, prior);
                    row.gain_dollar = Some(gain);
                    row.gain_percent = gain_percent(gain, prior);
                }

                rows.push(row);
            }

            prior_balance = Some(entry.balance);
        }
    }

    rows.sort_by_key(|row| (row.date, row.account_id.clone()));

    rows
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_investment_gains(app: AppHandle, range: DateRange) -> AppResult<Vec<AccountMonthGain>> {
    let entries: Vec<InvestmentEntry> = csv_store::read_all(paths::data_file(&app, paths::INVESTMENTS_CSV)?)?;

    Ok(compute_investment_gains(entries, range))
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct MonthNetWorth {
    pub month: String,
    pub net_worth: f64,
}

/// Net worth for a month is the sum, across accounts, of that account's
/// latest snapshot dated within the month (not a running total) — matching
/// the "one snapshot per account per month" shape the Investments log is
/// meant to be filled in with.
#[tauri::command(rename_all = "snake_case")]
pub fn get_net_worth_by_month(app: AppHandle, range: DateRange) -> AppResult<Vec<MonthNetWorth>> {
    let entries: Vec<InvestmentEntry> = csv_store::read_all(paths::data_file(&app, paths::INVESTMENTS_CSV)?)?;

    // month -> account_id -> latest balance that month
    let mut by_month: BTreeMap<String, BTreeMap<String, (Date, f64)>> = BTreeMap::new();

    for entry in entries {
        if !range.contains(entry.date) {
            continue;
        }

        let month_entries = by_month.entry(month_key(entry.date)).or_default();

        let is_newer = match month_entries.get(&entry.account_id) {
            Some((existing_date, _)) => entry.date >= *existing_date,
            None => true,
        };

        if is_newer {
            month_entries.insert(entry.account_id.clone(), (entry.date, entry.balance));
        }
    }

    let rows = by_month
        .into_iter()
        .map(|(month, accounts)| MonthNetWorth {
            month,
            net_worth: accounts.values().map(|(_, balance)| balance).sum(),
        })
        .collect();

    Ok(rows)
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct CategoryMonthTotal {
    pub category_id: String,
    pub month: String,
    pub total: f64,
}

fn compute_spending_by_category(entries: Vec<ExpenseEntry>, range: DateRange) -> Vec<CategoryMonthTotal> {
    let mut totals: BTreeMap<(String, String), f64> = BTreeMap::new();

    for entry in entries {
        if !range.contains(entry.date) {
            continue;
        }

        *totals.entry((month_key(entry.date), entry.category_id.clone())).or_insert(0.0) += entry.amount;
    }

    totals
        .into_iter()
        .map(|((month, category_id), total)| CategoryMonthTotal { category_id, month, total })
        .collect()
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_spending_by_category(app: AppHandle, range: DateRange) -> AppResult<Vec<CategoryMonthTotal>> {
    let entries: Vec<ExpenseEntry> = csv_store::read_all(paths::data_file(&app, paths::EXPENSES_CSV)?)?;

    Ok(compute_spending_by_category(entries, range))
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct TypeMonthTotal {
    pub type_id: String,
    pub month: String,
    pub total: f64,
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_income_by_type(app: AppHandle, range: DateRange) -> AppResult<Vec<TypeMonthTotal>> {
    let entries: Vec<IncomeEntry> = csv_store::read_all(paths::data_file(&app, paths::INCOME_CSV)?)?;

    let mut totals: BTreeMap<(String, String), f64> = BTreeMap::new();

    for entry in entries {
        if !range.contains(entry.date) {
            continue;
        }

        *totals.entry((month_key(entry.date), entry.type_id.clone())).or_insert(0.0) += entry.amount;
    }

    let rows = totals
        .into_iter()
        .map(|((month, type_id), total)| TypeMonthTotal { type_id, month, total })
        .collect();

    Ok(rows)
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct DashboardInsights {
    pub net_cash_flow: f64,
    pub total_contributions: f64,
    /// Excel-carried caveat: this is a proxy using pre-tax contributions and
    /// gross income, not a true post-tax savings rate — good enough for a
    /// trend indicator, not for tax planning.
    pub savings_rate: Option<f64>,
    /// `None` when the range doesn't span at least two distinct snapshot
    /// months for any account (nothing to compare month-over-month).
    pub net_worth_change: Option<f64>,
    /// Months of runway = current net worth / average monthly expense over
    /// the range. Mirrors the Excel Summary tab's simplification of treating
    /// total net worth as "liquid" — it isn't (401k penalties etc.), but the
    /// spreadsheet never modeled account liquidity, so neither does this.
    pub emergency_fund_runway_months: Option<f64>,
    pub top_spending_category_id: Option<String>,
}

fn savings_rate(net_cash_flow: f64, total_contributions: f64, total_income: f64) -> Option<f64> {
    if total_income == 0.0 {
        return None;
    }

    Some((net_cash_flow + total_contributions) / total_income)
}

fn net_worth_change(months: &[MonthNetWorth]) -> Option<f64> {
    let first = months.first()?;
    let last = months.last()?;

    if first.month == last.month {
        return None;
    }

    Some(last.net_worth - first.net_worth)
}

fn emergency_fund_runway_months(current_net_worth: f64, average_monthly_expense: f64) -> Option<f64> {
    if average_monthly_expense == 0.0 {
        return None;
    }

    Some(current_net_worth / average_monthly_expense)
}

fn top_spending_category(spending: &[CategoryMonthTotal]) -> Option<String> {
    let mut totals: BTreeMap<&str, f64> = BTreeMap::new();

    for row in spending {
        *totals.entry(row.category_id.as_str()).or_insert(0.0) += row.total;
    }

    totals
        .into_iter()
        .max_by(|a, b| a.1.total_cmp(&b.1))
        .map(|(category_id, _)| category_id.to_string())
}

#[tauri::command(rename_all = "snake_case")]
pub fn get_dashboard_insights(app: AppHandle, range: DateRange) -> AppResult<DashboardInsights> {
    let expenses: Vec<ExpenseEntry> = csv_store::read_all(paths::data_file(&app, paths::EXPENSES_CSV)?)?;
    let income: Vec<IncomeEntry> = csv_store::read_all(paths::data_file(&app, paths::INCOME_CSV)?)?;
    let investments: Vec<InvestmentEntry> = csv_store::read_all(paths::data_file(&app, paths::INVESTMENTS_CSV)?)?;

    let mut total_expenses = 0.0;
    let mut month_count_expenses: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();

    for entry in &expenses {
        if range.contains(entry.date) {
            total_expenses += entry.amount;
            month_count_expenses.insert(month_key(entry.date));
        }
    }

    let mut total_income = 0.0;

    for entry in &income {
        if range.contains(entry.date) {
            total_income += entry.amount;
        }
    }

    let mut total_contributions = 0.0;

    for entry in &investments {
        if range.contains(entry.date) {
            total_contributions += entry.contribution;
        }
    }

    let net_cash_flow = total_income - total_expenses;

    let months = get_net_worth_by_month(app.clone(), range)?;
    let spending = compute_spending_by_category(expenses, range);

    let average_monthly_expense = if month_count_expenses.is_empty() {
        0.0
    } else {
        total_expenses / month_count_expenses.len() as f64
    };

    let current_net_worth = months.last().map(|row| row.net_worth).unwrap_or(0.0);

    Ok(DashboardInsights {
        net_cash_flow,
        total_contributions,
        savings_rate: savings_rate(net_cash_flow, total_contributions, total_income),
        net_worth_change: net_worth_change(&months),
        emergency_fund_runway_months: emergency_fund_runway_months(current_net_worth, average_monthly_expense),
        top_spending_category_id: top_spending_category(&spending),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn date(raw: &str) -> Date {
        raw.parse().unwrap()
    }

    fn range(start: &str, end: &str) -> DateRange {
        DateRange { start: date(start), end: date(end) }
    }

    fn entry(raw_date: &str, account_id: &str, balance: f64, contribution: f64) -> InvestmentEntry {
        InvestmentEntry {
            id: format!("{raw_date}-{account_id}"),
            date: date(raw_date),
            account_id: account_id.to_string(),
            balance,
            contribution,
        }
    }

    #[test]
    fn first_entry_for_account_has_no_gain() {
        let entries = vec![entry("2026-01-01", "acct-1", 1000.0, 100.0)];
        let rows = compute_investment_gains(entries, range("2026-01-01", "2026-12-31"));

        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0].gain_dollar, None);
        assert_eq!(rows[0].gain_percent, None);
    }

    #[test]
    fn contribution_with_no_growth_yields_zero_gain() {
        let entries = vec![
            entry("2026-01-01", "acct-1", 1000.0, 0.0),
            entry("2026-02-01", "acct-1", 1100.0, 100.0),
        ];
        let rows = compute_investment_gains(entries, range("2026-01-01", "2026-12-31"));

        assert_eq!(rows[1].gain_dollar, Some(0.0));
    }

    #[test]
    fn withdrawal_is_a_negative_contribution() {
        let entries = vec![
            entry("2026-01-01", "acct-1", 1000.0, 0.0),
            entry("2026-02-01", "acct-1", 900.0, -100.0),
        ];
        let rows = compute_investment_gains(entries, range("2026-01-01", "2026-12-31"));

        // balance(900) - contribution(-100) - prior(1000) = 0: the drop is
        // fully explained by the withdrawal, no investment loss.
        assert_eq!(rows[1].gain_dollar, Some(0.0));
    }

    #[test]
    fn range_boundaries_are_inclusive() {
        let entries = vec![
            entry("2026-01-01", "acct-1", 1000.0, 0.0),
            entry("2026-06-15", "acct-1", 1100.0, 0.0),
            entry("2026-12-31", "acct-1", 1200.0, 0.0),
        ];
        let rows = compute_investment_gains(entries.clone(), range("2026-01-01", "2026-12-31"));
        assert_eq!(rows.len(), 3);

        let rows = compute_investment_gains(entries.clone(), range("2026-01-02", "2026-12-30"));
        assert_eq!(rows.len(), 1);

        let rows = compute_investment_gains(entries, range("2026-01-01", "2026-01-01"));
        assert_eq!(rows.len(), 1);
    }

    #[test]
    fn prior_balance_can_come_from_before_the_range() {
        let entries = vec![
            entry("2025-12-01", "acct-1", 1000.0, 0.0),
            entry("2026-01-01", "acct-1", 1100.0, 0.0),
        ];
        let rows = compute_investment_gains(entries, range("2026-01-01", "2026-12-31"));

        assert_eq!(rows.len(), 1);
        assert_eq!(rows[0].prior_balance, Some(1000.0));
        assert_eq!(rows[0].gain_dollar, Some(100.0));
    }

    #[test]
    fn malformed_csv_row_reports_row_number_not_a_crash() {
        let dir = std::env::temp_dir().join(format!("budgeting-app-test-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("investments.csv");
        std::fs::write(&path, "id,date,account_id,balance,contribution\nrow-1,2026-01-01,acct-1,not-a-number,0\n")
            .unwrap();

        let result: AppResult<Vec<InvestmentEntry>> = csv_store::read_all(&path);

        match result {
            Err(crate::error::AppError::CsvParse { row, .. }) => assert_eq!(row, 2),
            other => panic!("expected CsvParse error, got {other:?}"),
        }

        std::fs::remove_dir_all(&dir).unwrap();
    }
}
