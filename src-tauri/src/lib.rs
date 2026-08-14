mod commands;
mod error;
mod models;
mod storage;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // WebKitGTK's DMA-BUF renderer renders a blank window against the NVIDIA
    // proprietary driver. Must be set before the webview initializes, so this
    // covers dev and production builds alike, unlike the dev-only env var in
    // package.json's `tauri:dev` script.
    #[cfg(target_os = "linux")]
    unsafe {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            storage::paths::ensure_data_dir(app.handle())?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::accounts::list_accounts,
            commands::accounts::create_account,
            commands::accounts::update_account,
            commands::accounts::archive_account,
            commands::lookups::list_expense_categories,
            commands::lookups::create_expense_category,
            commands::lookups::update_expense_category,
            commands::lookups::archive_expense_category,
            commands::lookups::list_income_types,
            commands::lookups::create_income_type,
            commands::lookups::update_income_type,
            commands::lookups::archive_income_type,
            commands::investments::list_investment_entries,
            commands::investments::create_investment_entry,
            commands::investments::update_investment_entry,
            commands::investments::delete_investment_entry,
            commands::expenses::list_expenses,
            commands::expenses::create_expense,
            commands::expenses::update_expense,
            commands::expenses::delete_expense,
            commands::income::list_income,
            commands::income::create_income,
            commands::income::update_income,
            commands::income::delete_income,
            commands::summary::get_investment_gains,
            commands::summary::get_net_worth_by_month,
            commands::summary::get_spending_by_category,
            commands::summary::get_income_by_type,
            commands::summary::get_dashboard_insights,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
