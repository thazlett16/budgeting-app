use tauri::AppHandle;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::models::investment_entry::{InvestmentEntry, InvestmentEntryInput};
use crate::storage::{csv_store, paths};

#[tauri::command]
pub fn list_investment_entries(app: AppHandle) -> AppResult<Vec<InvestmentEntry>> {
    csv_store::read_all(paths::data_file(&app, paths::INVESTMENTS_CSV)?)
}

#[tauri::command]
pub fn create_investment_entry(app: AppHandle, input: InvestmentEntryInput) -> AppResult<InvestmentEntry> {
    let mut entries = list_investment_entries(app.clone())?;

    let entry = InvestmentEntry {
        id: Uuid::new_v4().to_string(),
        date: input.date,
        account_id: input.account_id,
        balance: input.balance,
        contribution: input.contribution,
    };

    entries.push(entry.clone());
    csv_store::write_all(paths::data_file(&app, paths::INVESTMENTS_CSV)?, &entries)?;

    Ok(entry)
}

#[tauri::command]
pub fn update_investment_entry(
    app: AppHandle,
    id: String,
    input: InvestmentEntryInput,
) -> AppResult<InvestmentEntry> {
    let mut entries = list_investment_entries(app.clone())?;

    let entry = entries
        .iter_mut()
        .find(|entry| entry.id == id)
        .ok_or_else(|| AppError::NotFound(id.clone()))?;

    entry.date = input.date;
    entry.account_id = input.account_id;
    entry.balance = input.balance;
    entry.contribution = input.contribution;

    let updated = entry.clone();

    csv_store::write_all(paths::data_file(&app, paths::INVESTMENTS_CSV)?, &entries)?;

    Ok(updated)
}

/// Transaction rows are hard-deleted (unlike lookup items) — there's no
/// history that needs to keep referencing a deleted snapshot.
#[tauri::command]
pub fn delete_investment_entry(app: AppHandle, id: String) -> AppResult<()> {
    let mut entries = list_investment_entries(app.clone())?;
    let original_len = entries.len();

    entries.retain(|entry| entry.id != id);

    if entries.len() == original_len {
        return Err(AppError::NotFound(id));
    }

    csv_store::write_all(paths::data_file(&app, paths::INVESTMENTS_CSV)?, &entries)?;

    Ok(())
}
