const LABEL = { W: 'G', D: 'B', L: 'M' };

export default function FormDots({ results }) {
  const clean = (results ?? []).filter(Boolean).slice(0, 5);
  if (clean.length === 0) return null;
  return (
    <div className="form-dots" title="Son 5 maç (en yeni sağda)">
      {clean
        .slice()
        .reverse()
        .map((r, i) => (
          <span key={i} className={`form-dot form-dot-${r}`}>
            {LABEL[r]}
          </span>
        ))}
    </div>
  );
}
