import { Cable, Terminal, Settings } from "lucide-react";

export type TabId = "serial" | "ssh" | "settings";

interface Tab {
  id: TabId;
  icon: typeof Cable;
  label: string;
  disabled: boolean;
}

const tabs: Tab[] = [
  { id: "serial", icon: Cable, label: "串口", disabled: false },
  { id: "ssh", icon: Terminal, label: "SSH", disabled: true },
];

interface ActivityBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function ActivityBar({ activeTab, onTabChange }: ActivityBarProps) {
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
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-text-primary"
            } ${tab.disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
            title={tab.label}
          >
            <tab.icon size={22} />
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center pb-3">
        <button
          onClick={() => onTabChange("settings")}
          className={`flex h-12 w-12 items-center justify-center border-l-2 transition-colors ${
            activeTab === "settings"
              ? "border-accent text-accent"
              : "border-transparent text-text-secondary hover:text-text-primary"
          } cursor-pointer`}
          title="设置"
        >
          <Settings size={22} />
        </button>
      </div>
    </div>
  );
}
