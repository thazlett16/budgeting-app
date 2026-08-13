use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountCategory {
    Hsa,
    #[serde(rename = "401k")]
    FourOhOneK,
    RothIra,
    Hysa,
    Checking,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Account {
    pub id: String,
    pub name: String,
    pub category: AccountCategory,
    pub archived: bool,
    pub sort_order: i64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AccountInput {
    pub name: String,
    pub category: AccountCategory,
    pub archived: bool,
    pub sort_order: i64,
}
