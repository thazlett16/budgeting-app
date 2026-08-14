use jiff::civil::Date;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ExpenseEntry {
    pub id: String,
    pub date: Date,
    pub description: String,
    pub amount: f64,
    pub category_id: String,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct ExpenseEntryInput {
    pub date: Date,
    pub description: String,
    pub amount: f64,
    pub category_id: String,
}
