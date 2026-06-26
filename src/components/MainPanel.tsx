import { useState, useCallback, useRef, useEffect } from "react";
import LogMonitor from "./LogMonitor";

export default function MainPanel() {
  const [splitRatio, setSplitRatio] = useState(65);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

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
      <div style={{ height: `${splitRatio}%` }}>
        <LogMonitor />
      </div>

      <div
        className="flex h-1 cursor-row-resize items-center justify-center border-y border-border bg-panel hover:bg-accent transition-colors"
        onMouseDown={onMouseDown}
      >
        <div className="h-0.5 w-6 rounded bg-text-muted" />
      </div>

      <div className="flex flex-1 items-center justify-center text-sm text-text-muted">
        发送区 (Send Controller)
      </div>
    </div>
  );
}
