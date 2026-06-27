import { useState } from "react";
import { Send, Plus, Trash2, Check, X, Pencil } from "lucide-react";
import { useTranslation } from "react-i18next";
import { invoke } from "@tauri-apps/api/core";
import type { Macro } from "../types";

interface MacroPanelProps {
  macros: Macro[];
  onMacrosChange: (macros: Macro[]) => void;
  onSend: (data: number[], text: string) => void;
}

let idCounter = Date.now();

export default function MacroPanel({ macros, onMacrosChange, onSend }: MacroPanelProps) {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCommand, setEditCommand] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);

  const startAdd = () => {
    const newId = String(++idCounter);
    setEditingId(newId);
    setEditName("");
    setEditCommand("");
  };

  const startEdit = (macro: Macro) => {
    setEditingId(macro.id);
    setEditName(macro.name);
    setEditCommand(macro.command);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName("");
    setEditCommand("");
  };

  const saveEdit = () => {
    if (!editingId || !editName.trim()) return;

    const existing = macros.find((m) => m.id === editingId);
    if (existing) {
      onMacrosChange(
        macros.map((m) =>
          m.id === editingId ? { ...m, name: editName.trim(), command: editCommand } : m,
        ),
      );
    } else {
      onMacrosChange([...macros, { id: editingId, name: editName.trim(), command: editCommand }]);
    }
    cancelEdit();
  };

  const deleteMacro = (id: string) => {
    onMacrosChange(macros.filter((m) => m.id !== id));
    if (editingId === id) cancelEdit();
  };

  const handleSend = async (macro: Macro) => {
    if (!macro.command) return;
    setSendingId(macro.id);
    try {
      const bytes = Array.from(new TextEncoder().encode(macro.command));
      await invoke("write_serial_data", { data: bytes });
      onSend(bytes, macro.command);
    } catch (e) {
      console.error("Failed to send macro:", e);
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="text-sm font-semibold text-text-primary">{t("macro.title")}</span>
        <button
          onClick={startAdd}
          className="rounded p-1 text-text-secondary hover:bg-panel hover:text-text-primary"
          title={t("macro.add")}
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {macros.length === 0 && !editingId && (
          <div className="px-4 py-8 text-center text-xs text-text-muted">{t("macro.empty")}</div>
        )}

        {editingId && !macros.find((m) => m.id === editingId) && (
          <div className="border-b border-border p-3">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder={t("macro.name")}
              className="mb-2 w-full rounded border border-border bg-panel px-2 py-1 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              autoFocus
            />
            <input
              type="text"
              value={editCommand}
              onChange={(e) => setEditCommand(e.target.value)}
              placeholder={t("macro.command")}
              className="mb-2 w-full rounded border border-border bg-panel px-2 py-1 text-sm font-mono text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") cancelEdit();
              }}
            />
            <div className="flex justify-end gap-1.5">
              <button
                onClick={saveEdit}
                className="flex items-center gap-1 rounded bg-accent px-2.5 py-1 text-xs text-editor hover:opacity-90"
              >
                <Check size={12} />
                {t("send.send")}
              </button>
              <button
                onClick={cancelEdit}
                className="flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-text-secondary hover:bg-panel"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {macros.map((macro) => (
          <div key={macro.id} className="border-b border-border">
            {editingId === macro.id ? (
              <div className="p-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="mb-2 w-full rounded border border-border bg-panel px-2 py-1 text-sm text-text-primary focus:border-accent focus:outline-none"
                  autoFocus
                />
                <input
                  type="text"
                  value={editCommand}
                  onChange={(e) => setEditCommand(e.target.value)}
                  className="mb-2 w-full rounded border border-border bg-panel px-2 py-1 text-sm font-mono text-text-primary focus:border-accent focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveEdit();
                    if (e.key === "Escape") cancelEdit();
                  }}
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={saveEdit}
                    className="flex items-center gap-1 rounded bg-accent px-2.5 py-1 text-xs text-editor hover:opacity-90"
                  >
                    <Check size={12} />
                    {t("send.send")}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-text-secondary hover:bg-panel"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-text-primary">{macro.name}</div>
                  <div className="truncate font-mono text-xs text-text-muted">{macro.command}</div>
                </div>
                <button
                  onClick={() => handleSend(macro)}
                  disabled={sendingId === macro.id}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-accent hover:bg-accent/15 disabled:opacity-50"
                  title={t("send.send")}
                >
                  <Send size={14} />
                </button>
                <button
                  onClick={() => startEdit(macro)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-text-secondary hover:bg-panel hover:text-text-primary"
                  title={t("macro.edit")}
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => deleteMacro(macro.id)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded text-text-secondary hover:bg-panel hover:text-red-400"
                  title={t("macro.delete")}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
