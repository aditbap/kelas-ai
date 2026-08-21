export function DashboardPlaceholder({
  title,
  description,
  builtIn,
}: {
  title: string;
  description: string;
  builtIn: string;
}) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight text-balance">{title}</h1>
      <p className="mt-2 text-muted-foreground">{description}</p>
      <div
        role="status"
        className="mt-8 rounded-lg border border-dashed border-border bg-card p-6 text-sm text-muted-foreground"
      >
        This area is a placeholder for now — {builtIn}.
      </div>
    </div>
  );
}
