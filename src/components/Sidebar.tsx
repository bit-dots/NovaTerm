import type { TabId } from "./ActivityBar";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  activeTab: TabId;
}

export default function Sidebar({ activeTab }: SidebarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex w-60 flex-col border-r border-border bg-panel-alt">
      {activeTab === "serial" && (
        <>
          <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {t("serial.refresh")}
          </div>
          <div className="flex-1 px-4 py-2 text-sm text-text-muted">{t("serial.no_ports")}</div>
        </>
      )}

      {activeTab === "settings" && (
        <>
          <div className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            {t("settings.title")}
          </div>
          <div className="flex-1 px-4 py-2 text-sm text-text-muted">
            {t("settings.language")} / {t("settings.theme")}
          </div>
        </>
      )}

      {activeTab === "ssh" && null}
    </div>
  );
}
