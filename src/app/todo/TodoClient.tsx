'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TodoTask = {
  id: string;
  content: string;
  type: 'planned' | 'actual';
  task_time: string;
  task_date: string;
};

type TodoDeadline = {
  id: string;
  content: string;
  target_date: string;
  target_time: string;
};

export default function TodoClient() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [deadlines, setDeadlines] = useState<TodoDeadline[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  
  // Load data
  useEffect(() => {
    fetchDeadlines();
  }, []);

  useEffect(() => {
    fetchTasks(currentDate);
  }, [currentDate]);

  const fetchTasks = async (date: string) => {
    setLoadingTasks(true);
    try {
      const res = await fetch(`/api/todo/tasks?date=${date}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchDeadlines = async () => {
    try {
      const res = await fetch('/api/todo/deadlines');
      if (res.ok) {
        const data = await res.json();
        setDeadlines(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleNextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  const handlePrevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="flex-1 flex flex-col p-4 md:p-8 max-w-7xl mx-auto w-full">
      <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-800">
            COMMAND CENTER
          </h1>
          <p className="text-neutral-500 font-mono text-sm mt-1">SYSTEM_OK // PRODUCTIVITY_MODULE_ACTIVE</p>
        </div>
        <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 p-2 rounded-xl">
          <button onClick={handlePrevDay} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <input 
            type="date" 
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="bg-transparent text-white font-mono text-sm border-none outline-none"
          />
          <button onClick={handleNextDay} className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </header>

      <section className="mb-10 animate-fade-in">
        <h2 className="text-sm font-bold text-neutral-500 tracking-wider uppercase mb-4 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-500"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Critical Deadlines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DeadlineList deadlines={deadlines} onAdd={fetchDeadlines} onDelete={fetchDeadlines} />
        </div>
      </section>

      <section className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-[50vh]">
        <TaskList 
          title="Planned Directives" 
          type="planned" 
          date={currentDate} 
          tasks={tasks.filter(t => t.type === 'planned')} 
          refresh={() => fetchTasks(currentDate)}
          loading={loadingTasks}
        />
        <TaskList 
          title="Actual Execution" 
          type="actual" 
          date={currentDate} 
          tasks={tasks.filter(t => t.type === 'actual')} 
          refresh={() => fetchTasks(currentDate)}
          loading={loadingTasks}
        />
      </section>
    </div>
  );
}

function DeadlineList({ deadlines, onAdd, onDelete }: { deadlines: TodoDeadline[], onAdd: () => void, onDelete: () => void }) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('12:00');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    await fetch('/api/todo/deadlines', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, target_date: date, target_time: time + ':00' })
    });
    setContent('');
    onAdd();
  };

  const handleRemove = async (id: string) => {
    await fetch(`/api/todo/deadlines?id=${id}`, { method: 'DELETE' });
    onDelete();
  };

  return (
    <>
      <AnimatePresence>
        {deadlines.map((d) => (
          <motion.div 
            key={d.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-neutral-900/50 border border-red-900/30 p-4 rounded-xl relative group hover:border-red-500/50 transition-colors"
          >
            <button onClick={() => handleRemove(d.id)} className="absolute top-3 right-3 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            <p className="font-medium text-white mb-2 pr-6 leading-tight">{d.content}</p>
            <div className="flex items-center gap-3 text-xs font-mono text-red-400/80">
              <span className="bg-red-500/10 px-2 py-1 rounded">{d.target_date}</span>
              <span>{d.target_time.slice(0, 5)}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      <form onSubmit={handleAdd} className="flex flex-col gap-2 bg-neutral-900 border border-neutral-800 border-dashed hover:border-neutral-600 p-4 rounded-xl transition-colors">
        <input 
          type="text" 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="+ Add New Deadline..."
          className="bg-transparent outline-none text-white text-sm"
        />
        <div className="flex items-center gap-2 mt-2 border-t border-neutral-800 pt-2">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-neutral-950 text-neutral-400 text-xs px-2 py-1 rounded outline-none" required />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="bg-neutral-950 text-neutral-400 text-xs px-2 py-1 rounded outline-none" required />
          <button type="submit" className="ml-auto bg-neutral-800 hover:bg-neutral-700 text-white text-xs px-3 py-1 rounded transition-colors">Save</button>
        </div>
      </form>
    </>
  );
}

function TaskList({ title, type, date, tasks, refresh, loading }: { title: string, type: 'planned' | 'actual', date: string, tasks: TodoTask[], refresh: () => void, loading: boolean }) {
  const [content, setContent] = useState('');
  const [time, setTime] = useState('09:00');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    await fetch('/api/todo/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, type, task_date: date, task_time: time + ':00' })
    });
    setContent('');
    refresh();
  };

  const handleRemove = async (id: string) => {
    await fetch(`/api/todo/tasks?id=${id}`, { method: 'DELETE' });
    refresh();
  };

  return (
    <div className="flex flex-col bg-neutral-900/30 border border-neutral-800/80 rounded-2xl overflow-hidden shadow-2xl relative">
      <div className={`p-4 border-b border-neutral-800 flex items-center justify-between bg-black/40`}>
        <h3 className="font-bold tracking-wide text-sm flex items-center gap-2 uppercase">
          <span className={`w-2 h-2 rounded-full ${type === 'planned' ? 'bg-blue-500' : 'bg-green-500'}`}></span>
          {title}
        </h3>
        <span className="font-mono text-xs text-neutral-500">{tasks.length} items</span>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <AnimatePresence>
          {tasks.map((t) => (
            <motion.div 
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="group flex gap-4 p-3 hover:bg-neutral-800/50 rounded-xl transition-colors border border-transparent hover:border-neutral-700/50 mb-2 relative"
            >
              <div className="font-mono text-xs text-neutral-500 py-1 shrink-0">{t.task_time.slice(0, 5)}</div>
              <div className="flex-1 text-neutral-200">{t.content}</div>
              <button onClick={() => handleRemove(t.id)} className="shrink-0 text-neutral-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 py-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </motion.div>
          ))}
          {!loading && tasks.length === 0 && (
            <div className="text-center py-10 text-neutral-600 text-sm font-mono italic">
              No entries logged.
            </div>
          )}
          {loading && tasks.length === 0 && (
            <div className="text-center py-10 text-neutral-600 text-sm font-mono animate-pulse">
              Loading payload...
            </div>
          )}
        </AnimatePresence>
      </div>

      <div className="p-4 border-t border-neutral-800 bg-neutral-950">
        <form onSubmit={handleAdd} className="flex gap-2">
          <input 
            type="time" 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="bg-black border border-neutral-800 text-neutral-300 rounded-lg px-3 py-2 text-sm font-mono outline-none focus:border-neutral-600 transition-colors w-28 shrink-0"
            required
          />
          <input 
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`Log ${type} activity...`}
            className="flex-1 bg-black border border-neutral-800 text-white rounded-lg px-4 py-2 text-sm outline-none focus:border-neutral-600 transition-colors"
          />
          <button type="submit" className="bg-white text-black font-semibold rounded-lg px-4 py-2 text-sm hover:bg-neutral-200 transition-colors shrink-0">
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
