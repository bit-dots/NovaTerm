import { useState } from "react";
import { X, Palette, FileText, Usb, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AppSettings } from "../types";
import { DEFAULT_SETTINGS } from "../types";

interface SettingsPageProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
  onClose: () => void;
}

type Category = "appearance" | "log" | "serial";

const categories: { id: Category; icon: typeof Palette; labelKey: string }[] = [
  { id: "appearance", icon: Palette, labelKey: "settings.appearance" },
  { id: "log", icon: FileText, labelKey: "settings.log" },
  { id: "serial", icon: Usb, labelKey: "settings.serial" },
];

const ENCODING_OPTIONS = [
  { value: "utf-8", label: "UTF-8" },
  { value: "gb2312", label: "GB2312" },
  { value: "latin-1", label: "Latin-1 (ISO 8859-1)" },
] as const;

export default function SettingsPage({ settings, onChange, onClose }: SettingsPageProps) {
  const { t, i18n } = useTranslation();
  const [activeCategory, setActiveCategory] = useState<Category>("appearance");

  const update = (partial: Partial<AppSettings>) => {
    onChange({ ...settings, ...partial });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="flex h-[520px] w-[720px] flex-col rounded-xl border border-border bg-panel shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal size={18} className="text-text-secondary" />
            <span className="text-base font-semibold text-text-primary">{t("settings.title")}</span>
          </div>
          <button
            className="rounded p-1 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-48 flex-shrink-0 border-r border-border bg-panel-alt py-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                  activeCategory === cat.id
                    ? "bg-editor text-text-primary"
                    : "text-text-secondary hover:bg-panel hover:text-text-primary"
                }`}
              >
                <cat.icon size={16} />
                {t(cat.labelKey)}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-6">
            {activeCategory === "appearance" && (
              <div className="flex flex-col gap-8">
                <section>
                  <h2 className="mb-4 text-base font-semibold text-text-primary">
                    {t("settings.theme")}
                  </h2>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 text-sm text-text-primary">
                      <input
                        type="radio"
                        name="theme"
                        checked={settings.theme === "dark"}
                        onChange={() => update({ theme: "dark" })}
                        className="accent-accent"
                      />
                      {t("settings.dark")}
                    </label>
                    <label className="flex items-center gap-3 text-sm text-text-primary">
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
                </section>

                <section>
                  <h2 className="mb-4 text-base font-semibold text-text-primary">
                    {t("settings.language")}
                  </h2>
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 text-sm text-text-primary">
                      <input
                        type="radio"
                        name="language"
                        checked={settings.language === "zh"}
                        onChange={() => {
                          update({ language: "zh" });
                          i18n.changeLanguage("zh");
                        }}
                        className="accent-accent"
                      />
                      {t("settings.zh")}
                    </label>
                    <label className="flex items-center gap-3 text-sm text-text-primary">
                      <input
                        type="radio"
                        name="language"
                        checked={settings.language === "en"}
                        onChange={() => {
                          update({ language: "en" });
                          i18n.changeLanguage("en");
                        }}
                        className="accent-accent"
                      />
                      {t("settings.en")}
                    </label>
                  </div>
                </section>
              </div>
            )}

            {activeCategory === "log" && (
              <section>
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  {t("settings.log")}
                </h2>
                <div className="flex flex-col gap-5">
                  <label className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-text-primary">{t("settings.max_lines")}</span>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {t("settings.max_lines_desc")}
                      </p>
                    </div>
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
                      className="w-28 flex-shrink-0 rounded border border-border bg-panel-alt px-3 py-1.5 text-sm text-text-primary focus:border-accent focus:outline-none"
                    />
                  </label>

                  <label className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-text-primary">{t("settings.font_size")}</span>
                      <p className="mt-0.5 text-xs text-text-muted">
                        {t("settings.font_size_desc")}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded border border-border bg-panel-alt text-text-primary hover:bg-panel"
                        onClick={() =>
                          update({ logFontSize: Math.max(10, settings.logFontSize - 1) })
                        }
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm text-text-primary">
                        {settings.logFontSize}
                      </span>
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded border border-border bg-panel-alt text-text-primary hover:bg-panel"
                        onClick={() =>
                          update({ logFontSize: Math.min(28, settings.logFontSize + 1) })
                        }
                      >
                        +
                      </button>
                      <button
                        className="rounded border border-border bg-panel-alt px-2 py-1 text-xs text-text-secondary hover:bg-panel"
                        onClick={() => update({ logFontSize: DEFAULT_SETTINGS.logFontSize })}
                      >
                        Reset
                      </button>
                    </div>
                  </label>
                </div>
              </section>
            )}

            {activeCategory === "serial" && (
              <section>
                <h2 className="mb-4 text-base font-semibold text-text-primary">
                  {t("settings.encoding")}
                </h2>
                <div className="flex flex-col gap-3">
                  {ENCODING_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-3 text-sm text-text-primary"
                    >
                      <input
                        type="radio"
                        name="encoding"
                        checked={settings.defaultEncoding === opt.value}
                        onChange={() => update({ defaultEncoding: opt.value })}
                        className="accent-accent"
                      />
                      <div>
                        <span>{opt.label}</span>
                      </div>
                    </label>
                  ))}
                  <p className="mt-1 text-xs text-text-muted">{t("settings.encoding_desc")}</p>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
