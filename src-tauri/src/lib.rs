mod commands;
mod error;
mod models;
mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            storage::paths::ensure_data_dir(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![commands::accounts::list_accounts])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
