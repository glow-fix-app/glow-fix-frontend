export default function PageHeader({ pretitle, title, description, leftContent, rightContent }) {
  return (
    <header className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div className="flex-1">
        {pretitle && (
          <p className="text-[10px] font-normal uppercase tracking-[0.2em] text-text-muted">
            {pretitle}
          </p>
        )}
        <h1 className="mt-2 text-2xl font-medium tracking-tight text-text-primary sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[14px] text-text-tertiary">
            {description}
          </p>
        )}
        {leftContent && (
          <div className="mt-6 w-full sm:w-auto">
            {leftContent}
          </div>
        )}
      </div>
      {rightContent && (
        <div className="shrink-0 w-full sm:w-auto">
          {rightContent}
        </div>
      )}
    </header>
  );
}
