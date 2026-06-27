use serde::{Deserialize, Serialize};
use std::io::Read;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::Emitter;

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

#[derive(Debug, Clone, Serialize)]
pub struct PortChangeEvent {
    pub port_name: String,
    pub description: String,
    pub port_type: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct SerialStatus {
    pub connected: bool,
    pub port_name: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct DataReceivedEvent {
    pub data: Vec<u8>,
}

#[derive(Debug, Clone, Serialize)]
pub struct StatusChangedEvent {
    pub connected: bool,
    pub port_name: String,
    pub error: Option<String>,
}

#[allow(dead_code)]
#[derive(Debug, Clone, Serialize)]
pub struct SerialError {
    pub code: String,
    pub message: String,
}

impl SerialError {
    pub fn new(code: &str, message: &str) -> Self {
        Self { code: code.to_string(), message: message.to_string() }
    }

    pub fn port_not_connected() -> Self {
        Self::new("PORT_NOT_CONNECTED", "串口未打开")
    }

    pub fn invalid_config(msg: &str) -> Self {
        Self::new("INVALID_CONFIG", msg)
    }

    pub fn io_error(msg: &str) -> Self {
        Self::new("IO_ERROR", msg)
    }

    pub fn internal(msg: &str) -> Self {
        Self::new("INTERNAL", msg)
    }
}

pub struct SerialState {
    pub port: Arc<Mutex<Option<Box<dyn serialport::SerialPort>>>>,
    pub port_name: Mutex<Option<String>>,
    pub rx: Mutex<Option<crossbeam_channel::Receiver<Vec<u8>>>>,
    pub read_handle: Mutex<Option<std::thread::JoinHandle<()>>>,
    pub monitor_running: Arc<AtomicBool>,
    pub monitor_handle: Mutex<Option<std::thread::JoinHandle<()>>>,
}

impl SerialState {
    pub fn new() -> Self {
        Self {
            port: Arc::new(Mutex::new(None)),
            port_name: Mutex::new(None),
            rx: Mutex::new(None),
            read_handle: Mutex::new(None),
            monitor_running: Arc::new(AtomicBool::new(false)),
            monitor_handle: Mutex::new(None),
        }
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

pub fn open(
    config: &SerialConfig,
    state: &SerialState,
    app_handle: &tauri::AppHandle,
) -> Result<(), String> {
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

    let (tx, rx) = crossbeam_channel::bounded::<Vec<u8>>(256);
    let port_arc = Arc::clone(&state.port);
    let port_name = config.port_name.clone();
    let port_name_for_thread = port_name.clone();
    let app_handle_clone = app_handle.clone();

    // 存入串口对象
    {
        let mut locked = state.port.lock().map_err(|e| e.to_string())?;
        *locked = Some(port);
    }

    // 发射连接成功事件
    let _ = app_handle.emit(
        "serial:status-changed",
        StatusChangedEvent {
            connected: true,
            port_name: port_name.clone(),
            error: None,
        },
    );

    let handle = std::thread::spawn(move || {
        let mut buf = vec![0u8; 4096];
        loop {
            let mut port_guard = match port_arc.lock() {
                Ok(g) => g,
                Err(_) => {
                    let _ = app_handle_clone.emit(
                        "serial:status-changed",
                        StatusChangedEvent {
                            connected: false,
                            port_name: port_name_for_thread.clone(),
                            error: Some("内部错误: 锁获取失败".into()),
                        },
                    );
                    break;
                }
            };
            let port = match port_guard.as_mut() {
                Some(p) => p,
                None => {
                    let _ = app_handle_clone.emit(
                        "serial:status-changed",
                        StatusChangedEvent {
                            connected: false,
                            port_name: port_name_for_thread.clone(),
                            error: None,
                        },
                    );
                    break;
                }
            };
            match port.read(&mut buf) {
                Ok(n) if n > 0 => {
                    let data = buf[..n].to_vec();
                    drop(port_guard);
                    let _ = app_handle_clone.emit(
                        "serial:data-received",
                        DataReceivedEvent { data: data.clone() },
                    );
                    if tx.send(data).is_err() {
                        break;
                    }
                }
                Ok(_) => {
                    drop(port_guard);
                    std::thread::sleep(Duration::from_millis(1));
                }
                Err(e) => {
                    drop(port_guard);
                    let _ = app_handle_clone.emit(
                        "serial:status-changed",
                        StatusChangedEvent {
                            connected: false,
                            port_name: port_name_for_thread.clone(),
                            error: Some(format!("读取错误: {}", e)),
                        },
                    );
                    break;
                }
            }
        }
    });

    *state.rx.lock().map_err(|e| e.to_string())? = Some(rx);
    *state.read_handle.lock().map_err(|e| e.to_string())? = Some(handle);
    *state.port_name.lock().map_err(|e| e.to_string())? = Some(port_name);

    Ok(())
}

pub fn read_data(state: &SerialState) -> Result<Vec<u8>, String> {
    let rx = state.rx.lock().map_err(|e| e.to_string())?;
    let rx = rx.as_ref().ok_or("串口未打开")?;
    let mut result = Vec::new();
    while let Ok(chunk) = rx.try_recv() {
        result.extend_from_slice(&chunk);
    }
    Ok(result)
}

pub fn write_data(state: &SerialState, data: &[u8]) -> Result<(), String> {
    let mut port = state.port.lock().map_err(|e| e.to_string())?;
    let port = port.as_mut().ok_or("串口未打开")?;
    port.write_all(data).map_err(|e| e.to_string())
}

pub fn get_status(state: &SerialState) -> SerialStatus {
    let name = state.port_name.lock().ok().and_then(|n| n.clone());
    SerialStatus { connected: name.is_some(), port_name: name }
}

pub fn close(state: &SerialState) -> Result<(), String> {
    // 将 port 置为 None，后台读取线程会检测到并退出
    {
        let mut port = state.port.lock().map_err(|e| e.to_string())?;
        *port = None;
    }

    // 等待读取线程结束
    if let Ok(mut handle) = state.read_handle.lock() {
        if let Some(h) = handle.take() {
            let _ = h.join();
        }
    }

    // 清空接收端
    if let Ok(mut rx) = state.rx.lock() {
        *rx = None;
    }

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

pub fn start_port_monitor(state: &SerialState, app_handle: tauri::AppHandle) {
    state.monitor_running.store(true, Ordering::SeqCst);
    let running = Arc::clone(&state.monitor_running);

    let handle = std::thread::spawn(move || {
        let mut prev_names: Vec<String> = Vec::new();

        while running.load(Ordering::SeqCst) {
            std::thread::sleep(Duration::from_secs(2));

            if let Ok(ports) = serialport::available_ports() {
                let current: Vec<String> =
                    ports.iter().map(|p| p.port_name.clone()).collect();

                for name in &current {
                    if !prev_names.contains(name) {
                        if let Some(info) = ports.iter().find(|p| p.port_name == *name) {
                            let (port_type, description) =
                                match &info.port_type {
                                    serialport::SerialPortType::UsbPort(u) => {
                                        let desc = u.product
                                            .clone()
                                            .or_else(|| u.manufacturer.clone())
                                            .unwrap_or_default();
                                        ("USB".to_string(), desc)
                                    }
                                    serialport::SerialPortType::PciPort => {
                                        ("PCI".to_string(), String::new())
                                    }
                                    serialport::SerialPortType::BluetoothPort => {
                                        ("Bluetooth".to_string(), String::new())
                                    }
                                    serialport::SerialPortType::Unknown => {
                                        ("Unknown".to_string(), String::new())
                                    }
                                };
                            let _ = app_handle.emit(
                                "serial:port-added",
                                PortChangeEvent {
                                    port_name: name.clone(),
                                    description,
                                    port_type,
                                },
                            );
                        }
                    }
                }

                for name in &prev_names {
                    if !current.contains(name) {
                        let _ = app_handle.emit(
                            "serial:port-removed",
                            PortChangeEvent {
                                port_name: name.clone(),
                                description: String::new(),
                                port_type: String::new(),
                            },
                        );
                    }
                }

                prev_names = current;
            }
        }
    });

    if let Ok(mut guard) = state.monitor_handle.lock() {
        *guard = Some(handle);
    }
}

#[allow(dead_code)]
pub fn stop_port_monitor(state: &SerialState) {
    state.monitor_running.store(false, Ordering::SeqCst);
    if let Ok(mut guard) = state.monitor_handle.lock() {
        if let Some(handle) = guard.take() {
            let _ = handle.join();
        }
    }
}