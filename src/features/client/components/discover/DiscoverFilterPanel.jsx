import { Drawer } from "@heroui/react";
import DiscoverFilters from "@/features/client/components/discover/DiscoverFilters";

function FilterBody({ filters, onChange, onReset }) {
  return (
    <DiscoverFilters
      filters={filters}
      onChange={onChange}
      onReset={onReset}
    />
  );
}

export default function DiscoverFilterPanel({
  filters,
  showFilters,
  onChange,
  onReset,
  onOpenChange,
}) {
  return (
    <>
      <aside
        className={`${
          showFilters ? "hidden lg:block" : "hidden"
        } transition-all self-start lg:pr-2`}
      >
        <div className="lg:sticky lg:top-24 flex flex-col bg-white p-5 border border-border-default shadow-sm rounded-xl">
          <FilterBody filters={filters} onChange={onChange} onReset={onReset} />
        </div>
      </aside>

      <div className="lg:hidden">
        <Drawer
          isOpen={showFilters && window.innerWidth < 1024}
          onOpenChange={onOpenChange}
        >
          <Drawer.Backdrop className="z-[9998]">
            <Drawer.Content placement="left" className="z-[9999]">
              <Drawer.Dialog>
                <Drawer.Body className="p-0 bg-white overflow-y-auto">
                  <FilterBody filters={filters} onChange={onChange} onReset={onReset} />
                </Drawer.Body>
              </Drawer.Dialog>
            </Drawer.Content>
          </Drawer.Backdrop>
        </Drawer>
      </div>
    </>
  );
}
