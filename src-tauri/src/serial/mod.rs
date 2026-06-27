use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::Duration;

#[derive(Debug, Clone, Serialize)]
pub struct PortInfo {
    pub name: String,
    pub description: String,
    pub port_type: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct SerialConfig {
    pub port_name: String,
    pub baud_rate: u32,
    pub data_bits: u8,
    pub stop_bits: u8,
    pub parity: String,
    pub flow_control: String,
}

pub struct SerialState {
    pub port: Mutex<Option<Box<dyn serialport::SerialPort>>>,
    pub port_name: Mutex<Option<String>>,
}

impl SerialState {
    pub fn new() -> Self {
        Self { port: Mutex::new(None), port_name: Mutex::new(None) }
    }
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

pub fn open(config: &SerialConfig) -> Result<Box<dyn serialport::SerialPort>, String> {
    let data_bits = match config.data_bits {
        5 => serialport::DataBits::Five,
        6 => serialport::DataBits::Six,
        7 => serialport::DataBits::Seven,
        8 => serialport::DataBits::Eight,
        _ => return Err(format!("无效的数据位: {}", config.data_bits)),
    };

    let stop_bits = match config.stop_bits {
        1 => serialport::StopBits::One,
        2 => serialport::StopBits::Two,
        _ => return Err(format!("无效的停止位: {}", config.stop_bits)),
    };

    let parity = match config.parity.to_lowercase().as_str() {
        "none" => serialport::Parity::None,
        "even" => serialport::Parity::Even,
        "odd" => serialport::Parity::Odd,
        _ => return Err(format!("无效的校验位: {}", config.parity)),
    };

    let flow_control = match config.flow_control.to_lowercase().as_str() {
        "none" => serialport::FlowControl::None,
        "rts-cts" => serialport::FlowControl::Hardware,
        "xon-xoff" => serialport::FlowControl::Software,
        _ => return Err(format!("无效的流控: {}", config.flow_control)),
    };

    let port = serialport::new(&config.port_name, config.baud_rate)
        .data_bits(data_bits)
        .stop_bits(stop_bits)
        .parity(parity)
        .flow_control(flow_control)
        .timeout(Duration::from_millis(10))
        .open()
        .map_err(|e| e.to_string())?;

    Ok(port)
}

pub fn close(state: &SerialState) -> Result<(), String> {
    let mut port = state.port.lock().map_err(|e| e.to_string())?;
    *port = None;
    let mut name = state.port_name.lock().map_err(|e| e.to_string())?;
    *name = None;
    Ok(())
}

pub fn set_dtr(state: &SerialState, enabled: bool) -> Result<(), String> {
    let mut port = state.port.lock().map_err(|e| e.to_string())?;
    let port = port.as_mut().ok_or("串口未打开")?;
    port.write_data_terminal_ready(enabled)
        .map_err(|e| e.to_string())
}

pub fn set_rts(state: &SerialState, enabled: bool) -> Result<(), String> {
    let mut port = state.port.lock().map_err(|e| e.to_string())?;
    let port = port.as_mut().ok_or("串口未打开")?;
    port.write_request_to_send(enabled)
        .map_err(|e| e.to_string())
}

pub fn read_cts(state: &SerialState) -> Result<bool, String> {
    let mut port = state.port.lock().map_err(|e| e.to_string())?;
    let port = port.as_mut().ok_or("串口未打开")?;
    port.read_clear_to_send().map_err(|e| e.to_string())
}

pub fn read_dsr(state: &SerialState) -> Result<bool, String> {
    let mut port = state.port.lock().map_err(|e| e.to_string())?;
    let port = port.as_mut().ok_or("串口未打开")?;
    port.read_data_set_ready().map_err(|e| e.to_string())
}