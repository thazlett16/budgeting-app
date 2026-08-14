use serde::{Deserialize, Serialize};

// Keep in sync with `src/common/account-categories.ts` — the single source
// of truth for this enum on the frontend.
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AccountCategory {
    Hsa,
    #[serde(rename = "401k")]
    FourOhOneK,
    #[serde(rename = "roth_401k")]
    RothFourOhOneK,
    Ira,
    RothIra,
    #[serde(rename = "401a")]
    FourOhOneA,
    #[serde(rename = "403b")]
    FourOhThreeB,
    #[serde(rename = "457b")]
    FourFiftySevenB,
    Savings,
    Checking,
    Hysa,
    Other,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct Account {
    pub id: String,
    pub name: String,
    pub category: AccountCategory,
    pub archived: bool,
    pub sort_order: i64,
}

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct AccountInput {
    pub name: String,
    pub category: AccountCategory,
    pub archived: bool,
    pub sort_order: i64,
}
