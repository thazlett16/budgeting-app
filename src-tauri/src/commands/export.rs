use std::collections::HashMap;

use rust_xlsxwriter::{Format, Workbook};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

use crate::error::AppResult;
use crate::models::date_range::DateRange;
use crate::models::expense_entry::ExpenseEntry;
use crate::models::income_entry::IncomeEntry;
use crate::models::investment_entry::InvestmentEntry;
use crate::models::lookup_item::LookupItem;

use super::accounts::list_accounts;
use super::expenses::list_expenses;
use super::income::list_income;
use super::investments::list_investment_entries;
use super::lookups::{list_expense_categories, list_income_types};
use super::summary::{
    compute_investment_gains, compute_spending_by_category, get_dashboard_insights, get_income_by_type,
    get_net_worth_by_month,
};

fn name_lookup(items: Vec<LookupItem>) -> HashMap<String, String> {
    items.into_iter().map(|item| (item.id, item.name)).collect()
}

fn account_name_lookup(app: &AppHandle) -> AppResult<HashMap<String, String>> {
    let accounts = list_accounts(app.clone())?;

    Ok(accounts.into_iter().map(|account| (account.id, account.name)).collect())
}

/// Opens a native save-file dialog suggesting `file_name`, then writes
/// `content` there. Returns the chosen path, or `None` if the user
/// cancelled — the frontend distinguishes "cancelled" from "wrote nothing"
/// this way instead of treating a cancel as an error.
fn save_via_dialog(app: &AppHandle, file_name: &str, extension: &str, content: &str) -> AppResult<Option<String>> {
    let Some(file_path) = app
        .dialog()
        .file()
        .set_file_name(file_name)
        .add_filter(extension.to_uppercase(), &[extension])
        .blocking_save_file()
    else {
        return Ok(None);
    };

    let path = file_path
        .into_path()
        .map_err(|source| std::io::Error::other(source.to_string()))?;
    std::fs::write(&path, content)?;

    Ok(Some(path.display().to_string()))
}

/// Same as [`save_via_dialog`] but for binary content (XLSX, PDF) instead of
/// a `String` — the two can't share an implementation since one writes text
/// and the other raw bytes.
fn save_bytes_via_dialog(
    app: &AppHandle,
    file_name: &str,
    extension: &str,
    content: &[u8],
) -> AppResult<Option<String>> {
    let Some(file_path) = app
        .dialog()
        .file()
        .set_file_name(file_name)
        .add_filter(extension.to_uppercase(), &[extension])
        .blocking_save_file()
    else {
        return Ok(None);
    };

    let path = file_path
        .into_path()
        .map_err(|source| std::io::Error::other(source.to_string()))?;
    std::fs::write(&path, content)?;

    Ok(Some(path.display().to_string()))
}

#[derive(serde::Serialize)]
struct InvestmentExportRow {
    date: String,
    account: String,
    balance: f64,
    contribution: f64,
}

#[derive(serde::Serialize)]
struct ExpenseExportRow {
    date: String,
    description: String,
    amount: f64,
    category: String,
}

#[derive(serde::Serialize)]
struct IncomeExportRow {
    date: String,
    description: String,
    amount: f64,
    r#type: String,
}

fn in_range(date: jiff::civil::Date, range: &Option<DateRange>) -> bool {
    match range {
        Some(range) => range.contains(date),
        None => true,
    }
}

fn write_csv_string<T: serde::Serialize>(rows: &[T]) -> AppResult<String> {
    let mut writer = csv::Writer::from_writer(Vec::new());

    for row in rows {
        writer.serialize(row)?;
    }

    let bytes = writer.into_inner().map_err(|source| source.into_error())?;

    Ok(String::from_utf8_lossy(&bytes).into_owned())
}

