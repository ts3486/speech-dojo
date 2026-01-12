use crate::services::storage::StorageService;
use sqlx::PgPool;
use std::sync::Arc;

#[derive(Clone)]
pub struct AppState {
    pub db: PgPool,
    pub storage: StorageService,
}

pub type SharedState = Arc<AppState>;

impl AppState {
    pub fn new(db: PgPool, storage: StorageService) -> SharedState {
        Arc::new(Self { db, storage })
    }
}
