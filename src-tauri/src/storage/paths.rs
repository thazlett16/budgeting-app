use std::path::PathBuf;

use tauri::{AppHandle, Manager};
use uuid::Uuid;

use crate::error::AppResult;
use crate::models::lookup_item::LookupItem;
use crate::models::meta::{Meta, CURRENT_SCHEMA_VERSION};
use crate::storage::csv_store;

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

pub const PRESET_EXPENSE_CATEGORIES: &[&str] = &[
    "Housing",
    "Groceries",
    "Dining",
    "Transportation",
    "Utilities",
    "Insurance",
    "Healthcare",
    "Entertainment",
    "Subscriptions",
    "Shopping",
    "Debt",
    "Other",
];

pub const PRESET_INCOME_TYPES: &[&str] = &["W2", "Dividends", "Bonus", "Interest", "Other"];

/// Creates the data directory and seeds default lookup CSVs on first launch.
/// `accounts.csv` is intentionally left unseeded — there's no sensible
/// default account list.
pub fn ensure_data_dir(app: &AppHandle) -> AppResult<()> {
    let dir = data_dir(app)?;

    std::fs::create_dir_all(&dir)?;

    seed_lookup_presets(app, EXPENSE_CATEGORIES_CSV, PRESET_EXPENSE_CATEGORIES)?;
    seed_lookup_presets(app, INCOME_TYPES_CSV, PRESET_INCOME_TYPES)?;
    seed_meta(app)?;

    Ok(())
}

fn seed_meta(app: &AppHandle) -> AppResult<()> {
    let path = data_file(app, META_JSON)?;

    if path.exists() {
        return Ok(());
    }

    let meta = Meta { schema_version: CURRENT_SCHEMA_VERSION };
    let json = serde_json::to_string_pretty(&meta)?;

    std::fs::write(path, json)?;

    Ok(())
}

/// Also used by the "restore defaults" import command (`05-export-plan.md`
/// §5) to regenerate the same preset rows a user can re-download later.
pub fn seed_lookup_presets(app: &AppHandle, file_name: &str, presets: &[&str]) -> AppResult<()> {
    let path = data_file(app, file_name)?;

    if path.exists() {
        return Ok(());
    }

    let items: Vec<LookupItem> = presets
        .iter()
        .enumerate()
        .map(|(index, name)| LookupItem {
            id: Uuid::new_v4().to_string(),
            name: (*name).to_string(),
            archived: false,
            sort_order: index as i64,
        })
        .collect();

    csv_store::write_all(path, &items)
}