#[tauri::command(rename_all = "snake_case")]
pub async fn export_investments_csv(app: AppHandle, range: Option<DateRange>) -> AppResult<Option<String>> {
    let accounts = account_name_lookup(&app)?;
    let entries: Vec<InvestmentEntry> = list_investment_entries(app.clone())?
        .into_iter()
        .filter(|entry| in_range(entry.date, &range))
        .collect();

    let rows: Vec<InvestmentExportRow> = entries
        .into_iter()
        .map(|entry| InvestmentExportRow {
            date: entry.date.to_string(),
            account: accounts.get(&entry.account_id).cloned().unwrap_or(entry.account_id),
            balance: entry.balance,
            contribution: entry.contribution,
        })
        .collect();

    let content = write_csv_string(&rows)?;

    save_via_dialog(&app, "investments.csv", "csv", &content)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn export_expenses_csv(app: AppHandle, range: Option<DateRange>) -> AppResult<Option<String>> {
    let categories = name_lookup(list_expense_categories(app.clone())?);
    let entries: Vec<ExpenseEntry> = list_expenses(app.clone())?
        .into_iter()
        .filter(|entry| in_range(entry.date, &range))
        .collect();

    let rows: Vec<ExpenseExportRow> = entries
        .into_iter()
        .map(|entry| ExpenseExportRow {
            date: entry.date.to_string(),
            description: entry.description,
            amount: entry.amount,
            category: categories.get(&entry.category_id).cloned().unwrap_or(entry.category_id),
        })
        .collect();

    let content = write_csv_string(&rows)?;

    save_via_dialog(&app, "expenses.csv", "csv", &content)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn export_income_csv(app: AppHandle, range: Option<DateRange>) -> AppResult<Option<String>> {
    let types = name_lookup(list_income_types(app.clone())?);
    let entries: Vec<IncomeEntry> = list_income(app.clone())?
        .into_iter()
        .filter(|entry| in_range(entry.date, &range))
        .collect();

    let rows: Vec<IncomeExportRow> = entries
        .into_iter()
        .map(|entry| IncomeExportRow {
            date: entry.date.to_string(),
            description: entry.description,
            amount: entry.amount,
            r#type: types.get(&entry.type_id).cloned().unwrap_or(entry.type_id),
        })
        .collect();

    let content = write_csv_string(&rows)?;

    save_via_dialog(&app, "income.csv", "csv", &content)
}

fn sum_by_id(totals: &[(String, f64)]) -> Vec<(String, f64)> {
    let mut by_id: HashMap<String, f64> = HashMap::new();

    for (id, amount) in totals {
        *by_id.entry(id.clone()).or_insert(0.0) += amount;
    }

    let mut rows: Vec<(String, f64)> = by_id.into_iter().collect();
    rows.sort_by(|a, b| b.1.total_cmp(&a.1));

    rows
}

/// Builds the XLSX workbook in memory: Investments / Expenses / Income
/// sheets (denormalized, same shape as the CSV export) plus a Summary sheet
/// mirroring the original spreadsheet's rollup tables — as computed
/// snapshot values, not live formulas (see the note cell on the sheet).
fn build_workbook(app: &AppHandle, range: DateRange) -> AppResult<Vec<u8>> {
    let accounts = account_name_lookup(app)?;
    let categories = name_lookup(list_expense_categories(app.clone())?);
    let types = name_lookup(list_income_types(app.clone())?);

    let currency_format = Format::new().set_num_format("$#,##0.00");
    let percent_format = Format::new().set_num_format("0.0%");

    let mut workbook = Workbook::new();

    let account_gains = compute_investment_gains(list_investment_entries(app.clone())?, range);

    let investments_sheet = workbook.add_worksheet();
    investments_sheet.set_name("Investments")?;
    investments_sheet.write_string(0, 0, "Date")?;
    investments_sheet.write_string(0, 1, "Account")?;
    investments_sheet.write_string(0, 2, "Balance")?;
    investments_sheet.write_string(0, 3, "Contribution")?;
    investments_sheet.write_string(0, 4, "Gain $")?;
    investments_sheet.write_string(0, 5, "Gain %")?;

    for (index, row) in account_gains.iter().enumerate() {
        let excel_row = (index + 1) as u32;
        let account_name = accounts.get(&row.account_id).cloned().unwrap_or_else(|| row.account_id.clone());

        investments_sheet.write_string(excel_row, 0, row.date.to_string())?;
        investments_sheet.write_string(excel_row, 1, account_name)?;
        investments_sheet.write_number_with_format(excel_row, 2, row.balance, &currency_format)?;
        investments_sheet.write_number_with_format(excel_row, 3, row.contribution, &currency_format)?;

        if let Some(gain_dollar) = row.gain_dollar {
            investments_sheet.write_number_with_format(excel_row, 4, gain_dollar, &currency_format)?;
        }

        if let Some(gain_percent) = row.gain_percent {
            investments_sheet.write_number_with_format(excel_row, 5, gain_percent, &percent_format)?;
        }
    }

    let expenses: Vec<ExpenseEntry> =
        list_expenses(app.clone())?.into_iter().filter(|entry| range.contains(entry.date)).collect();

    let expenses_sheet = workbook.add_worksheet();
    expenses_sheet.set_name("Expenses")?;
    expenses_sheet.write_string(0, 0, "Date")?;
    expenses_sheet.write_string(0, 1, "Description")?;
    expenses_sheet.write_string(0, 2, "Amount")?;
    expenses_sheet.write_string(0, 3, "Category")?;

    for (index, entry) in expenses.iter().enumerate() {
        let excel_row = (index + 1) as u32;
        let category_name = categories.get(&entry.category_id).cloned().unwrap_or_else(|| entry.category_id.clone());

        expenses_sheet.write_string(excel_row, 0, entry.date.to_string())?;
        expenses_sheet.write_string(excel_row, 1, &entry.description)?;
        expenses_sheet.write_number_with_format(excel_row, 2, entry.amount, &currency_format)?;
        expenses_sheet.write_string(excel_row, 3, category_name)?;
    }

    let income: Vec<IncomeEntry> =
        list_income(app.clone())?.into_iter().filter(|entry| range.contains(entry.date)).collect();

    let income_sheet = workbook.add_worksheet();
    income_sheet.set_name("Income")?;
    income_sheet.write_string(0, 0, "Date")?;
    income_sheet.write_string(0, 1, "Description")?;
    income_sheet.write_string(0, 2, "Amount")?;
    income_sheet.write_string(0, 3, "Type")?;

    for (index, entry) in income.iter().enumerate() {
        let excel_row = (index + 1) as u32;
        let type_name = types.get(&entry.type_id).cloned().unwrap_or_else(|| entry.type_id.clone());

        income_sheet.write_string(excel_row, 0, entry.date.to_string())?;
        income_sheet.write_string(excel_row, 1, &entry.description)?;
        income_sheet.write_number_with_format(excel_row, 2, entry.amount, &currency_format)?;
        income_sheet.write_string(excel_row, 3, type_name)?;
    }

    let net_worth_months = get_net_worth_by_month(app.clone(), range)?;
    let spending_totals =
        sum_by_id(&compute_spending_by_category(list_expenses(app.clone())?, range)
            .into_iter()
            .map(|row| (row.category_id, row.total))
            .collect::<Vec<_>>());
    let income_totals = sum_by_id(
        &get_income_by_type(app.clone(), range)?.into_iter().map(|row| (row.type_id, row.total)).collect::<Vec<_>>(),
    );
    let insights = get_dashboard_insights(app.clone(), range)?;

    let summary_sheet = workbook.add_worksheet();
    summary_sheet.set_name("Summary")?;

    let mut row = 0u32;

    summary_sheet.write_string(
        row,
        0,
        format!("Snapshot generated {} — computed values, not live formulas.", jiff::Zoned::now().date()),
    )?;
    row += 2;

    summary_sheet.write_string(row, 0, "Monthly Gains by Account")?;
    row += 1;
    summary_sheet.write_string(row, 0, "Account")?;
    summary_sheet.write_string(row, 1, "Month")?;
    summary_sheet.write_string(row, 2, "Gain $")?;
    summary_sheet.write_string(row, 3, "Gain %")?;
    row += 1;

    for gain in &account_gains {
        let account_name = accounts.get(&gain.account_id).cloned().unwrap_or_else(|| gain.account_id.clone());

        summary_sheet.write_string(row, 0, account_name)?;
        summary_sheet.write_string(row, 1, &gain.month)?;

        if let Some(gain_dollar) = gain.gain_dollar {
            summary_sheet.write_number_with_format(row, 2, gain_dollar, &currency_format)?;
        }

        if let Some(gain_percent) = gain.gain_percent {
            summary_sheet.write_number_with_format(row, 3, gain_percent, &percent_format)?;
        }

        row += 1;
    }
    row += 1;

    summary_sheet.write_string(row, 0, "Net Worth by Month")?;
    row += 1;
    summary_sheet.write_string(row, 0, "Month")?;
    summary_sheet.write_string(row, 1, "Net Worth")?;
    row += 1;

    for month in &net_worth_months {
        summary_sheet.write_string(row, 0, &month.month)?;
        summary_sheet.write_number_with_format(row, 1, month.net_worth, &currency_format)?;
        row += 1;
    }
    row += 1;

    summary_sheet.write_string(row, 0, "Spending by Category")?;
    row += 1;
    summary_sheet.write_string(row, 0, "Category")?;
    summary_sheet.write_string(row, 1, "Total")?;
    row += 1;

    for (category_id, total) in &spending_totals {
        let category_name = categories.get(category_id).cloned().unwrap_or_else(|| category_id.clone());

        summary_sheet.write_string(row, 0, category_name)?;
        summary_sheet.write_number_with_format(row, 1, *total, &currency_format)?;
        row += 1;
    }
    row += 1;

    summary_sheet.write_string(row, 0, "Income by Type")?;
    row += 1;
    summary_sheet.write_string(row, 0, "Type")?;
    summary_sheet.write_string(row, 1, "Total")?;
    row += 1;

    for (type_id, total) in &income_totals {
        let type_name = types.get(type_id).cloned().unwrap_or_else(|| type_id.clone());

        summary_sheet.write_string(row, 0, type_name)?;
        summary_sheet.write_number_with_format(row, 1, *total, &currency_format)?;
        row += 1;
    }
    row += 1;

    summary_sheet.write_string(row, 0, "Net Cash Flow")?;
    summary_sheet.write_number_with_format(row, 1, insights.net_cash_flow, &currency_format)?;
    row += 2;

    summary_sheet.write_string(row, 0, "Additional Insights")?;
    row += 1;

    summary_sheet.write_string(row, 0, "Total Contributions")?;
    summary_sheet.write_number_with_format(row, 1, insights.total_contributions, &currency_format)?;
    row += 1;

    summary_sheet.write_string(row, 0, "Savings Rate")?;

    if let Some(savings_rate) = insights.savings_rate {
        summary_sheet.write_number_with_format(row, 1, savings_rate, &percent_format)?;
    }
    row += 1;

    summary_sheet.write_string(row, 0, "Net Worth Change")?;

    if let Some(net_worth_change) = insights.net_worth_change {
        summary_sheet.write_number_with_format(row, 1, net_worth_change, &currency_format)?;
    }
    row += 1;

    summary_sheet.write_string(row, 0, "Emergency Fund Runway (months)")?;

    if let Some(runway_months) = insights.emergency_fund_runway_months {
        summary_sheet.write_number(row, 1, runway_months)?;
    }
    row += 1;

    summary_sheet.write_string(row, 0, "Top Spending Category")?;

    if let Some(category_id) = &insights.top_spending_category_id {
        let category_name = categories.get(category_id).cloned().unwrap_or_else(|| category_id.clone());
        summary_sheet.write_string(row, 1, category_name)?;
    }

    Ok(workbook.save_to_buffer()?)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn export_xlsx(app: AppHandle, range: DateRange) -> AppResult<Option<String>> {
    let bytes = build_workbook(&app, range)?;

    save_bytes_via_dialog(&app, "budget-export.xlsx", "xlsx", &bytes)
}
