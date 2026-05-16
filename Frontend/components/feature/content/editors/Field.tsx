"use client";

interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}

export default function Field({ label, value, onChange, textarea }: FieldProps) {
  const base = "w-full px-3 py-2 rounded-lg border border-outline-variant/20 bg-surface-container-lowest text-sm text-primary focus:outline-none focus:border-secondary/40 focus:ring-2 focus:ring-secondary/10 transition-all";
  return (
    <div>
      <label className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/40 block mb-1.5">{label}</label>
      {textarea ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className={`${base} resize-none`} />
      ) : (
        <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className={base} />
      )}
    </div>
  );
}
