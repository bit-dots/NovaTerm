use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct PortInfo {
    pub name: String,
    pub description: String,
    pub port_type: String,
}

pub fn list_ports() -> Result<Vec<PortInfo>, String> {
    let ports = serialport::available_ports().map_err(|e| e.to_string())?;
    let infos = ports
        .into_iter()
        .map(|p| {
            let (port_type, description) = match p.port_type {
                serialport::SerialPortType::UsbPort(info) => {
                    let desc = if info.product.is_some() {
                        info.product.clone()
                    } else {
                        info.manufacturer.clone()
                    };
                    ("USB".to_string(), desc.unwrap_or_default())
                }
                serialport::SerialPortType::PciPort => ("PCI".to_string(), String::new()),
                serialport::SerialPortType::BluetoothPort => {
                    ("Bluetooth".to_string(), String::new())
                }
                serialport::SerialPortType::Unknown => ("Unknown".to_string(), String::new()),
            };
            PortInfo { name: p.port_name, description, port_type }
        })
        .collect();
    Ok(infos)
}
