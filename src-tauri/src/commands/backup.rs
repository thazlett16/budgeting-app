use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;

use crate::error::{AppError, AppResult};
use crate::models::account::Account;
use crate::models::expense_entry::ExpenseEntry;
use crate::models::income_entry::IncomeEntry;
use crate::models::investment_entry::InvestmentEntry;
use crate::models::lookup_item::LookupItem;
use crate::models::meta::CURRENT_SCHEMA_VERSION;
use crate::storage::{csv_store, paths};

/// Full snapshot of the app-data directory in one portable file — doubles as
/// the restore/import format (`05-export-plan.md` §3). `schema_version`
/// lets `import_backup` detect a backup newer than this app understands
/// instead of silently misreading unrecognized fields.
#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
struct Backup {
    schema_version: u32,
    exported_at: String,
    accounts: Vec<Account>,
    expense_categories: Vec<LookupItem>,
    income_types: Vec<LookupItem>,
    investments: Vec<InvestmentEntry>,
    expenses: Vec<ExpenseEntry>,
    income: Vec<IncomeEntry>,
}

fn read_backup(app: &AppHandle) -> AppResult<Backup> {
    Ok(Backup {
        schema_version: CURRENT_SCHEMA_VERSION,
        exported_at: jiff::Zoned::now().to_string(),
        accounts: csv_store::read_all(paths::data_file(app, paths::ACCOUNTS_CSV)?)?,
        expense_categories: csv_store::read_all(paths::data_file(app, paths::EXPENSE_CATEGORIES_CSV)?)?,
        income_types: csv_store::read_all(paths::data_file(app, paths::INCOME_TYPES_CSV)?)?,
        investments: csv_store::read_all(paths::data_file(app, paths::INVESTMENTS_CSV)?)?,
        expenses: csv_store::read_all(paths::data_file(app, paths::EXPENSES_CSV)?)?,
        income: csv_store::read_all(paths::data_file(app, paths::INCOME_CSV)?)?,
    })
}

#[tauri::command(rename_all = "snake_case")]
pub async fn export_backup(app: AppHandle) -> AppResult<Option<String>> {
    let backup = read_backup(&app)?;
    let json = serde_json::to_string_pretty(&backup)?;

    let Some(file_path) = app.dialog().file().set_file_name("budget-backup.json").add_filter("JSON", &["json"]).blocking_save_file()
    else {
        return Ok(None);
    };

    let path = file_path.into_path().map_err(|source| std::io::Error::other(source.to_string()))?;
    std::fs::write(&path, json)?;

    Ok(Some(path.display().to_string()))
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "snake_case")]
pub struct RestoreSummary {
    pub accounts: usize,
    pub expense_categories: usize,
    pub income_types: usize,
    pub investments: usize,
    pub expenses: usize,
    pub income: usize,
}

/// Overwrites every CSV table with the contents of the chosen backup file.
/// The frontend is responsible for confirming this destructive action with
/// the user before invoking the command — by the time this runs, the
/// overwrite is unconditional.
#[tauri::command(rename_all = "snake_case")]
pub async fn import_backup(app: AppHandle) -> AppResult<Option<RestoreSummary>> {
    let Some(file_path) = app.dialog().file().add_filter("JSON", &["json"]).blocking_pick_file() else {
        return Ok(None);
    };

    let path = file_path.into_path().map_err(|source| std::io::Error::other(source.to_string()))?;
    let content = std::fs::read_to_string(&path)?;
    let backup: Backup = serde_json::from_str(&content)?;

    if backup.schema_version > CURRENT_SCHEMA_VERSION {
        return Err(AppError::Validation(format!(
            "backup schema_version {} is newer than this app supports ({CURRENT_SCHEMA_VERSION})",
            backup.schema_version,
        )));
    }

    csv_store::write_all(paths::data_file(&app, paths::ACCOUNTS_CSV)?, &backup.accounts)?;
    csv_store::write_all(paths::data_file(&app, paths::EXPENSE_CATEGORIES_CSV)?, &backup.expense_categories)?;
    csv_store::write_all(paths::data_file(&app, paths::INCOME_TYPES_CSV)?, &backup.income_types)?;
    csv_store::write_all(paths::data_file(&app, paths::INVESTMENTS_CSV)?, &backup.investments)?;
    csv_store::write_all(paths::data_file(&app, paths::EXPENSES_CSV)?, &backup.expenses)?;
    csv_store::write_all(paths::data_file(&app, paths::INCOME_CSV)?, &backup.income)?;

    Ok(Some(RestoreSummary {
        accounts: backup.accounts.len(),
        expense_categories: backup.expense_categories.len(),
        income_types: backup.income_types.len(),
        investments: backup.investments.len(),
        expenses: backup.expenses.len(),
        income: backup.income.len(),
    }))
}
