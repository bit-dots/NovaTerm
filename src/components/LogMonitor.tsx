import { useTranslation } from "react-i18next";
import { CircleStop, Trash2, Download, Clock, Binary } from "lucide-react";

export default function LogMonitor() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-1 flex-col">
      <div
        className="flex items-center gap-2.5 border-b border-border pl-2 py-1"
        style={{ paddingRight: 10 }}
      >
        <span className="flex-shrink-0 text-sm font-semibold uppercase tracking-wider text-text-secondary">
          {t("receive.title")}
        </span>
        <div className="min-w-2 flex-1" />
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("receive.timestamp")}
        >
          <Clock size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("receive.hex")}
        >
          <Binary size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("receive.pause")}
        >
          <CircleStop size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("receive.clear")}
        >
          <Trash2 size={15} />
        </button>
        <button
          className="flex-shrink-0 rounded p-0.5 text-text-secondary hover:bg-panel-alt hover:text-text-primary"
          title={t("receive.export")}
        >
          <Download size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-3 font-mono text-sm leading-relaxed text-text-primary">
        <span className="text-text-muted">等待接收数据...</span>
      </div>
    </div>
  );
}
