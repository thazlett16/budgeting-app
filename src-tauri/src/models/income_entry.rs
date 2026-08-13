use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IncomeEntry {
    pub id: String,
    pub date: String,
    pub description: String,
    pub amount: f64,
    pub type_id: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct IncomeEntryInput {
    pub date: String,
    pub description: String,
    pub amount: f64,
    pub type_id: String,
}
