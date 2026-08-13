use std::path::Path;

use serde::{de::DeserializeOwned, Serialize};

use crate::error::{AppError, AppResult};

/// Generic typed CSV read/write helper. Whole-file read/rewrite is fine at
/// this data scale (personal finance data for one person is small) — don't
/// build incremental/streaming writes unless it's ever actually needed.
pub fn read_all<T: DeserializeOwned>(path: impl AsRef<Path>) -> AppResult<Vec<T>> {
    let path = path.as_ref();

    if !path.exists() {
        return Ok(Vec::new());
    }

    let mut reader = csv::Reader::from_path(path)?;
    let mut rows = Vec::new();

    for (index, record) in reader.deserialize::<T>().enumerate() {
        let record = record.map_err(|source| AppError::CsvParse {
            row: index + 2, // +1 for header row, +1 for 1-indexing
            message: source.to_string(),
        })?;

        rows.push(record);
    }

    Ok(rows)
}

pub fn write_all<T: Serialize>(path: impl AsRef<Path>, rows: &[T]) -> AppResult<()> {
    let path = path.as_ref();

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let mut writer = csv::Writer::from_path(path)?;

    for row in rows {
        writer.serialize(row)?;
    }

    writer.flush()?;

    Ok(())
}

impl From<csv::Error> for AppError {
    fn from(source: csv::Error) -> Self {
        AppError::CsvParse {
            row: source.position().map(|p| p.line() as usize).unwrap_or(0),
            message: source.to_string(),
        }
    }
}
