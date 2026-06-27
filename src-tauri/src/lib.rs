mod commands;
mod serial;

use serial::SerialState;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(SerialState::new())
        .invoke_handler(tauri::generate_handler![
            commands::list_serial_ports,
            commands::open_serial_port,
            commands::close_serial_port,
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