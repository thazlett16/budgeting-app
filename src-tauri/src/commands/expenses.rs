use tauri::AppHandle;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::models::expense_entry::{ExpenseEntry, ExpenseEntryInput};
use crate::storage::{csv_store, paths};

#[tauri::command]
pub fn list_expenses(app: AppHandle) -> AppResult<Vec<ExpenseEntry>> {
    csv_store::read_all(paths::data_file(&app, paths::EXPENSES_CSV)?)
}

#[tauri::command]
pub fn create_expense(app: AppHandle, input: ExpenseEntryInput) -> AppResult<ExpenseEntry> {
    let mut entries = list_expenses(app.clone())?;

    let entry = ExpenseEntry {
        id: Uuid::new_v4().to_string(),
        date: input.date,
        description: input.description,
        amount: input.amount,
        category_id: input.category_id,
    };

    entries.push(entry.clone());
    csv_store::write_all(paths::data_file(&app, paths::EXPENSES_CSV)?, &entries)?;

    Ok(entry)
}

#[tauri::command]
pub fn update_expense(app: AppHandle, id: String, input: ExpenseEntryInput) -> AppResult<ExpenseEntry> {
    let mut entries = list_expenses(app.clone())?;

    let entry = entries
        .iter_mut()
        .find(|entry| entry.id == id)
        .ok_or_else(|| AppError::NotFound(id.clone()))?;

    entry.date = input.date;
    entry.description = input.description;
    entry.amount = input.amount;
    entry.category_id = input.category_id;

    let updated = entry.clone();

    csv_store::write_all(paths::data_file(&app, paths::EXPENSES_CSV)?, &entries)?;

    Ok(updated)
}

#[tauri::command]
pub fn delete_expense(app: AppHandle, id: String) -> AppResult<()> {
    let mut entries = list_expenses(app.clone())?;
    let original_len = entries.len();

    entries.retain(|entry| entry.id != id);

    if entries.len() == original_len {
        return Err(AppError::NotFound(id));
    }

    csv_store::write_all(paths::data_file(&app, paths::EXPENSES_CSV)?, &entries)?;

    Ok(())
}
