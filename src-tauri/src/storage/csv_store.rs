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

#[cfg(test)]
mod round_trip_tests {
    use super::*;
    use crate::models::investment_entry::InvestmentEntry;

    #[test]
    fn jiff_date_round_trips_through_csv() {
        let dir = std::env::temp_dir().join(format!("budgeting-app-roundtrip-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("investments.csv");

        let entries = vec![InvestmentEntry {
            id: "1".to_string(),
            date: "2026-08-13".parse().unwrap(),
            account_id: "acct-1".to_string(),
            balance: 1234.56,
            contribution: 100.0,
        }];

        write_all(&path, &entries).unwrap();
        let read_back: Vec<InvestmentEntry> = read_all(&path).unwrap();

        assert_eq!(read_back.len(), 1);
        assert_eq!(read_back[0].date, entries[0].date);
        assert_eq!(read_back[0].date.to_string(), "2026-08-13");

        std::fs::remove_dir_all(&dir).unwrap();
    }
}
