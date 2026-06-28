import { useState, useRef, useEffect } from "react";
import { Cable, Terminal, Settings, RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";
import { check } from "@tauri-apps/plugin-updater";
import { useToast } from "./Toast";

export type TabId = "serial" | "ssh";

interface Tab {
  id: TabId;
  icon: typeof Cable;
  labelKey: string;
  disabled: boolean;
}

const tabs: Tab[] = [
  { id: "serial", icon: Cable, labelKey: "activityBar.serial", disabled: false },
  { id: "ssh", icon: Terminal, labelKey: "SSH", disabled: true },
];

interface ActivityBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
}

export default function ActivityBar({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenCommandPalette,
}: ActivityBarProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [checking, setChecking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleCheckUpdate = async () => {
    setMenuOpen(false);
    setChecking(true);
    try {
      const update = await check();
      if (update) {
        showToast(`${t("activityBar.new_version")}: ${update.version}`, "info");
      } else {
        showToast(t("activityBar.up_to_date"), "success");
      }
    } catch (e) {
      showToast(`${t("activityBar.update_error")}: ${e}`, "error");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="flex w-12 flex-col items-center bg-panel">
      <div className="flex flex-1 flex-col items-center gap-1 pt-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && onTabChange(tab.id)}
            disabled={tab.disabled}
            className={`flex h-12 w-12 items-center justify-center border-l-2 transition-colors ${
              activeTab === tab.id
                ? "border-activity-active text-activity-active"
                : "border-transparent text-text-secondary hover:text-text-primary"
            } ${tab.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            title={t(tab.labelKey)}
          >
            <tab.icon size={22} />
          </button>
        ))}
      </div>

      <div className="relative flex flex-col items-center pb-3">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`flex h-12 w-12 items-center justify-center border-l-2 transition-colors cursor-pointer ${
            menuOpen
              ? "border-activity-active text-activity-active"
              : "border-transparent text-text-secondary hover:text-text-primary"
          }`}
          title={t("activityBar.manage")}
        >
          <Settings size={22} />
        </button>

        {menuOpen && (
          <div
            ref={menuRef}
            className="absolute bottom-12 left-12 z-50 min-w-44 rounded border border-border bg-panel-alt py-1 shadow-lg"
          >
            <button
              className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-sm text-text-primary hover:bg-accent hover:text-editor"
              onClick={() => {
                setMenuOpen(false);
                onOpenSettings();
              }}
            >
              <Settings size={14} />
              {t("activityBar.settings")}
            </button>
            <button
              className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-sm text-text-primary hover:bg-accent hover:text-editor"
              onClick={() => {
                setMenuOpen(false);
                onOpenCommandPalette();
              }}
            >
              <span className="text-xs">⌘</span>
              {t("activityBar.commandPalette")}
            </button>
            <div className="my-1 border-t border-border" />
            <button
              className="flex w-full items-center gap-2 px-4 py-1.5 text-left text-sm text-text-primary hover:bg-accent hover:text-editor disabled:opacity-50"
              onClick={handleCheckUpdate}
              disabled={checking}
            >
              <RefreshCw size={14} className={checking ? "animate-spin" : ""} />
              {t("activityBar.checkUpdate")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
