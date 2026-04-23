import { cookies } from 'next/headers';
import { verifyTodoToken } from '@/lib/todo-auth';
import TodoClient from './TodoClient';
import AuthWall from './AuthWall';

export const metadata = {
  title: 'Dashboard | DareDev Productivity',
};

export default async function TodoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('todo_session')?.value;
  const isAuthenticated = token ? verifyTodoToken(token) : false;

  return (
    <main className="min-h-screen bg-neutral-950 font-sans text-neutral-100 selection:bg-red-500/30 flex flex-col">
      {isAuthenticated ? <TodoClient /> : <AuthWall />}
    </main>
  );
}
