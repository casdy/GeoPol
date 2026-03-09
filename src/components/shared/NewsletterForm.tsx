'use client';

import { useState, useTransition } from 'react';
import { subscribe } from '@/app/actions/subscribe';

interface NewsletterFormProps {
  variant?: 'default' | 'minimal';
}

export default function NewsletterForm({ variant = 'default' }: NewsletterFormProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const isMinimal = variant === 'minimal';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await subscribe(email);

      if (result.success) {
        setMessage({ type: 'success', text: result.success });
        setEmail('');
      } else if (result.error) {
        setMessage({ type: 'error', text: result.error });
      }
    });

  };

  const formContent = (
    <>
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="analyst@command.center"
          required
          suppressHydrationWarning={true}
          disabled={isPending}
          className="flex-1 rounded-lg border border-slate-600/50 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 transition-all duration-200 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending}
          className="group relative shrink-0 whitespace-nowrap inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50"
        >
          {/* Hover shine effect */}
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

          {isPending ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              <span>Subscribing…</span>
            </>
          ) : (
            <>
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2L11 13" />
                <path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
              <span>Subscribe</span>
            </>
          )}
        </button>
      </form>

      {/* Feedback message */}
      {message && (
        <div
          className={`mt-3 flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-300 animate-in fade-in slide-in-from-bottom-2 ${
            message.type === 'success'
              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border border-red-500/20 bg-red-500/10 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          {message.text}
        </div>
      )}
    </>
  );

  if (isMinimal) {
    return <div className="relative w-full">{formContent}</div>;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-900/60 p-6 backdrop-blur-sm">
      {/* Background glow accent */}
      <div className="pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl" />

      {/* Header */}
      <div className="relative mb-4 flex items-center gap-2.5">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-blue-500" />
        </span>
        <h3 className="text-sm font-bold tracking-[0.2em] text-slate-200 uppercase">
          Pulse Daily
        </h3>
      </div>

      <p className="mb-5 text-sm leading-relaxed text-slate-400">
        Top geopolitical intelligence delivered to your inbox every morning at 08:00 UTC.
      </p>

      {formContent}

      {/* Footer */}
      <p className="mt-4 text-xs text-slate-500">
        No spam. Unsubscribe anytime. We respect your OPSEC.
      </p>
    </div>
  );
}

