use crate::serial::{self, PortInfo};

#[tauri::command]
pub fn list_serial_ports() -> Result<Vec<PortInfo>, String> {
    serial::list_ports()
}
