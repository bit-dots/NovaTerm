mod commands;
mod serial;

use serial::SerialState;
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .manage(SerialState::new())
        .setup(|app| {
            let state = app.state::<SerialState>();
            let handle = app.handle().clone();
            serial::start_port_monitor(&state, handle);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::list_serial_ports,
            commands::open_serial_port,
            commands::close_serial_port,
            commands::get_serial_status,
            commands::get_internal_logs,
            commands::read_serial_data,
            commands::write_serial_data,
            commands::set_dtr,
            commands::set_rts,
            commands::read_cts,
            commands::read_dsr,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}