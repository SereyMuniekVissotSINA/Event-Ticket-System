import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6 py-16 text-slate-900">
      <div className="max-w-lg rounded-4xl border border-slate-200 bg-white p-8 text-center shadow-[0_20px_70px_rgba(16,34,31,0.12)]">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The route you requested does not exist. Return to the welcome page to review the API entry point.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back home
        </Link>
      </div>
    </main>
  )
}