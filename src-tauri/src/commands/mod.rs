use crate::serial::{self, PortInfo, SerialConfig, SerialState};

#[tauri::command]
pub fn list_serial_ports() -> Result<Vec<PortInfo>, String> {
    serial::list_ports()
}

#[tauri::command]
pub fn open_serial_port(
    config: SerialConfig,
    state: tauri::State<'_, SerialState>,
) -> Result<(), String> {
    serial::open(&config, &state)
}

#[tauri::command]
pub fn close_serial_port(state: tauri::State<'_, SerialState>) -> Result<(), String> {
    serial::close(&state)
}

#[tauri::command]
pub fn read_serial_data(state: tauri::State<'_, SerialState>) -> Result<Vec<u8>, String> {
    serial::read_data(&state)
}

#[tauri::command]
pub fn set_dtr(enabled: bool, state: tauri::State<'_, SerialState>) -> Result<(), String> {
    serial::set_dtr(&state, enabled)
}

#[tauri::command]
pub fn set_rts(enabled: bool, state: tauri::State<'_, SerialState>) -> Result<(), String> {
    serial::set_rts(&state, enabled)
}

#[tauri::command]
pub fn read_cts(state: tauri::State<'_, SerialState>) -> Result<bool, String> {
    serial::read_cts(&state)
}

#[tauri::command]
pub fn read_dsr(state: tauri::State<'_, SerialState>) -> Result<bool, String> {
    serial::read_dsr(&state)
}