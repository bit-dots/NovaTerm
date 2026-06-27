import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import { Send, History, RotateCw, CornerDownLeft } from "lucide-react";

interface SendControllerProps {
  onSend: (data: number[], text: string) => void;
}

export default function SendController({ onSend }: SendControllerProps) {
  const { t } = useTranslation();
  const [inputText, setInputText] = useState("");
  const [hexMode, setHexMode] = useState(false);
  const [sending, setSending] = useState(false);

  const isValidHex = useCallback((text: string) => {
    return /^[0-9A-Fa-f\s]*$/.test(text);
  }, []);

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

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text) return;

    let bytes: number[];
    let displayText: string;

    if (hexMode) {
      if (!isValidHex(text)) return;
      bytes = hexToBytes(text);
      if (bytes.length === 0) return;
      displayText = bytes.map((b) => String.fromCharCode(b)).join("");
    } else {
      bytes = Array.from(new TextEncoder().encode(text));
      displayText = text;
    }

    setSending(true);
    try {
      await invoke("write_serial_data", { data: bytes });
      onSend(bytes, displayText);
      setInputText("");
    } catch (e) {
      console.error("Failed to send:", e);
    } finally {
      setSending(false);
    }
  }, [inputText, hexMode, isValidHex, hexToBytes, onSend]);

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
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("send.newline")}
        >
          <CornerDownLeft size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("send.history")}
        >
          <History size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("send.cyclic")}
        >
          <RotateCw size={15} />
        </button>
      </div>

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
