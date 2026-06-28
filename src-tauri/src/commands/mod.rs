use crate::serial::{self, LogEvent, PortInfo, SerialConfig, SerialError, SerialStatus, SerialState};

#[tauri::command]
pub fn list_serial_ports(show_pty: bool) -> Result<Vec<PortInfo>, SerialError> {
    serial::list_ports(show_pty)
}

#[tauri::command]
pub fn open_serial_port(
    config: SerialConfig,
    state: tauri::State<'_, SerialState>,
    app_handle: tauri::AppHandle,
) -> Result<(), SerialError> {
    serial::open(&config, &state, &app_handle)
}

#[tauri::command]
pub fn close_serial_port(state: tauri::State<'_, SerialState>) -> Result<(), SerialError> {
    serial::close(&state)
}

#[tauri::command]
pub fn get_serial_status(state: tauri::State<'_, SerialState>) -> SerialStatus {
    serial::get_status(&state)
}

#[tauri::command]
pub fn get_internal_logs(state: tauri::State<'_, SerialState>) -> Vec<LogEvent> {
    serial::get_internal_logs(&state)
}

#[tauri::command]
pub fn read_serial_data(state: tauri::State<'_, SerialState>) -> Result<Vec<u8>, SerialError> {
    serial::read_data(&state)
}

#[tauri::command]
pub fn write_serial_data(
    data: Vec<u8>,
    state: tauri::State<'_, SerialState>,
) -> Result<(), SerialError> {
    serial::write_data(&state, &data)
}

#[tauri::command]
pub fn set_dtr(enabled: bool, state: tauri::State<'_, SerialState>) -> Result<(), SerialError> {
    serial::set_dtr(&state, enabled)
}

#[tauri::command]
pub fn set_rts(enabled: bool, state: tauri::State<'_, SerialState>) -> Result<(), SerialError> {
    serial::set_rts(&state, enabled)
}

#[tauri::command]
pub fn read_cts(state: tauri::State<'_, SerialState>) -> Result<bool, SerialError> {
    serial::read_cts(&state)
}

#[tauri::command]
pub fn read_dsr(state: tauri::State<'_, SerialState>) -> Result<bool, SerialError> {
    serial::read_dsr(&state)
}