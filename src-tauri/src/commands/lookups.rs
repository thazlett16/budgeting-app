use tauri::AppHandle;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::models::lookup_item::{LookupItem, LookupItemInput};
use crate::storage::{csv_store, paths};

// `expense_categories.csv` and `income_types.csv` share an identical shape
// (see `models/lookup_item.rs`), so the CRUD logic is written once here and
// parameterized on file path; each domain gets its own `#[tauri::command]`
// so the frontend still calls distinct, domain-named commands.

fn list(app: &AppHandle, file_name: &str) -> AppResult<Vec<LookupItem>> {
    csv_store::read_all(paths::data_file(app, file_name)?)
}

fn create(app: &AppHandle, file_name: &str, input: LookupItemInput) -> AppResult<LookupItem> {
    let mut items = list(app, file_name)?;

    let item = LookupItem {
        id: Uuid::new_v4().to_string(),
        name: input.name,
        archived: input.archived,
        sort_order: input.sort_order,
    };

    items.push(item.clone());
    csv_store::write_all(paths::data_file(app, file_name)?, &items)?;

    Ok(item)
}

fn update(app: &AppHandle, file_name: &str, id: String, input: LookupItemInput) -> AppResult<LookupItem> {
    let mut items = list(app, file_name)?;

    let item = items
        .iter_mut()
        .find(|item| item.id == id)
        .ok_or_else(|| AppError::NotFound(id.clone()))?;

    item.name = input.name;
    item.archived = input.archived;
    item.sort_order = input.sort_order;

    let updated = item.clone();

    csv_store::write_all(paths::data_file(app, file_name)?, &items)?;

    Ok(updated)
}

/// Lookup items are soft-deleted — transaction rows may still reference the
/// id, so archiving hides it from new-entry dropdowns without breaking
/// history.
fn archive(app: &AppHandle, file_name: &str, id: String) -> AppResult<()> {
    let mut items = list(app, file_name)?;

    let item = items
        .iter_mut()
        .find(|item| item.id == id)
        .ok_or_else(|| AppError::NotFound(id.clone()))?;

    item.archived = true;

    csv_store::write_all(paths::data_file(app, file_name)?, &items)?;

    Ok(())
}

fn unarchive(app: &AppHandle, file_name: &str, id: String) -> AppResult<()> {
    let mut items = list(app, file_name)?;

    let item = items
        .iter_mut()
        .find(|item| item.id == id)
        .ok_or_else(|| AppError::NotFound(id.clone()))?;

    item.archived = false;

    csv_store::write_all(paths::data_file(app, file_name)?, &items)?;

    Ok(())
}

#[tauri::command(rename_all = "snake_case")]
pub fn list_expense_categories(app: AppHandle) -> AppResult<Vec<LookupItem>> {
    list(&app, paths::EXPENSE_CATEGORIES_CSV)
}

#[tauri::command(rename_all = "snake_case")]
pub fn create_expense_category(app: AppHandle, input: LookupItemInput) -> AppResult<LookupItem> {
    create(&app, paths::EXPENSE_CATEGORIES_CSV, input)
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_expense_category(app: AppHandle, id: String, input: LookupItemInput) -> AppResult<LookupItem> {
    update(&app, paths::EXPENSE_CATEGORIES_CSV, id, input)
}

#[tauri::command(rename_all = "snake_case")]
pub fn archive_expense_category(app: AppHandle, id: String) -> AppResult<()> {
    archive(&app, paths::EXPENSE_CATEGORIES_CSV, id)
}

#[tauri::command(rename_all = "snake_case")]
pub fn unarchive_expense_category(app: AppHandle, id: String) -> AppResult<()> {
    unarchive(&app, paths::EXPENSE_CATEGORIES_CSV, id)
}

#[tauri::command(rename_all = "snake_case")]
pub fn list_income_types(app: AppHandle) -> AppResult<Vec<LookupItem>> {
    list(&app, paths::INCOME_TYPES_CSV)
}

#[tauri::command(rename_all = "snake_case")]
pub fn create_income_type(app: AppHandle, input: LookupItemInput) -> AppResult<LookupItem> {
    create(&app, paths::INCOME_TYPES_CSV, input)
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_income_type(app: AppHandle, id: String, input: LookupItemInput) -> AppResult<LookupItem> {
    update(&app, paths::INCOME_TYPES_CSV, id, input)
}

#[tauri::command(rename_all = "snake_case")]
pub fn archive_income_type(app: AppHandle, id: String) -> AppResult<()> {
    archive(&app, paths::INCOME_TYPES_CSV, id)
}

#[tauri::command(rename_all = "snake_case")]
pub fn unarchive_income_type(app: AppHandle, id: String) -> AppResult<()> {
    unarchive(&app, paths::INCOME_TYPES_CSV, id)
}
