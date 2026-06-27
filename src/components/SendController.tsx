import { useState, useCallback, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { Send, History, RotateCw, CornerDownLeft, X, ChevronDown } from "lucide-react";
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
  onClose: () => void;
  macros: Macro[];
  onMacrosChange: (macros: Macro[]) => void;
}

export default function SendController({
  onSend,
  onClose,
  macros,
  onMacrosChange,
}: SendControllerProps) {
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
  const [showMacroDropdown, setShowMacroDropdown] = useState(false);
  const macroDropdownRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    if (!showMacroDropdown) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (macroDropdownRef.current && !macroDropdownRef.current.contains(e.target as Node)) {
        setShowMacroDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMacroDropdown]);

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
      <div className="flex items-center gap-2.5 pl-2 py-1" style={{ paddingRight: 10 }}>
        <span className="flex-shrink-0 text-[11px] font-semibold uppercase tracking-wider text-text-primary leading-none">
          {t("send.title")}
        </span>
        <div className="flex-1" />
        <button
          className={`flex-shrink-0 inline-flex items-center justify-center h-6 rounded px-1.5 text-xs font-medium leading-none transition-colors ${
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
          className={`flex-shrink-0 inline-flex items-center justify-center h-6 rounded px-1.5 text-xs font-medium leading-none transition-colors ${
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
            className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded text-text-secondary hover:bg-panel-alt hover:text-text-primary"
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
          className={`flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded transition-colors ${
            cyclicEnabled
              ? "text-accent"
              : "text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          }`}
          title={t("send.cyclic")}
          onClick={toggleCyclic}
        >
          <RotateCw size={15} />
        </button>
        <div className="h-4 w-px bg-text-secondary/50" style={{ marginLeft: 12, marginRight: 2 }} />
        <button
          className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          onClick={onClose}
          title={t("send.collapse")}
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex flex-1 flex-col">
        <textarea
          className="flex-1 resize-none border-0 bg-panel px-2 py-2 font-mono text-base text-text-primary placeholder-text-muted outline-none"
          placeholder={hexMode ? "00 01 FF ..." : t("send.placeholder")}
          value={inputText}
          onChange={hexMode ? handleHexInput : (e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        <div className="flex items-center gap-2 border-t border-border px-2 py-1.5">
          <div className="relative flex-1 min-w-0" ref={macroDropdownRef}>
            <button
              className="flex w-full items-center gap-1.5 rounded border border-border bg-panel px-2 py-0.5 text-xs text-text-secondary hover:border-text-muted"
              onClick={() => setShowMacroDropdown(!showMacroDropdown)}
              title={t("macro.title")}
            >
              <span className="flex-1 truncate text-left text-text-muted">{t("macro.select")}</span>
              <ChevronDown
                size={12}
                className={`flex-shrink-0 transition-transform ${showMacroDropdown ? "rotate-180" : ""}`}
              />
            </button>
            {showMacroDropdown && (
              <div className="absolute bottom-full left-0 mb-1 w-full rounded border border-border bg-panel shadow-lg z-50">
                <div className="max-h-40 overflow-auto">
                  {macros.length === 0 ? (
                    <div className="px-2 py-3 text-center text-xs text-text-muted">
                      {t("macro.empty")}
                    </div>
                  ) : (
                    macros.map((macro) => (
                      <button
                        key={macro.id}
                        className="flex w-full flex-col px-2 py-1.5 text-left hover:bg-panel-alt"
                        onClick={() => {
                          setInputText(macro.command);
                          setShowMacroDropdown(false);
                        }}
                      >
                        <span className="text-xs text-text-primary">{macro.name}</span>
                        <span className="truncate font-mono text-[10px] text-text-muted">
                          {macro.command}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <MacroManager macros={macros} onMacrosChange={onMacrosChange} />

          {cyclicEnabled && (
            <>
              <div className="h-4 w-px bg-text-secondary/50" />
              <RotateCw size={14} className="text-accent flex-shrink-0" />
              <input
                type="number"
                className="w-16 rounded border border-border bg-panel px-1.5 py-0.5 text-xs text-text-primary outline-none focus:border-accent"
                value={cyclicInterval}
                min={100}
                step={100}
                onChange={(e) => setCyclicInterval(Number(e.target.value) || 1000)}
              />
              <span className="text-xs text-text-muted">ms</span>
            </>
          )}

          <button
            className="flex-shrink-0 inline-flex items-center justify-center h-6 w-6 rounded bg-accent text-panel hover:bg-accent/80 disabled:opacity-50"
            onClick={handleSend}
            disabled={sending || !inputText.trim()}
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
