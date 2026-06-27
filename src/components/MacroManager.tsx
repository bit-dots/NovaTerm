import { useState, useRef, useEffect } from "react";
import { Settings, Plus, Check, X, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Macro } from "../types";

interface MacroManagerProps {
  macros: Macro[];
  onMacrosChange: (macros: Macro[]) => void;
}

let idCounter = Date.now();

export default function MacroManager({ macros, onMacrosChange }: MacroManagerProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editCommand, setEditCommand] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

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
    if (!editingId || !editName.trim() || !editCommand.trim()) return;

    const existing = macros.find((m) => m.id === editingId);
    if (existing) {
      onMacrosChange(
        macros.map((m) =>
          m.id === editingId ? { ...m, name: editName.trim(), command: editCommand.trim() } : m,
        ),
      );
    } else {
      onMacrosChange([
        ...macros,
        { id: editingId, name: editName.trim(), command: editCommand.trim() },
      ]);
    }
    cancelEdit();
  };

  const deleteMacro = (id: string) => {
    onMacrosChange(macros.filter((m) => m.id !== id));
    if (editingId === id) cancelEdit();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex-shrink-0 rounded p-0.5 transition-colors ${
          open ? "text-accent" : "text-text-secondary hover:bg-panel-alt hover:text-text-primary"
        }`}
        title={t("macro.title")}
      >
        <Settings size={15} />
      </button>

      {open && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-7 z-50 w-72 rounded border border-border bg-panel shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-semibold text-text-primary">{t("macro.title")}</span>
            <button
              onClick={startAdd}
              className="rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
              title={t("macro.add")}
            >
              <Plus size={15} />
            </button>
          </div>

          <div className="max-h-72 overflow-auto">
            {macros.length === 0 && !editingId && (
              <div className="px-3 py-6 text-center text-xs text-text-muted">
                {t("macro.empty")}
              </div>
            )}

            {editingId && !macros.find((m) => m.id === editingId) && (
              <div className="border-b border-border p-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t("macro.name")}
                  className="mb-2 w-full rounded border border-border bg-panel-alt px-2 py-1 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
                  autoFocus
                />
                <input
                  type="text"
                  value={editCommand}
                  onChange={(e) => setEditCommand(e.target.value)}
                  placeholder={t("macro.command")}
                  className="mb-2 w-full rounded border border-border bg-panel-alt px-2 py-1 font-mono text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none"
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
                    {t("macro.save")}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-text-secondary hover:bg-panel-alt"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            {macros.map((macro) => (
              <div key={macro.id} className="border-b border-border last:border-b-0">
                {editingId === macro.id ? (
                  <div className="p-3">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mb-2 w-full rounded border border-border bg-panel-alt px-2 py-1 text-sm text-text-primary focus:border-accent focus:outline-none"
                      autoFocus
                    />
                    <input
                      type="text"
                      value={editCommand}
                      onChange={(e) => setEditCommand(e.target.value)}
                      className="mb-2 w-full rounded border border-border bg-panel-alt px-2 py-1 font-mono text-sm text-text-primary focus:border-accent focus:outline-none"
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
                        {t("macro.save")}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="flex items-center gap-1 rounded border border-border px-2.5 py-1 text-xs text-text-secondary hover:bg-panel-alt"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm text-text-primary">{macro.name}</div>
                      <div className="truncate font-mono text-xs text-text-muted">
                        {macro.command}
                      </div>
                    </div>
                    <button
                      onClick={() => startEdit(macro)}
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-text-secondary hover:bg-panel-alt hover:text-text-primary"
                      title={t("macro.edit")}
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => deleteMacro(macro.id)}
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-text-secondary hover:bg-panel-alt hover:text-red-400"
                      title={t("macro.delete")}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
