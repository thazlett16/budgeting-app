use tauri::AppHandle;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::models::account::{Account, AccountInput};
use crate::storage::{csv_store, paths};

#[tauri::command(rename_all = "snake_case")]
pub fn list_accounts(app: AppHandle) -> AppResult<Vec<Account>> {
    csv_store::read_all(paths::data_file(&app, paths::ACCOUNTS_CSV)?)
}

#[tauri::command(rename_all = "snake_case")]
pub fn create_account(app: AppHandle, input: AccountInput) -> AppResult<Account> {
    let mut accounts = list_accounts(app.clone())?;

    let account = Account {
        id: Uuid::new_v4().to_string(),
        name: input.name,
        category: input.category,
        archived: input.archived,
        sort_order: input.sort_order,
    };

    accounts.push(account.clone());
    csv_store::write_all(paths::data_file(&app, paths::ACCOUNTS_CSV)?, &accounts)?;

    Ok(account)
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_account(app: AppHandle, id: String, input: AccountInput) -> AppResult<Account> {
    let mut accounts = list_accounts(app.clone())?;

    let account = accounts
        .iter_mut()
        .find(|account| account.id == id)
        .ok_or_else(|| AppError::NotFound(id.clone()))?;

    account.name = input.name;
    account.category = input.category;
    account.archived = input.archived;
    account.sort_order = input.sort_order;

    let updated = account.clone();

    csv_store::write_all(paths::data_file(&app, paths::ACCOUNTS_CSV)?, &accounts)?;

    Ok(updated)
}

/// Accounts are soft-deleted — transaction rows in `investments.csv` may
/// still reference the id, so history stays intact.
#[tauri::command(rename_all = "snake_case")]
pub fn archive_account(app: AppHandle, id: String) -> AppResult<()> {
    let mut accounts = list_accounts(app.clone())?;

    let account = accounts
        .iter_mut()
        .find(|account| account.id == id)
        .ok_or_else(|| AppError::NotFound(id.clone()))?;

    account.archived = true;

    csv_store::write_all(paths::data_file(&app, paths::ACCOUNTS_CSV)?, &accounts)?;

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn unarchive_account(app: AppHandle, id: String) -> AppResult<()> {
    let mut accounts = list_accounts(app.clone())?;

    let account = accounts
        .iter_mut()
        .find(|account| account.id == id)
        .ok_or_else(|| AppError::NotFound(id.clone()))?;

    account.archived = false;

    csv_store::write_all(paths::data_file(&app, paths::ACCOUNTS_CSV)?, &accounts)?;

    Ok(())
}
