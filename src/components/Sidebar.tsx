import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { TabId } from "./ActivityBar";
import type { PortInfo, SerialConfig } from "../types";
import { BAUD_RATES, DATA_BITS_OPTIONS, STOP_BITS_OPTIONS, PARITY_OPTIONS } from "../types";
import CollapsibleSection from "./common/CollapsibleSection";

interface SidebarProps {
  activeTab: TabId;
  config: SerialConfig;
  onConfigChange: (config: SerialConfig) => void;
}

export default function Sidebar({ activeTab, config, onConfigChange }: SidebarProps) {
  const { t } = useTranslation();
  const [ports, setPorts] = useState<PortInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPorts = async () => {
    setLoading(true);
    try {
      const list = await invoke<PortInfo[]>("list_serial_ports");
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

  useEffect(() => {
    if (activeTab === "serial") {
      const id = setTimeout(() => {
        loadPorts();
      }, 0);
      return () => clearTimeout(id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateConfig = (partial: Partial<SerialConfig>) => {
    onConfigChange({ ...config, ...partial });
  };

  if (activeTab !== "serial") {
    return (
      <div className="flex w-60 flex-col border-r border-border bg-panel-alt">
        {activeTab === "settings" && (
          <>
            <div className="px-4 py-3 text-base font-semibold uppercase tracking-wider text-text-secondary">
              {t("settings.title")}
            </div>
            <div className="flex-1 px-4 py-2 text-base text-text-muted">
              {t("settings.language")} / {t("settings.theme")}
            </div>
          </>
        )}
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
      </CollapsibleSection>

      <CollapsibleSection title={t("sidebar.macros")} defaultOpen={false}>
        <div className="px-2 py-3 text-sm text-text-muted">{t("macro.empty")}</div>
      </CollapsibleSection>

      <CollapsibleSection title={t("sidebar.history")} defaultOpen={false}>
        <div className="px-2 py-3 text-sm text-text-muted">{t("send.history")}</div>
      </CollapsibleSection>

      <CollapsibleSection title={t("sidebar.advanced")} defaultOpen={false}>
        <div className="space-y-2 px-2 py-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t("serial.flow_control")}</span>
            <span className="text-sm text-text-muted">None</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t("serial.dtr")}</span>
            <span className="text-sm text-text-muted">—</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-secondary">{t("serial.rts")}</span>
            <span className="text-sm text-text-muted">—</span>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
