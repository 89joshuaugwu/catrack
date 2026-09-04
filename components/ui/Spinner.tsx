export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-text-secondary">
      <div className="h-5 w-5 rounded-full border-2 border-border border-t-primary animate-spin" />
      {label && <span className="text-sm">{label}</span>}
    </div>
  );
}
