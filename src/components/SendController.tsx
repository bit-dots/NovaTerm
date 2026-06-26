import { useTranslation } from "react-i18next";
import { Send, History, RotateCw, CornerDownLeft } from "lucide-react";

export default function SendController() {
  const { t } = useTranslation();

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
          placeholder={t("send.placeholder")}
        />
        <button className="flex-shrink-0 self-end rounded bg-accent px-3 py-1 text-base font-medium text-panel hover:bg-accent/80">
          <Send size={15} />
        </button>
      </div>
    </div>
  );
}
