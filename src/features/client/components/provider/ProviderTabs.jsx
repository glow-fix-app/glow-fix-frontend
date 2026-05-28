import { Tabs } from "@heroui/react";

const TABS = [
  { id: "services", label: "Services" },
  { id: "reviews", label: "Reviews" },
  { id: "about", label: "About" },
];

const TAB_CLASS =
  "relative pb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted data-[selected]:text-text-primary transition-colors focus:outline-none cursor-pointer";

const INDICATOR_CLASS = "absolute bottom-0 left-0 right-0 h-[2px] bg-black";

export default function ProviderTabs({ activeTab, onChange }) {
  return (
    <div className="w-full border-b border-border-default">
      <Tabs
        className="w-fit"
        variant="secondary"
        selectedKey={activeTab}
        onSelectionChange={(key) => onChange(String(key))}
      >
        <Tabs.ListContainer>
          <Tabs.List aria-label="Provider sections" className="flex gap-8 pb-0">
            {TABS.map((tab) => (
              <Tabs.Tab key={tab.id} id={tab.id} className={TAB_CLASS}>
                {tab.label}
                <Tabs.Indicator className={INDICATOR_CLASS} />
              </Tabs.Tab>
            ))}
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>
    </div>
  );
}
