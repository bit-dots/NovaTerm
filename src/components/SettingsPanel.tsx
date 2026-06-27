import { useTranslation } from "react-i18next";
import type { AppSettings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

interface SettingsPanelProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

export default function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const { t } = useTranslation();

  const update = (partial: Partial<AppSettings>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-base font-semibold uppercase tracking-wider text-text-secondary">
        {t("settings.theme")}
      </h2>
      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="radio"
            name="theme"
            checked={settings.theme === "dark"}
            onChange={() => update({ theme: "dark" })}
            className="accent-accent"
          />
          {t("settings.dark")}
        </label>
        <label className="flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="radio"
            name="theme"
            checked={settings.theme === "light"}
            onChange={() => update({ theme: "light" })}
            className="accent-accent"
          />
          {t("settings.light")}
        </label>
      </div>

      <h2 className="text-base font-semibold uppercase tracking-wider text-text-secondary">
        {t("settings.log_settings")}
      </h2>

      <div className="flex flex-col gap-2">
        <label className="flex items-center justify-between text-sm text-text-secondary">
          <span>{t("settings.max_lines")}</span>
          <input
            type="number"
            min={1000}
            max={100000}
            step={1000}
            value={settings.maxLines}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (v >= 1000 && v <= 100000) {
                update({ maxLines: v });
              }
            }}
            className="w-24 rounded border border-border bg-panel px-2 py-1 text-sm text-text-primary focus:border-accent focus:outline-none"
          />
        </label>

        <label className="flex items-center justify-between text-sm text-text-secondary">
          <span>{t("settings.font_size")}</span>
          <div className="flex items-center gap-1">
            <button
              className="flex h-7 w-7 items-center justify-center rounded border border-border bg-panel text-text-primary hover:bg-panel-alt"
              onClick={() => update({ logFontSize: Math.max(10, settings.logFontSize - 1) })}
            >
              -
            </button>
            <span className="w-8 text-center text-text-primary">{settings.logFontSize}</span>
            <button
              className="flex h-7 w-7 items-center justify-center rounded border border-border bg-panel text-text-primary hover:bg-panel-alt"
              onClick={() => update({ logFontSize: Math.min(28, settings.logFontSize + 1) })}
            >
              +
            </button>
            <button
              className="ml-2 rounded border border-border bg-panel px-2 py-1 text-xs text-text-secondary hover:bg-panel-alt"
              onClick={() => update({ logFontSize: DEFAULT_SETTINGS.logFontSize })}
            >
              Reset
            </button>
          </div>
        </label>
      </div>
    </div>
  );
}
