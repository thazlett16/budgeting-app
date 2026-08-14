use jiff::civil::Date;
use serde::{Deserialize, Serialize};

/// Inclusive on both ends: an entry dated exactly `start` or exactly `end`
/// is included in the range.
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub struct DateRange {
    pub start: Date,
    pub end: Date,
}

impl DateRange {
    pub fn contains(&self, date: Date) -> bool {
        date >= self.start && date <= self.end
    }
}
