'use client';

import { useState, useActionState } from 'react';
import { login, signup } from '@/app/lib/auth-actions';

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  
  const [loginState, loginAction, isLoginPending] = useActionState(login, undefined);
  const [signupState, signupAction, isSignupPending] = useActionState(signup, undefined);

  const error = mode === 'login' ? loginState?.error : signupState?.error;
  const isPending = isLoginPending || isSignupPending;

  return (
    <div className="w-full max-w-md mx-auto relative z-10 animate-fade-in">
      {/* Decorative Blur Backdrops */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-600 to-indigo-600 opacity-20 blur-xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative overflow-hidden rounded-3xl bg-white/[0.02] border border-white/[0.08] backdrop-blur-xl p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl font-black bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent tracking-tight">
            {mode === 'login' ? 'Ласкаво просимо' : 'Створити акаунт'}
          </h2>
          <p className="text-zinc-500 text-sm">
            {mode === 'login' 
              ? 'Увійдіть, щоб отримати доступ до своїх завдань' 
              : 'Зареєструйтеся, щоб розпочати роботу з TaskForge'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex p-1 bg-black/30 rounded-2xl border border-white/[0.05] mb-6">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
              mode === 'login'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Вхід
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
              mode === 'signup'
                ? 'bg-white/10 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Реєстрація
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 animate-fade-in">
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form action={mode === 'login' ? loginAction : signupAction} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Електронна пошта
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="example@mail.com"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/35 focus:border-violet-500 transition-all"
            />
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Пароль
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/35 focus:border-violet-500 transition-all"
            />
          </div>

          {/* Confirm Password field (only signup) */}
          {mode === 'signup' && (
            <div className="space-y-1.5 animate-fade-in">
              <label htmlFor="confirmPassword" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Підтвердження паролю
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                placeholder="••••••••"
                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-3.5 px-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-violet-500/35 focus:border-violet-500 transition-all"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 active:scale-[0.98] transition-all cursor-pointer mt-2"
          >
            {isPending ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Будь ласка, зачекайте...</span>
              </>
            ) : (
              <span>{mode === 'login' ? 'Увійти' : 'Зареєструватися'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
