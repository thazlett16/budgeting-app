use serde::{Deserialize, Serialize};

/// Shared shape backing both `expense_categories.csv` and `income_types.csv`
/// — see `commands/lookups.rs`, which parameterizes on file path rather than
/// duplicating this struct per domain.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LookupItem {
    pub id: String,
    pub name: String,
    pub archived: bool,
    pub sort_order: i64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LookupItemInput {
    pub name: String,
    pub archived: bool,
    pub sort_order: i64,
}
