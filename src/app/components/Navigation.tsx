import { Link, useLocation, useNavigate } from 'react-router';
import { Leaf, LogOut, LayoutDashboard, User, Menu, X } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { useState } from 'react';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const close = () => setIsOpen(false);

  return (
    <>
      <nav className="sticky top-0 z-50">
        <div
          className="backdrop-blur-xl border-b border-green-500/20"
          style={{
            background: 'linear-gradient(to bottom, rgba(10, 10, 15, 0.95), rgba(10, 10, 15, 0.85))',
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link to="/" onClick={close} className="flex items-center gap-2 group shrink-0">
                <div className="bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors">
                  <Leaf className="w-5 h-5 text-green-500" />
                </div>
                <span className="text-lg font-semibold text-white">CuanLimbah</span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden md:flex items-center gap-3 min-w-0">
                {!user && !isLoading && (
                  <>
                    <a
                      href="#features"
                      className="text-gray-300 hover:text-green-500 transition-colors text-sm whitespace-nowrap"
                    >
                      Fitur
                    </a>
                    <a
                      href="#how-it-works"
                      className="text-gray-300 hover:text-green-500 transition-colors text-sm whitespace-nowrap"
                    >
                      Cara Kerja
                    </a>
                    <Link
                      to="/login"
                      className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors border border-green-500/30 text-sm whitespace-nowrap"
                    >
                      Masuk
                    </Link>
                    <Link
                      to="/register"
                      className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/40 text-sm whitespace-nowrap"
                    >
                      Daftar
                    </Link>
                  </>
                )}

                {user && (
                  <>
                    <Link
                      to={user.role === 'admin' ? '/admin' : '/dashboard'}
                      className="flex items-center gap-1.5 text-gray-300 hover:text-green-500 transition-colors text-sm whitespace-nowrap"
                    >
                      <LayoutDashboard className="w-4 h-4 shrink-0" />
                      <span>Dashboard</span>
                    </Link>

                    {/* Email pill — capped width, always truncates */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 min-w-0 max-w-[180px] lg:max-w-[220px]">
                      <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <span className="text-xs text-white truncate">{user.email}</span>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="hidden lg:inline">Keluar</span>
                    </button>
                  </>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsOpen((v) => !v)}
                className="md:hidden p-2 rounded-lg text-gray-300 hover:text-green-500 hover:bg-green-500/10 transition-colors"
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Panel */}
        {isOpen && (
          <div
            className="md:hidden absolute top-full left-0 right-0 z-50 border-b border-green-500/20"
            style={{
              background: 'rgba(10, 10, 15, 0.98)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">

              {!user && !isLoading && (
                <>
                  <a
                    href="#features"
                    onClick={close}
                    className="px-4 py-3 rounded-lg text-gray-300 hover:text-green-500 hover:bg-white/5 transition-colors text-base"
                  >
                    Fitur
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={close}
                    className="px-4 py-3 rounded-lg text-gray-300 hover:text-green-500 hover:bg-white/5 transition-colors text-base"
                  >
                    Cara Kerja
                  </a>
                  <div className="h-px bg-white/10 my-1" />
                  <Link
                    to="/login"
                    onClick={close}
                    className="w-full px-4 py-3 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors border border-green-500/30 text-center text-base"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    onClick={close}
                    className="w-full px-4 py-3 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/40 text-center text-base"
                  >
                    Daftar Sekarang
                  </Link>
                </>
              )}

              {user && (
                <>
                  {/* User info row */}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-gray-400">Login sebagai</div>
                      <div className="text-sm text-white truncate">{user.email}</div>
                    </div>
                  </div>

                  <Link
                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                    onClick={close}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-green-500 hover:bg-white/5 transition-colors text-base"
                  >
                    <LayoutDashboard className="w-5 h-5 shrink-0" />
                    <span>Dashboard</span>
                  </Link>

                  <div className="h-px bg-white/10 my-1" />

                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors text-base w-full text-left"
                  >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span>Keluar</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Backdrop overlay when mobile menu open */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40"
          onClick={close}
        />
      )}
    </>
  );
}
