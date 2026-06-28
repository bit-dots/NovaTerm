import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Circle, Unplug, Plug, Sun, Moon, Send, ArrowDown, ArrowUp } from "lucide-react";

interface StatusBarProps {
  showSend: boolean;
  onToggleSend: () => void;
  connected: boolean;
  portName: string;
  baudRate: number;
  txCount: number;
  rxCount: number;
  flowControl: string;
  dtrEnabled: boolean;
  rtsEnabled: boolean;
}

export default function StatusBar({
  showSend,
  onToggleSend,
  connected,
  portName,
  baudRate,
  txCount,
  rxCount,
  flowControl,
  dtrEnabled,
  rtsEnabled,
}: StatusBarProps) {
  const { t } = useTranslation();
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.remove("light");
    } else {
      root.classList.add("light");
    }
  }, [dark]);

  return (
    <div
      className="flex h-7 items-center gap-3 border-t border-border bg-panel text-xs text-[#ffffff]"
      style={{ paddingLeft: 15, paddingRight: 15 }}
    >
      <div className="flex items-center gap-1.5">
        {connected ? (
          <>
            <Plug size={15} className="text-green-400" />
            <span className="text-green-400">{t("status.connected")}</span>
          </>
        ) : (
          <>
            <Unplug size={15} />
            <span>{t("status.disconnected")}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <span>{t("status.tx")}</span>
        <ArrowUp size={12} />
        <span className="text-green-400">{txCount}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span>{t("status.rx")}</span>
        <ArrowDown size={12} />
        <span className="text-blue-400">{rxCount}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-muted">{t("serial.flow_control")}</span>
        <span>{flowControl === "none" ? "None" : flowControl.toUpperCase()}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-muted">DTR</span>
        <Circle size={8} className={dtrEnabled ? "text-green-400" : "text-text-muted"} />
      </div>

      <div className="flex items-center gap-1.5">
        <span className="text-xs text-text-muted">RTS</span>
        <Circle size={8} className={rtsEnabled ? "text-green-400" : "text-text-muted"} />
      </div>

      <button
        className="flex items-center gap-1 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
        onClick={onToggleSend}
        title={showSend ? t("send.collapse") : t("send.title")}
      >
        <Send size={15} />
        <span>{t("send.title")}</span>
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <Circle size={10} className={connected ? "text-green-400" : "text-text-muted"} />
        <span>{portName || "—"}</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span>{baudRate || "—"}</span>
      </div>

      <button
        className="rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
        onClick={() => setDark(!dark)}
        title={dark ? t("settings.light") : t("settings.dark")}
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
      </button>
    </div>
  );
}
