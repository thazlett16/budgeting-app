use tauri::AppHandle;

use crate::error::AppResult;
use crate::models::account::Account;
use crate::storage::{csv_store, paths};

#[tauri::command]
pub fn list_accounts(app: AppHandle) -> AppResult<Vec<Account>> {
    let path = paths::data_file(&app, paths::ACCOUNTS_CSV)?;

    csv_store::read_all(path)
}
