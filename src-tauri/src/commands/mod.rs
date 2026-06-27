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
    let port = serial::open(&config)?;
    let mut locked = state.port.lock().map_err(|e| e.to_string())?;
    *locked = Some(port);
    let mut name = state.port_name.lock().map_err(|e| e.to_string())?;
    *name = Some(config.port_name);
    Ok(())
}

#[tauri::command]
pub fn close_serial_port(state: tauri::State<'_, SerialState>) -> Result<(), String> {
    serial::close(&state)
}