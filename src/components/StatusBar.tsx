import { useTranslation } from "react-i18next";
import { Circle, Unplug } from "lucide-react";

export default function StatusBar() {
  const { t } = useTranslation();

  return (
    <div className="flex h-6 items-center gap-3 border-t border-border bg-panel px-3 text-xs text-text-secondary">
      <div className="flex items-center gap-1.5">
        <Unplug size={12} />
        <span>{t("status.disconnected")}</span>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-1.5">
        <Circle size={8} className="text-text-muted" />
        <span>COM1</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span>115200</span>
      </div>
    </div>
  );
}
