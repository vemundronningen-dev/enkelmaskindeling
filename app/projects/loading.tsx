export default function ProjectsLoading() {
  return (
    <section className="space-y-6 animate-pulse">
      <div className="h-8 w-36 rounded bg-slate-200" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-56 rounded-xl border bg-white" />
        <div className="h-56 rounded-xl border bg-white" />
      </div>
      <div className="h-64 rounded-xl border bg-white" />
      <div className="h-80 rounded-xl border bg-white" />
    </section>
  );
}
