import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Headset, LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/tickets', label: 'My tickets', end: true },
    { to: '/tickets/new', label: 'New ticket', end: true },
    ...(user?.role === 'admin'
      ? [
          { to: '/admin', label: 'Admin dashboard', end: true },
          { to: '/admin/users', label: 'Users', end: true },
        ]
      : []),
    { to: '/profile', label: 'Profile', end: true },
  ];

  const handleLogout = async () => {
    await logout();
    toast.success('Signed out');
    navigate('/login', { replace: true });
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/tickets" className="flex items-center gap-2 font-semibold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-600 text-white">
              <Headset className="h-4 w-4" />
            </span>
            Helpdesk
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-slate-800">{user?.name}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
            </div>
            <button className="btn-secondary px-3" onClick={handleLogout} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          <button
            className="btn-secondary px-2 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav id="mobile-nav" className="border-t border-slate-200 px-4 py-3 md:hidden" aria-label="Mobile">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <div className="text-sm">
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
              <button className="btn-secondary" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Sign out
              </button>
            </div>
          </nav>
        )}
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  );
}
