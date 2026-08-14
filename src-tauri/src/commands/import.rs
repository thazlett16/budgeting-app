use std::collections::HashSet;

use csv::{ReaderBuilder, WriterBuilder};
use tauri::AppHandle;
use tauri_plugin_dialog::DialogExt;
use uuid::Uuid;

use crate::error::{AppError, AppResult};
use crate::models::lookup_item::LookupItem;
use crate::storage::{csv_store, paths};

use super::export::save_via_dialog;

#[derive(serde::Deserialize)]
struct PresetRow {
    name: String,
}

/// Single-column `name` CSV — matches what a user maintains in a
/// spreadsheet and what `upload` accepts back (`05-export-plan.md` §5).
fn preset_csv(names: &[&str]) -> AppResult<String> {
    let mut writer = WriterBuilder::new().from_writer(vec![]);
    writer.write_record(["name"])?;

    for name in names {
        writer.write_record([*name])?;
    }

    let bytes = writer
        .into_inner()
        .map_err(|source| std::io::Error::other(source.to_string()))?;

    Ok(String::from_utf8(bytes).expect("csv writer only ever writes the utf-8 names given to it"))
}

#[derive(Debug)]
struct RowError {
    row: usize,
    message: String,
}

/// Validates every row before returning anything — an upload either
/// replaces the whole lookup list or changes nothing, never partially.
fn parse_and_validate(content: &str) -> Result<Vec<LookupItem>, Vec<RowError>> {
    let mut reader = ReaderBuilder::new().from_reader(content.as_bytes());
    let mut errors = Vec::new();
    let mut seen = HashSet::new();
    let mut items = Vec::new();

    for (index, record) in reader.deserialize::<PresetRow>().enumerate() {
        let row = index + 2; // +1 for header row, +1 for 1-indexing

        match record {
            Ok(row_data) => {
                let name = row_data.name.trim().to_string();

                if name.is_empty() {
                    errors.push(RowError { row, message: "name is blank".to_string() });
                    continue;
                }

                if !seen.insert(name.to_lowercase()) {
                    errors.push(RowError { row, message: format!("duplicate name \"{name}\"") });
                    continue;
                }

                items.push(LookupItem {
                    id: Uuid::new_v4().to_string(),
                    name,
                    archived: false,
                    sort_order: items.len() as i64,
                });
            }
            Err(source) => errors.push(RowError { row, message: source.to_string() }),
        }
    }

    if errors.is_empty() {
        Ok(items)
    } else {
        Err(errors)
    }
}

fn upload(app: &AppHandle, file_name: &str) -> AppResult<Option<usize>> {
    let Some(file_path) = app.dialog().file().add_filter("CSV", &["csv"]).blocking_pick_file() else {
        return Ok(None);
    };

    let path = file_path
        .into_path()
        .map_err(|source| std::io::Error::other(source.to_string()))?;
    let content = std::fs::read_to_string(&path)?;

    let items = parse_and_validate(&content).map_err(|errors| {
        let joined = errors
            .iter()
            .map(|error| format!("row {}: {}", error.row, error.message))
            .collect::<Vec<_>>()
            .join("; ");

        AppError::Validation(joined)
    })?;

    let count = items.len();
    csv_store::write_all(paths::data_file(app, file_name)?, &items)?;

    Ok(Some(count))
}

#[tauri::command(rename_all = "snake_case")]
pub async fn download_expense_categories_preset(app: AppHandle) -> AppResult<Option<String>> {
    let content = preset_csv(paths::PRESET_EXPENSE_CATEGORIES)?;
    save_via_dialog(&app, "expense-categories-preset.csv", "csv", &content)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn download_income_types_preset(app: AppHandle) -> AppResult<Option<String>> {
    let content = preset_csv(paths::PRESET_INCOME_TYPES)?;
    save_via_dialog(&app, "income-types-preset.csv", "csv", &content)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn upload_expense_categories(app: AppHandle) -> AppResult<Option<usize>> {
    upload(&app, paths::EXPENSE_CATEGORIES_CSV)
}

#[tauri::command(rename_all = "snake_case")]
pub async fn upload_income_types(app: AppHandle) -> AppResult<Option<usize>> {
    upload(&app, paths::INCOME_TYPES_CSV)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn preset_csv_writes_a_name_header_and_one_row_per_preset() {
        let csv = preset_csv(&["Housing", "Groceries"]).unwrap();

        assert_eq!(csv, "name\nHousing\nGroceries\n");
    }

    #[test]
    fn parse_and_validate_rejects_blank_and_duplicate_names_without_writing_anything() {
        let result = parse_and_validate("name\nGroceries\n   \nGroceries\n");

        let errors = result.unwrap_err();

        assert_eq!(errors.len(), 2);
        assert_eq!(errors[0].row, 3);
        assert_eq!(errors[1].row, 4);
    }

    #[test]
    fn parse_and_validate_accepts_a_clean_list() {
        let items = parse_and_validate("name\nHousing\nGroceries\n").unwrap();

        assert_eq!(items.len(), 2);
        assert_eq!(items[0].name, "Housing");
        assert_eq!(items[0].sort_order, 0);
        assert_eq!(items[1].sort_order, 1);
    }
}
