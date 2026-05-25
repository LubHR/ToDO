'use client';

import { useState, useTransition, useMemo } from "react";
import { addTodo, toggleTodo, deleteTodo, reorderTodos } from "../actions";

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  order: number;
  createdAt: Date;
}

interface TodoListProps {
  initialTodos: Todo[];
}

export default function TodoList({ initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState<Todo[]>(initialTodos);
  const [newTitle, setNewTitle] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Keep local state in sync when initialTodos change
  useMemo(() => {
    setTodos(initialTodos);
  }, [initialTodos]);

  // Statistics
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const active = total - completed;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, percentage };
  }, [todos]);

  // Filtered and searched todos
  const filteredTodos = useMemo(() => {
    return todos.filter(todo => {
      const matchesSearch = todo.title.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === "active") return !todo.completed;
      if (filter === "completed") return todo.completed;
      return true;
    });
  }, [todos, searchQuery, filter]);

  // Actions
  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const titleToSend = newTitle;
    setNewTitle(""); // Clear input immediately for snappy feel

    // Optimistic update
    const tempId = Math.random().toString();
    const minOrder = todos.length > 0 ? Math.min(...todos.map(t => t.order)) : 0;
    const tempTodo: Todo = {
      id: tempId,
      title: titleToSend,
      completed: false,
      order: minOrder - 1,
      createdAt: new Date(),
    };
    setTodos(prev => [tempTodo, ...prev]);

    startTransition(async () => {
      await addTodo(titleToSend);
    });
  };

  const handleToggle = (id: string, currentCompleted: boolean) => {
    // Optimistic update
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !currentCompleted } : todo
      )
    );

    startTransition(async () => {
      await toggleTodo(id, !currentCompleted);
    });
  };

  const handleDelete = (id: string) => {
    // Optimistic update
    setTodos(prev => prev.filter(todo => todo.id !== id));

    startTransition(async () => {
      await deleteTodo(id);
    });
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);

    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;

    const sourceIndex = todos.findIndex(t => t.id === sourceId);
    const targetIndex = todos.findIndex(t => t.id === targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newTodos = [...todos];
    const [draggedItem] = newTodos.splice(sourceIndex, 1);
    newTodos.splice(targetIndex, 0, draggedItem);

    // Update order property optimistically
    const updatedTodos = newTodos.map((todo, idx) => ({
      ...todo,
      order: idx,
    }));

    setTodos(updatedTodos);

    startTransition(async () => {
      await reorderTodos(updatedTodos.map(t => t.id));
    });
  };

  const handleDragEnd = () => {
    setDragOverId(null);
  };

  // Layout calculations
  const hasMoreThan5 = todos.length > 5;
  const hasMoreThan10 = todos.length > 10;

  return (
    <div className={`w-full mx-auto space-y-8 animate-fade-in transition-all duration-500 ease-in-out ${hasMoreThan5 ? "max-w-4xl" : "max-w-2xl"}`}>
      {/* Dashboard Stats */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Tasks */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Всього</p>
          <p className="mt-2 text-3xl font-bold text-white tracking-tight">{stats.total}</p>
        </div>

        {/* Active Tasks */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Активні</p>
          <p className="mt-2 text-3xl font-bold text-cyan-400 tracking-tight">{stats.active}</p>
        </div>

        {/* Completed Tasks */}
        <div className="relative overflow-hidden rounded-3xl bg-white/[0.03] border border-white/[0.08] p-5 backdrop-blur-xl transition-all duration-300 hover:border-white/20">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Виконані</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold text-emerald-400 tracking-tight">{stats.completed}</p>
            <p className="text-xs text-zinc-500">({stats.percentage}%)</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 rounded-full bg-white/[0.05] border border-white/[0.08] overflow-hidden p-0.5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 transition-all duration-500 shadow-[0_0_12px_rgba(124,58,237,0.4)]"
          style={{ width: `${stats.percentage}%` }}
        />
      </div>

      {/* Form Input */}
      <form onSubmit={handleAdd} className="relative flex gap-3">
        <input
          id="new-todo-input"
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Додати нове завдання..."
          className="w-full bg-white/[0.03] border border-white/[0.08] rounded-2xl py-4 px-5 pr-12 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/35 focus:border-violet-500 transition-all backdrop-blur-md"
        />
        <button
          id="add-todo-button"
          type="submit"
          disabled={!newTitle.trim() || isPending}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-zinc-800 disabled:to-zinc-800 disabled:text-zinc-600 disabled:cursor-not-allowed text-white font-semibold px-6 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Створити
        </button>
      </form>

      {/* Search & Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white/[0.02] border border-white/[0.06] p-3 rounded-2xl backdrop-blur-md">
        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-zinc-500">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            id="search-todos-input"
            type="text"
            placeholder="Пошук..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl py-2 pl-9 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-1.5 p-0.5 bg-black/20 rounded-xl border border-white/[0.05] w-full sm:w-auto justify-around sm:justify-start">
          <button
            id="filter-all-btn"
            type="button"
            onClick={() => setFilter("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filter === "all"
                ? "bg-white/10 text-white shadow-sm"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Всі
          </button>
          <button
            id="filter-active-btn"
            type="button"
            onClick={() => setFilter("active")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filter === "active"
                ? "bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Активні
          </button>
          <button
            id="filter-completed-btn"
            type="button"
            onClick={() => setFilter("completed")}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              filter === "completed"
                ? "bg-emerald-500/20 text-emerald-300 shadow-sm border border-emerald-500/20"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Виконані
          </button>
        </div>
      </div>

      {/* Drag & Drop Hint */}
      <div className="text-center text-xs text-zinc-500 italic">
        💡 Затисніть та перетягніть завдання за допомогою сірого маркеру зліва, щоб змінити порядок.
      </div>

      {/* Task List container with conditional scrollbar */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          hasMoreThan10
            ? "max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
            : ""
        }`}
      >
        {/* Animated Flex-Wrap Layout */}
        <div
          className="flex flex-wrap gap-3 transition-all duration-500 ease-in-out"
        >
          {filteredTodos.length === 0 ? (
            <div className="w-full text-center py-12 bg-white/[0.01] border border-white/[0.04] rounded-3xl backdrop-blur-xl transition-all duration-500">
              <svg className="w-12 h-12 text-zinc-600 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-zinc-400 font-medium">Жодних завдань не знайдено</p>
              <p className="text-zinc-600 text-sm mt-1">Додайте нове або змініть фільтри</p>
            </div>
          ) : (
            filteredTodos.map((todo) => (
              <div
                key={todo.id}
                draggable
                onDragStart={(e) => handleDragStart(e, todo.id)}
                onDragOver={(e) => handleDragOver(e, todo.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, todo.id)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-500 ease-in-out group ${
                  hasMoreThan5
                    ? "w-full md:w-[calc(50%-6px)]"
                    : "w-full"
                } ${
                  dragOverId === todo.id
                    ? "border-violet-500 bg-violet-500/10 scale-[1.01] shadow-[0_0_15px_rgba(139,92,246,0.2)]"
                    : todo.completed
                    ? "bg-white/[0.01] border-white/[0.03] opacity-60"
                    : "bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/12 hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                }`}
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  {/* Drag Handle */}
                  <div
                    className="text-zinc-600 hover:text-zinc-400 transition-colors cursor-grab active:cursor-grabbing p-1"
                    title="Перетягнути"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm7-12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
                    </svg>
                  </div>

                  {/* Custom Checkbox */}
                  <button
                    id={`toggle-${todo.id}`}
                    type="button"
                    onClick={() => handleToggle(todo.id, todo.completed)}
                    className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center transition-all duration-300 border-2 cursor-pointer shrink-0 ${
                      todo.completed
                        ? "bg-emerald-500 border-emerald-500 text-white scale-95 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                        : "border-zinc-500 hover:border-violet-400 text-transparent"
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>

                  {/* Todo Title */}
                  <span
                    className={`text-sm select-none truncate transition-all duration-300 ${
                      todo.completed
                        ? "text-zinc-500 line-through decoration-emerald-500/40"
                        : "text-zinc-100"
                    }`}
                  >
                    {todo.title}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1">
                  <button
                    id={`delete-${todo.id}`}
                    type="button"
                    onClick={() => handleDelete(todo.id)}
                    className="p-1.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all opacity-0 group-hover:opacity-100 sm:opacity-100 duration-200 cursor-pointer"
                    title="Видалити завдання"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
