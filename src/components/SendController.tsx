import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { Send, History, RotateCw, CornerDownLeft } from "lucide-react";
import type { Macro } from "../types";
import MacroManager from "./MacroManager";

type NewlineMode = "none" | "lf" | "crlf";
const MAX_HISTORY = 20;

interface HistoryItem {
  text: string;
  hexMode: boolean;
}

interface SendControllerProps {
  onSend: (data: number[], text: string) => void;
  macros: Macro[];
  onMacrosChange: (macros: Macro[]) => void;
}

export default function SendController({ onSend, macros, onMacrosChange }: SendControllerProps) {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [hexMode, setHexMode] = useState(false);
  const [sending, setSending] = useState(false);
  const [newlineMode, setNewlineMode] = useState<NewlineMode>("none");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [cyclicEnabled, setCyclicEnabled] = useState(false);
  const [cyclicInterval, setCyclicInterval] = useState(1000);
  const cyclicRef = useRef<number | null>(null);
  const inputRef = useRef(inputText);
  const hexRef = useRef(hexMode);
  const newlineRef = useRef(newlineMode);

  useEffect(() => {
    inputRef.current = inputText;
  }, [inputText]);
  useEffect(() => {
    hexRef.current = hexMode;
  }, [hexMode]);
  useEffect(() => {
    newlineRef.current = newlineMode;
  }, [newlineMode]);

  const hexToBytes = useCallback((hex: string) => {
    const cleaned = hex.replace(/\s+/g, "");
    const bytes: number[] = [];
    for (let i = 0; i < cleaned.length; i += 2) {
      const byte = cleaned.substring(i, i + 2);
      if (byte.length === 2) {
        bytes.push(parseInt(byte, 16));
      }
    }
    return bytes;
  }, []);

  const buildBytes = useCallback(
    (text: string, hex: boolean, nl: NewlineMode) => {
      let bytes: number[];
      let displayText: string;

      if (hex) {
        bytes = hexToBytes(text);
        if (bytes.length === 0) return null;
        displayText = bytes.map((b) => String.fromCharCode(b)).join("");
      } else {
        bytes = Array.from(new TextEncoder().encode(text));
        displayText = text;
      }

      if (nl === "lf") {
        bytes.push(0x0a);
      } else if (nl === "crlf") {
        bytes.push(0x0d, 0x0a);
      }

      return { bytes, displayText };
    },
    [hexToBytes],
  );

  const doSend = useCallback(
    async (text: string, hex: boolean, nl: NewlineMode, clearInput = true) => {
      const result = buildBytes(text, hex, nl);
      if (!result) return;

      setSending(true);
      try {
        await invoke("write_serial_data", { data: result.bytes });
        onSend(result.bytes, result.displayText);
        if (clearInput) {
          setInputText("");
        }
        setHistory((prev) => {
          const next = [{ text, hexMode: hex }, ...prev.filter((h) => h.text !== text)];
          return next.slice(0, MAX_HISTORY);
        });
      } catch (e) {
        console.error("Failed to send:", e);
      } finally {
        setSending(false);
      }
    },
    [buildBytes, onSend],
  );

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;
    await doSend(text, hexMode, newlineMode);
  }, [inputText, hexMode, newlineMode, doSend]);

  const handleMacroSend = useCallback(
    async (macro: Macro) => {
      if (!macro.command) return;
      const bytes = Array.from(new TextEncoder().encode(macro.command));
      setSending(true);
      try {
        await invoke("write_serial_data", { data: bytes });
        onSend(bytes, macro.command);
      } catch (e) {
        console.error("Failed to send macro:", e);
      } finally {
        setSending(false);
      }
    },
    [onSend],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const handleHexInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.toUpperCase();
    if (/^[0-9A-F\s]*$/.test(value)) {
      setInputText(value);
    }
  }, []);

  const cycleNewline = useCallback(() => {
    setNewlineMode((prev) => (prev === "none" ? "lf" : prev === "lf" ? "crlf" : "none"));
  }, []);

  const selectHistory = useCallback((item: HistoryItem) => {
    setInputText(item.text);
    setHexMode(item.hexMode);
    setShowHistory(false);
  }, []);

  const toggleCyclic = useCallback(() => {
    setCyclicEnabled((prev) => !prev);
    setShowHistory(false);
  }, []);

  useEffect(() => {
    if (cyclicEnabled) {
      cyclicRef.current = window.setInterval(() => {
        const text = inputRef.current.trim();
        if (!text) return;
        doSend(text, hexRef.current, newlineRef.current, false);
      }, cyclicInterval);
    } else {
      if (cyclicRef.current !== null) {
        clearInterval(cyclicRef.current);
        cyclicRef.current = null;
      }
    }
    return () => {
      if (cyclicRef.current !== null) {
        clearInterval(cyclicRef.current);
        cyclicRef.current = null;
      }
    };
  }, [cyclicEnabled, cyclicInterval, doSend]);

  return (
    <div className="flex flex-1 flex-col">
      <div
        className="flex items-center gap-2.5 border-b border-border pl-2 py-1"
        style={{ paddingRight: 10 }}
      >
        <span className="flex-shrink-0 text-base font-semibold uppercase tracking-wider text-text-secondary">
          {t("send.title")}
        </span>
        <div className="flex-1" />
        <button
          className={`flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium transition-colors ${
            hexMode
              ? "bg-accent/20 text-accent"
              : "text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          }`}
          onClick={() => setHexMode(!hexMode)}
          title="HEX"
        >
          HEX
        </button>
        <button
          className={`flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium transition-colors ${
            newlineMode !== "none"
              ? "bg-accent/20 text-accent"
              : "text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          }`}
          onClick={cycleNewline}
          title={t("send.newline")}
        >
          {newlineMode === "none" ? <CornerDownLeft size={15} /> : newlineMode.toUpperCase()}
        </button>
        <div className="relative">
          <button
            className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
            title={t("send.history")}
            onClick={() => setShowHistory((prev) => !prev)}
          >
            <History size={15} />
          </button>
          {showHistory && history.length > 0 && (
            <div className="absolute right-0 top-7 z-50 max-h-48 w-64 overflow-auto rounded border border-border bg-panel shadow-lg">
              {history.map((item, i) => (
                <div
                  key={i}
                  className="cursor-pointer truncate px-2 py-1 text-sm text-text-primary hover:bg-panel-alt"
                  onClick={() => selectHistory(item)}
                >
                  {item.hexMode ? "HEX: " : ""}
                  {item.text}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          className={`flex-shrink-0 rounded p-0.5 transition-colors ${
            cyclicEnabled
              ? "text-accent"
              : "text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          }`}
          title={t("send.cyclic")}
          onClick={toggleCyclic}
        >
          <RotateCw size={15} />
        </button>
      </div>

      {cyclicEnabled && (
        <div className="flex items-center gap-2 border-b border-border px-2 py-1">
          <span className="text-xs text-text-secondary">{t("send.loop_interval")}</span>
          <input
            type="number"
            className="w-20 rounded border border-border bg-panel px-1.5 py-0.5 text-xs text-text-primary outline-none focus:border-accent"
            value={cyclicInterval}
            min={100}
            step={100}
            onChange={(e) => setCyclicInterval(Number(e.target.value) || 1000)}
          />
          <span className="text-xs text-text-muted">ms</span>
        </div>
      )}

      {macros.length > 0 ? (
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-2 py-1.5">
          {macros.map((macro) => (
            <button
              key={macro.id}
              onClick={() => handleMacroSend(macro)}
              disabled={sending}
              className="flex-shrink-0 rounded-full border border-border bg-panel-alt px-2.5 py-0.5 text-xs text-text-primary transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
              title={macro.command}
            >
              {macro.name}
            </button>
          ))}
          <div className="flex-shrink-0 ml-0.5">
            <MacroManager macros={macros} onMacrosChange={onMacrosChange} />
          </div>
        </div>
      ) : (
        <div className="flex items-center border-b border-border px-2 py-1">
          <span className="text-xs text-text-muted">{t("macro.empty")}</span>
          <div className="flex-1" />
          <MacroManager macros={macros} onMacrosChange={onMacrosChange} />
        </div>
      )}

      <div className="flex gap-2 p-2">
        <textarea
          className="flex-1 resize-none rounded border border-border bg-panel px-2 py-1 font-mono text-base text-text-primary placeholder-text-muted outline-none focus:border-accent"
          rows={3}
          placeholder={hexMode ? "00 01 FF ..." : t("send.placeholder")}
          value={inputText}
          onChange={hexMode ? handleHexInput : (e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="flex-shrink-0 self-end rounded bg-accent px-3 py-1 text-base font-medium text-panel hover:bg-accent/80 disabled:opacity-50"
          onClick={handleSend}
          disabled={sending || !inputText.trim()}
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
