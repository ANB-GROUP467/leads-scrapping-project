export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-xl border border-slate-800 bg-slate-900/50 p-6 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export function FeatureCard({ title, description, href }) {
  const content = (
    <>
      <h3 className="text-lg font-semibold text-white">{title}</h3>

      <p className="mt-2 text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        className="block rounded-xl border border-slate-800 bg-slate-900/40 p-6 transition hover:border-slate-700 hover:bg-slate-900/70"
      >
        {content}
      </a>
    );
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
      {content}
    </section>
  );
}
