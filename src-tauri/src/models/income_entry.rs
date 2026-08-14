use jiff::civil::Date;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IncomeEntry {
    pub id: String,
    pub date: Date,
    pub description: String,
    pub amount: f64,
    pub type_id: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct IncomeEntryInput {
    pub date: Date,
    pub description: String,
    pub amount: f64,
    pub type_id: String,
}
