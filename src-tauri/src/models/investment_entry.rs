use serde::{Deserialize, Serialize};

/// Gain $ / gain % are never stored here — they're derived from the
/// chronologically previous row per account, see `commands/investments.rs`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InvestmentEntry {
    pub id: String,
    pub date: String,
    pub account_id: String,
    pub balance: f64,
    pub contribution: f64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InvestmentEntryInput {
    pub date: String,
    pub account_id: String,
    pub balance: f64,
    pub contribution: f64,
}
