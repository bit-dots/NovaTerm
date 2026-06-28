import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "./Toast";
import type { TabId } from "./ActivityBar";
import type { PortInfo, SerialConfig } from "../types";
import { BAUD_RATES, DATA_BITS_OPTIONS, STOP_BITS_OPTIONS, PARITY_OPTIONS } from "../types";
import CollapsibleSection from "./common/CollapsibleSection";

interface SidebarProps {
  activeTab: TabId;
  config: SerialConfig;
  onConfigChange: (config: SerialConfig) => void;
  connected: boolean;
  onConnectChange: (connected: boolean) => void;
  dtrEnabled: boolean;
  onDtrChange: (enabled: boolean) => void;
  rtsEnabled: boolean;
  onRtsChange: (enabled: boolean) => void;
  showPtyPorts: boolean;
}

export default function Sidebar({
  activeTab,
  config,
  onConfigChange,
  connected,
  onConnectChange,
  dtrEnabled,
  onDtrChange,
  rtsEnabled,
  onRtsChange,
  showPtyPorts,
}: SidebarProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const loadPorts = async () => {
    setLoading(true);
    try {
      const list = await invoke<PortInfo[]>("list_serial_ports", { showPty: showPtyPorts });
      setPorts(list);
      if (list.length > 0 && !config.port_name) {
        onConfigChange({ ...config, port_name: list[0].name });
      }
    } catch (e) {
      console.error("Failed to list serial ports:", e);
      setPorts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (connected) {
      setConnecting(true);
      try {
        await invoke("close_serial_port");
        onConnectChange(false);
        onDtrChange(false);
        onRtsChange(false);
      } catch (e) {
        console.error("Failed to disconnect:", e);
        showToast(`${t("serial.disconnect_failed")}: ${e}`, "error");
      } finally {
        setConnecting(false);
      }
    } else {
      if (!config.port_name) return;
      setConnecting(true);
      try {
        await invoke("open_serial_port", { config });
        onConnectChange(true);
      } catch (e) {
        console.error("Failed to connect:", e);
        showToast(`${t("serial.connect_failed")}: ${e}`, "error");
      } finally {
        setConnecting(false);
      }
    }
  };

  useEffect(() => {
    if (activeTab === "serial") {
      const id = setTimeout(() => {
        loadPorts();
      }, 0);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, showPtyPorts]);

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!connected) return;

    const doReconnect = async () => {
      try {
        showToast(t("serial.reconnecting"), "info");
        await invoke("close_serial_port");
        onDtrChange(false);
        onRtsChange(false);
        await invoke("open_serial_port", { config });
        showToast(t("serial.reconnected"), "success");
      } catch (e) {
        console.error("Reconnect failed:", e);
        showToast(`${t("serial.reconnect_failed")}: ${e}`, "error");
      }
    };
    doReconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const updateConfig = (partial: Partial<SerialConfig>) => {
    onConfigChange({ ...config, ...partial });
  };

  if (activeTab !== "serial") {
    return (
      <div className="flex w-60 flex-col border-r border-border bg-panel-alt">
        {activeTab === "ssh" && null}
      </div>
    );
  }

  return (
    <div className="flex w-60 flex-col border-r border-border bg-panel-alt">
      <CollapsibleSection title={t("sidebar.connection")}>
        <div className="flex items-center gap-2 px-2 py-1">
          <span className="text-xs uppercase tracking-wide text-text-muted">
            {t("serial.port")}
          </span>
          <button
            onClick={loadPorts}
            disabled={loading}
            className="ml-auto rounded p-0.5 text-text-secondary hover:bg-border hover:text-text-primary disabled:opacity-50"
            title={t("serial.refresh")}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <select
          className="mx-2 mb-2 w-[calc(100%-16px)] rounded border border-border bg-panel px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
          value={config.port_name}
          onChange={(e) => updateConfig({ port_name: e.target.value })}
        >
          {ports.length === 0 ? (
            <option value="">{t("serial.no_ports")}</option>
          ) : (
            ports.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
                {p.description ? ` - ${p.description}` : ""}
              </option>
            ))
          )}
        </select>
        <div className="px-2 pb-2">
          <button
            onClick={handleConnect}
            disabled={connecting || (!connected && !config.port_name)}
            className={`w-full rounded px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              connected
                ? "bg-green-600/20 text-green-500 hover:bg-green-600/30"
                : "bg-accent/20 text-accent hover:bg-accent/30"
            }`}
          >
            {connecting ? "..." : connected ? t("serial.disconnect") : t("serial.connect")}
          </button>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("sidebar.parameters")} defaultOpen={false}>
        <div className="px-2 pb-2">
          <label className="mb-1 block text-xs text-text-muted">{t("serial.baud_rate")}</label>
          <select
            className="w-full rounded border border-border bg-panel px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
            value={config.baud_rate}
            onChange={(e) => updateConfig({ baud_rate: Number(e.target.value) })}
          >
            {BAUD_RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate.toLocaleString()}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 px-2 pb-2">
          <div>
            <label className="mb-1 block text-xs text-text-muted">{t("serial.data_bits")}</label>
            <select
              className="w-full rounded border border-border bg-panel px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              value={config.data_bits}
              onChange={(e) =>
                updateConfig({
                  data_bits: Number(e.target.value) as SerialConfig["data_bits"],
                })
              }
            >
              {DATA_BITS_OPTIONS.map((bits) => (
                <option key={bits} value={bits}>
                  {bits}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-muted">{t("serial.stop_bits")}</label>
            <select
              className="w-full rounded border border-border bg-panel px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
              value={config.stop_bits}
              onChange={(e) =>
                updateConfig({
                  stop_bits: Number(e.target.value) as SerialConfig["stop_bits"],
                })
              }
            >
              {STOP_BITS_OPTIONS.map((bits) => (
                <option key={bits} value={bits}>
                  {bits}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="px-2 pb-2">
          <label className="mb-1 block text-xs text-text-muted">{t("serial.parity")}</label>
          <select
            className="w-full rounded border border-border bg-panel px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
            value={config.parity}
            onChange={(e) => updateConfig({ parity: e.target.value as SerialConfig["parity"] })}
          >
            {PARITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="px-2 pb-2">
          <label className="mb-1 block text-xs text-text-muted">{t("serial.flow_control")}</label>
          <select
            className="w-full rounded border border-border bg-panel px-2 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
            value={config.flow_control}
            onChange={(e) =>
              updateConfig({ flow_control: e.target.value as SerialConfig["flow_control"] })
            }
          >
            <option value="none">None</option>
            <option value="rts-cts">RTS/CTS</option>
            <option value="xon-xoff">XON/XOFF</option>
          </select>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={t("sidebar.signals")} defaultOpen={false}>
        <div className="space-y-2 px-2 py-1">
          <div
            className={`flex items-center justify-between ${
              connected ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            }`}
            onClick={
              connected
                ? async () => {
                    const next = !dtrEnabled;
                    onDtrChange(next);
                    try {
                      await invoke("set_dtr", { enabled: next });
                    } catch {
                      onDtrChange(!next);
                    }
                  }
                : undefined
            }
          >
            <span className="text-sm text-text-secondary">{t("serial.dtr")}</span>
            <div
              className={`h-5 w-9 rounded-full transition-colors ${
                dtrEnabled ? "bg-accent" : "bg-border"
              }`}
            >
              <div
                className={`ml-0.5 mt-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  dtrEnabled ? "translate-x-4" : ""
                }`}
              />
            </div>
          </div>

          <div
            className={`flex items-center justify-between ${
              connected ? "cursor-pointer" : "cursor-not-allowed opacity-50"
            }`}
            onClick={
              connected
                ? async () => {
                    const next = !rtsEnabled;
                    onRtsChange(next);
                    try {
                      await invoke("set_rts", { enabled: next });
                    } catch {
                      onRtsChange(!next);
                    }
                  }
                : undefined
            }
          >
            <span className="text-sm text-text-secondary">{t("serial.rts")}</span>
            <div
              className={`h-5 w-9 rounded-full transition-colors ${
                rtsEnabled ? "bg-accent" : "bg-border"
              }`}
            >
              <div
                className={`ml-0.5 mt-0.5 h-4 w-4 rounded-full bg-white transition-transform ${
                  rtsEnabled ? "translate-x-4" : ""
                }`}
              />
            </div>
          </div>
          {!connected && <p className="text-xs text-text-muted">{t("serial.connect_first")}</p>}
        </div>
      </CollapsibleSection>
    </div>
  );
}
