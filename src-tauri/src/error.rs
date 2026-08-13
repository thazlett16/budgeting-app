use serde::Serialize;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),

    #[error("csv error at row {row}: {message}")]
    CsvParse { row: usize, message: String },

    #[error("validation error: {0}")]
    Validation(String),

    #[error("not found: {0}")]
    NotFound(String),

    #[error("tauri error: {0}")]
    Tauri(#[from] tauri::Error),
}

// Tauri commands return errors as structured JSON to the frontend, not a
// bare string, so the UI can branch on `kind` instead of parsing messages.
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        use serde::ser::SerializeStruct;

        let mut state = serializer.serialize_struct("AppError", 2)?;

        let kind = match self {
            AppError::Io(_) => "io",
            AppError::CsvParse { .. } => "csv_parse",
            AppError::Validation(_) => "validation",
            AppError::NotFound(_) => "not_found",
            AppError::Tauri(_) => "tauri",
        };

        state.serialize_field("kind", kind)?;
        state.serialize_field("message", &self.to_string())?;
        state.end()
    }
}

pub type AppResult<T> = Result<T, AppError>;
