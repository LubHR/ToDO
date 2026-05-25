import TodoList from "./components/TodoList";
import AuthForm from "./components/AuthForm";
import UserSidebar from "./components/UserSidebar";
import { getTodos } from "./actions";
import { getCurrentUser } from "./lib/session";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const user = await getCurrentUser();
  const todos = user ? await getTodos() : [];

  return (
    <main className="relative min-h-screen w-full bg-zinc-950 flex flex-col justify-start px-4 py-20 overflow-x-hidden selection:bg-violet-500/30 selection:text-white">
      {/* Background Decorative Mesh Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[40%] left-[20%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] animate-pulse" />
        <div className="absolute top-[30%] -right-[10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      {/* User Profile Sidebar — only when authenticated */}
      {user && <UserSidebar email={user.email} />}

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center">
        {/* Branding & Header */}
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/25 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-ping" />
            <span className="text-xs font-semibold text-violet-300 tracking-wide uppercase">
              {user ? 'Твій помічник!' : 'Безпечне планування'}
            </span>
          </div>
          <h1 className="text-5xl font-black bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent tracking-tight">
            TaskForge
          </h1>
        </div>

        {/* Content depending on auth state */}
        {user ? (
          <div className="w-full space-y-8">
            {/* Interactive Todo List */}
            <TodoList initialTodos={todos} />
          </div>
        ) : (
          <AuthForm />
        )}
      </div>
    </main>
  );
}
