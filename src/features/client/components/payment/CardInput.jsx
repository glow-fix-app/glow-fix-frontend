export default function CardInput({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  className = "",
  mono = false,
}) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-bold uppercase tracking-[0.12em] text-text-tertiary mb-2">
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete="new-password"
        className={`w-full h-[48px] px-4 rounded-xl border border-border-default bg-white text-[14px] text-text-primary placeholder:text-gray-400 outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-blue-500/10 ${mono ? "font-mono tracking-wider" : ""}`}
      />
    </div>
  );
}
