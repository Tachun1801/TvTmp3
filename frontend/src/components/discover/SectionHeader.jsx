export default function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  className = "",
}) {
  return (
    <div
      className={`mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between ${className}`}
    >
      <div>
        {eyebrow && (
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">
            {eyebrow}
          </p>
        )}
        <h2 className="text-xl font-semibold text-white sm:text-2xl">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-white/60">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
