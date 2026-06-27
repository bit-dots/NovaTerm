import { useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CircleStop, Trash2, Download, Clock, Binary } from "lucide-react";
import type { LogEntry } from "../types";

interface LogMonitorProps {
  entries: LogEntry[];
  onClear: () => void;
}

export default function LogMonitor({ entries, onClear }: LogMonitorProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries]);

  const handleExport = useCallback(() => {
    const lines = entries.map((e) => `[${e.timestamp}] ${e.text}`);
    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const now = new Date();
    const filename = `serial-log-${now.toISOString().slice(0, 10)}.txt`;
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [entries]);

  return (
    <div className="flex flex-1 flex-col">
      <div
        className="flex items-center gap-2.5 border-b border-border pl-2 py-1"
        style={{ paddingRight: 10 }}
      >
        <span className="flex-shrink-0 text-base font-semibold uppercase tracking-wider text-text-secondary">
          {t("receive.title")}
        </span>
        <div className="min-w-2 flex-1" />
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("receive.timestamp")}
        >
          <Clock size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("receive.hex")}
        >
          <Binary size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("receive.pause")}
        >
          <CircleStop size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("receive.clear")}
          onClick={onClear}
        >
          <Trash2 size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("receive.export")}
          onClick={handleExport}
        >
          <Download size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 font-mono text-base leading-relaxed">
        {entries.length === 0 ? (
          <span className="text-text-muted">{t("receive.waiting")}</span>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="hover:bg-panel-alt/50">
              <span className="select-none text-text-muted">{entry.timestamp}</span>
              <span className={entry.type === "tx" ? "text-green-400" : "text-text-primary"}>
                {" "}
                {entry.text}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
