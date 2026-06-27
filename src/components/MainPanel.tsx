import { useState, useCallback, useRef, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import LogMonitor from "./LogMonitor";
import SendController from "./SendController";
import type { LogEntry } from "../types";

interface MainPanelProps {
  showSend: boolean;
}

let nextId = 1;

export default function MainPanel({ showSend }: MainPanelProps) {
  const [splitRatio, setSplitRatio] = useState(65);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const addEntry = useCallback((type: "rx" | "tx", data: number[], text: string) => {
    const now = new Date();
    const timestamp =
      now.toLocaleTimeString("en-US", { hour12: false }) +
      "." +
      String(now.getMilliseconds()).padStart(3, "0");
    const entry: LogEntry = {
      id: nextId++,
      type,
      timestamp,
      data,
      text,
    };
    setEntries((prev) => {
      const next = [...prev, entry];
      return next.length > 10000 ? next.slice(-10000) : next;
    });
  }, []);

  useEffect(() => {
    const unlisten = listen<{ data: number[] }>("serial:data-received", (event) => {
      const bytes = event.payload.data;
      const text = new TextDecoder().decode(new Uint8Array(bytes));
      addEntry("rx", bytes, text);
    });
    return () => {
      unlisten.then((fn) => fn());
    };
  }, [addEntry]);

  const onMouseDown = useCallback(() => {
    dragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const onMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const ratio = ((e.clientY - rect.top) / rect.height) * 100;
    setSplitRatio(Math.min(85, Math.max(15, ratio)));
  }, []);

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [onMouseMove, onMouseUp]);

  return (
    <div ref={containerRef} className="flex flex-1 flex-col">
      <div style={{ height: showSend ? `${splitRatio}%` : "100%" }}>
        <LogMonitor entries={entries} onClear={() => setEntries([])} />
      </div>

      {showSend && (
        <>
          <div
            className="flex h-1 cursor-row-resize items-center justify-center border-y border-border bg-panel hover:bg-accent transition-colors"
            onMouseDown={onMouseDown}
          >
            <div className="h-0.5 w-6 rounded bg-text-muted" />
          </div>

          <div className="flex flex-1">
            <SendController onSend={(data, text) => addEntry("tx", data, text)} />
          </div>
        </>
      )}
    </div>
  );
}
