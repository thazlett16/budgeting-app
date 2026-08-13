use std::path::PathBuf;

use tauri::{AppHandle, Manager};

use crate::error::AppResult;

pub const ACCOUNTS_CSV: &str = "accounts.csv";
pub const EXPENSE_CATEGORIES_CSV: &str = "expense_categories.csv";
pub const INCOME_TYPES_CSV: &str = "income_types.csv";
pub const INVESTMENTS_CSV: &str = "investments.csv";
pub const EXPENSES_CSV: &str = "expenses.csv";
pub const INCOME_CSV: &str = "income.csv";
pub const META_JSON: &str = "meta.json";

pub fn data_dir(app: &AppHandle) -> AppResult<PathBuf> {
    Ok(app.path().app_data_dir()?.join("data"))
}

pub fn data_file(app: &AppHandle, file_name: &str) -> AppResult<PathBuf> {
    Ok(data_dir(app)?.join(file_name))
}

/// Creates the data directory and seeds default lookup CSVs on first launch.
/// `accounts.csv` is intentionally left unseeded — there's no sensible
/// default account list.
pub fn ensure_data_dir(app: &AppHandle) -> AppResult<()> {
    let dir = data_dir(app)?;

    std::fs::create_dir_all(&dir)?;

    // TODO(Phase 1): seed expense_categories.csv / income_types.csv presets
    // from 01-data-model-and-csv-schema.md if they don't already exist.

    Ok(())
}
