use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExpenseEntry {
    pub id: String,
    pub date: String,
    pub description: String,
    pub amount: f64,
    pub category_id: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ExpenseEntryInput {
    pub date: String,
    pub description: String,
    pub amount: f64,
    pub category_id: String,
}
