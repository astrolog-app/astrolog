// the `Database` type, connection setup and shared sql helpers live in `database`;
// the schema (migration list) in `schema`. each per-entity submodule below adds
// its own `impl Database` block plus row mappers
mod bias_frames;
mod dark_flat_frames;
mod dark_frames;
mod database;
mod equipment;
mod flat_frames;
mod light_frames;
mod schema;

pub use database::Database;
pub(crate) use database::{parse_opt_uuid, parse_uuid};
