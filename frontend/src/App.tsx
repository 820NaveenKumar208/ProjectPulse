export function App() {
  return (
    <main className="min-h-screen bg-pulse-background text-pulse-text">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-wide text-pulse-primary">
            ProjectPulse
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-normal sm:text-5xl">
            Client-facing project visibility is taking shape.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Phase 1 foundation is wired with React, Vite, TypeScript, Tailwind CSS, and routing.
            Product screens will be implemented after approval.
          </p>
        </div>
      </section>
    </main>
  );
}
