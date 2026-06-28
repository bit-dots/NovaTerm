export interface PortInfo {
  name: string;
  description: string;
  port_type: string;
}

export interface SerialConfig {
  port_name: string;
  baud_rate: number;
  data_bits: 5 | 6 | 7 | 8;
  stop_bits: 1 | 2;
  parity: "none" | "even" | "odd";
  flow_control: "none" | "rts-cts" | "xon-xoff";
}

export interface SerialStatus {
  connected: boolean;
  port_name: string | null;
}

export interface SerialError {
  code: string;
  message: string;
}

export interface PortChangeEvent {
  port_name: string;
  description: string;
  port_type: string;
}

export interface LogEntry {
  id: number;
  type: "rx" | "tx";
  timestamp: string;
  data: number[];
  text: string;
}

export const DEFAULT_CONFIG: SerialConfig = {
  port_name: "",
  baud_rate: 115200,
  data_bits: 8,
  stop_bits: 1,
  parity: "none",
  flow_control: "none",
};

export const BAUD_RATES = [
  300, 1200, 2400, 4800, 9600, 14400, 19200, 28800, 38400, 57600, 115200, 230400, 460800, 921600,
];

export const DATA_BITS_OPTIONS = [5, 6, 7, 8] as const;

export const STOP_BITS_OPTIONS = [1, 2] as const;

export const PARITY_OPTIONS = [
  { value: "none", label: "None" },
  { value: "even", label: "Even" },
  { value: "odd", label: "Odd" },
] as const;

export interface Macro {
  id: string;
  name: string;
  command: string;
}

export interface AppSettings {
  theme: "dark" | "light";
  language: "zh" | "en";
  maxLines: number;
  logFontSize: number;
  defaultEncoding: "utf-8" | "gb2312" | "latin-1";
  macros: Macro[];
  showPtyPorts: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  language: "zh",
  maxLines: 10000,
  logFontSize: 12,
  defaultEncoding: "utf-8",
  macros: [],
  showPtyPorts: false,
};
