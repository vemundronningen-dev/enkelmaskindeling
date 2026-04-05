export default function MachinesLoading() {
  return (
    <section className="space-y-6 animate-pulse">
      <div className="h-8 w-40 rounded bg-slate-200" />
      <div className="rounded-xl border bg-white p-4 space-y-3">
        <div className="h-6 w-36 rounded bg-slate-200" />
        <div className="grid gap-3 md:grid-cols-2">
          <div className="h-10 rounded bg-slate-100" />
          <div className="h-10 rounded bg-slate-100" />
          <div className="h-10 rounded bg-slate-100" />
          <div className="h-10 rounded bg-slate-100" />
        </div>
      </div>
      <div className="h-72 rounded-xl border bg-white" />
    </section>
  );
}
