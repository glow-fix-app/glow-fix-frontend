export function AuthHeader({ eyebrow, title, description, titleColor = "#1a1a1a" }) {
  return (
    <header className="space-y-2">
      {eyebrow ? <p className="text-xs font-bold uppercase tracking-wider text-brand-600">{eyebrow}</p> : null}
      <div className="space-y-2">
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight" style={{ color: titleColor }}>
          {title}
        </h1>
        {description ? (
          <p className="max-w-md text-[13px] leading-relaxed text-text-tertiary">{description}</p>
        ) : null}
      </div>
    </header>
  );
}
