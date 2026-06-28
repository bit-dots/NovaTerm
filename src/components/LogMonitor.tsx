import { useRef, useEffect, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleStop, Play, Trash2, Download, Clock, Binary } from "lucide-react";
import type { LogEntry } from "../types";

interface LogMonitorProps {
  entries: LogEntry[];
  onClear: () => void;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

export default function LogMonitor({
  entries,
  onClear,
  fontSize,
  onFontSizeChange,
}: LogMonitorProps) {
  const { t } = useTranslation();
  const [paused, setPaused] = useState(false);
  const [hexMode, setHexMode] = useState(false);
  const [showTimestamp, setShowTimestamp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === "=" || e.key === "+") {
        e.preventDefault();
        onFontSizeChange(Math.min(fontSize + 1, 28));
      } else if (e.key === "-") {
        e.preventDefault();
        onFontSizeChange(Math.max(fontSize - 1, 10));
      } else if (e.key === "0") {
        e.preventDefault();
        onFontSizeChange(16);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fontSize, onFontSizeChange]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    if (!paused && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries, paused]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 30;
    if (atBottom && pausedRef.current) {
      setPaused(false);
    } else if (!atBottom && !pausedRef.current) {
      setPaused(true);
    }
  }, []);

  const handleTogglePause = useCallback(() => {
    setPaused((prev) => {
      if (prev && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      return !prev;
    });
  }, []);

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
    <div className="flex min-h-0 flex-1 flex-col">
      <div
        className="flex items-center gap-2.5 border-b border-border pl-2 py-1"
        style={{ paddingRight: 10 }}
      >
        <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
          {t("receive.title")}
        </span>
        <div className="min-w-2 flex-1" />
        <button
          className={`flex-shrink-0 rounded p-0.5 transition-colors ${
            showTimestamp
              ? "text-accent"
              : "text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          }`}
          title={t("receive.timestamp")}
          onClick={() => setShowTimestamp(!showTimestamp)}
        >
          <Clock size={15} />
        </button>
        <button
          className={`flex-shrink-0 rounded p-0.5 transition-colors ${
            hexMode
              ? "text-accent"
              : "text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          }`}
          title={t("receive.hex")}
          onClick={() => setHexMode(!hexMode)}
        >
          <Binary size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={paused ? t("receive.resume") : t("receive.pause")}
          onClick={handleTogglePause}
        >
          {paused ? <Play size={15} /> : <CircleStop size={15} />}
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

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="min-h-0 flex-1 overflow-auto p-3 font-mono leading-relaxed"
        style={{ fontSize }}
      >
        {entries.length === 0 ? (
          <span className="text-text-muted">{t("receive.waiting")}</span>
        ) : (
          entries.map((entry) => {
            const hexBytes = entry.data
              .map((b) => b.toString(16).toUpperCase().padStart(2, "0"))
              .join(" ");
            const colorClass = entry.type === "tx" ? "text-green-400" : "text-text-primary";

            return (
              <div key={entry.id} className="hover:bg-panel-alt/50">
                {showTimestamp && (
                  <span className="select-none text-text-muted">{entry.timestamp}</span>
                )}
                {hexMode ? (
                  <>
                    <span className={colorClass}> {hexBytes}</span>
                    <span className="select-none text-text-muted"> │</span>
                    <span className="text-text-muted"> {entry.text}</span>
                  </>
                ) : (
                  <span className={colorClass}> {entry.text}</span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
