import { Outlet } from 'react-router-dom';

export default function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-800 text-white px-6 py-4">
        <h1 className="text-xl font-semibold">舆情协同标注工作台</h1>
      </header>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
