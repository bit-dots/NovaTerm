import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-1 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-text-secondary hover:text-text-primary"
      >
        <ChevronDown
          size={12}
          className={`shrink-0 transition-transform ${open ? "" : "-rotate-90"}`}
        />
        {title}
      </button>
      {open && <div className="px-2 pb-2">{children}</div>}
    </div>
  );
}
