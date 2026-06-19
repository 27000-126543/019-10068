import { NavLink } from 'react-router-dom';
import { Target, Search, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/tasks', label: '任务分派' },
  { to: '/review', label: '双人判读' },
  { to: '/replay', label: '口径复盘' },
];

export default function TopNav() {
  return (
    <header className="h-14 bg-brand-900 text-white px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-10">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-white/10">
            <Target className="w-5 h-5" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">
            同口径舆情标注工作台
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'px-4 py-2 rounded-md text-sm transition-colors duration-150',
                  isActive
                    ? 'bg-white/10 font-medium text-white'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="全局搜索报道/关键词"
            className="w-72 h-9 pl-9 pr-3 rounded-md bg-white/10 border border-white/10 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:bg-white/15 focus:border-white/20 transition-all"
          />
        </div>

        <button
          type="button"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-white/10 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-xs font-semibold border border-white/20">
            李
          </div>
          <ChevronDown className="w-4 h-4 text-slate-300" />
        </button>
      </div>
    </header>
  );
}
