const OPTIONS = [
  { label: "Client Account", value: "client" },
  { label: "Service Provider", value: "manager" },
];

export function RoleSwitch({ role, onChange }) {
  return (
    <div className="flex gap-8 border-b border-border-form">
      {OPTIONS.map((option) => {
        const isActive = role === option.value;
        return (
          <button
            key={option.value}
            type="button"
            className={`relative pb-4 text-sm font-extrabold transition-all ${
              isActive ? "text-brand-600" : "text-text-muted hover:text-text-secondary"
            }`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
            {isActive && (
              <span className="absolute bottom-[-1px] left-0 h-[2px] w-full bg-brand-500" />
            )}
          </button>
        );
      })}
    </div>
  );
}
