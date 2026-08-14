use tauri::AppHandle;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::models::income_entry::{IncomeEntry, IncomeEntryInput};
use crate::storage::{csv_store, paths};

#[tauri::command(rename_all = "snake_case")]
pub fn list_income(app: AppHandle) -> AppResult<Vec<IncomeEntry>> {
    csv_store::read_all(paths::data_file(&app, paths::INCOME_CSV)?)
}

#[tauri::command(rename_all = "snake_case")]
pub fn create_income(app: AppHandle, input: IncomeEntryInput) -> AppResult<IncomeEntry> {
    let mut entries = list_income(app.clone())?;

    let entry = IncomeEntry {
        id: Uuid::new_v4().to_string(),
        date: input.date,
        description: input.description,
        amount: input.amount,
        type_id: input.type_id,
    };

    entries.push(entry.clone());
    csv_store::write_all(paths::data_file(&app, paths::INCOME_CSV)?, &entries)?;

    Ok(entry)
}

#[tauri::command(rename_all = "snake_case")]
pub fn update_income(app: AppHandle, id: String, input: IncomeEntryInput) -> AppResult<IncomeEntry> {
    let mut entries = list_income(app.clone())?;

    let entry = entries
        .iter_mut()
        .find(|entry| entry.id == id)
        .ok_or_else(|| AppError::NotFound(id.clone()))?;

    entry.date = input.date;
    entry.description = input.description;
    entry.amount = input.amount;
    entry.type_id = input.type_id;

    let updated = entry.clone();

    csv_store::write_all(paths::data_file(&app, paths::INCOME_CSV)?, &entries)?;

    Ok(updated)
}

#[tauri::command(rename_all = "snake_case")]
pub fn delete_income(app: AppHandle, id: String) -> AppResult<()> {
    let mut entries = list_income(app.clone())?;
    let original_len = entries.len();

    entries.retain(|entry| entry.id != id);

    if entries.len() == original_len {
        return Err(AppError::NotFound(id));
    }

    csv_store::write_all(paths::data_file(&app, paths::INCOME_CSV)?, &entries)?;

    Ok(())
}
