'use client';

import { useState } from 'react';
import { logout } from '@/app/lib/auth-actions';

interface UserSidebarProps {
  email: string;
}

export default function UserSidebar({ email }: UserSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const initials = email.slice(0, 2).toUpperCase();

  return (
    <>
      {/* Avatar Button — fixed top right */}
      <button
        id="user-avatar-btn"
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/20 hover:scale-110 hover:shadow-violet-500/40 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-violet-400/30"
        title="Профіль користувача"
      >
        {initials}
      </button>

      {/* Backdrop */}
      <div
        onClick={() => setIsOpen(false)}
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sliding Sidebar Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-80 bg-zinc-950 border-l border-white/[0.08] shadow-2xl shadow-black/60 flex flex-col transition-transform duration-400 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <span className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Акаунт</span>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* User Info Card */}
        <div className="px-6 py-6 space-y-5 flex-1">
          {/* Avatar + Email */}
          <div className="flex flex-col items-center gap-4 py-6 bg-white/[0.02] border border-white/[0.06] rounded-3xl">
            {/* Big Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-violet-500/30">
                {initials}
              </div>
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-zinc-950" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-semibold text-base">{email}</p>
              <p className="text-xs text-emerald-400 font-medium">● Online</p>
            </div>
          </div>

          {/* Info rows */}
          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 font-medium">Пошта</p>
                <p className="text-sm text-zinc-200 truncate">{email}</p>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom: Switch Account (Logout) */}
        <div className="px-6 pb-8 space-y-3">
          <div className="h-px bg-white/[0.06]" />
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/15 hover:border-red-500/30 font-semibold text-sm active:scale-[0.98] transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Змінити акаунт / Вийти
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
