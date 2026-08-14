use serde::{Deserialize, Serialize};

/// Bump when a backup-breaking change is made to the CSV schemas so
/// `import_backup` can detect and reject a backup newer than this app
/// understands, rather than failing silently on unrecognized fields.
pub const CURRENT_SCHEMA_VERSION: u32 = 1;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct Meta {
    pub schema_version: u32,
}
