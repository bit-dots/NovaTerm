import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Circle, Unplug, Sun, Moon, Send } from "lucide-react";

interface StatusBarProps {
  showSend: boolean;
  onToggleSend: () => void;
}

export default function StatusBar({ showSend, onToggleSend }: StatusBarProps) {
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
      className="flex h-7 items-center gap-3 border-t border-border bg-panel text-base text-text-secondary"
      style={{ paddingLeft: 15, paddingRight: 15 }}
    >
      <div className="flex items-center gap-1.5">
        <Unplug size={15} />
        <span>{t("status.disconnected")}</span>
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
        <Circle size={10} className="text-text-muted" />
        <span>COM1</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span>115200</span>
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
