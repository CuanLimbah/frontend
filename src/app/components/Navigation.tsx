import { Link, useLocation, useNavigate } from 'react-router';
import { Leaf, LogOut, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';

export function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isLoading } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardPath =
    user?.role === 'admin' ? '/admin' : user?.role === 'driver' ? '/driver' : '/dashboard';

  return (
    <nav className="sticky top-0 z-50 border-b border-green-500/10">
      <div
        className="backdrop-blur-xl bg-[#0a0a0f]/80 border-b border-green-500/20"
        style={{
          background: 'linear-gradient(to bottom, rgba(10, 10, 15, 0.9), rgba(10, 10, 15, 0.7))',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-green-500/10 p-2 rounded-lg group-hover:bg-green-500/20 transition-colors">
                <Leaf className="w-6 h-6 text-green-500" />
              </div>
              <span className="text-xl font-semibold text-white">CuanLimbah</span>
            </Link>

            <div className="flex items-center gap-4">
              {!user && !isLoading && (
                <>
                  <a
                    href="#features"
                    className="text-gray-300 hover:text-green-500 transition-colors"
                  >
                    Fitur
                  </a>
                  <a
                    href="#how-it-works"
                    className="text-gray-300 hover:text-green-500 transition-colors"
                  >
                    Cara Kerja
                  </a>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors border border-green-500/30"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-lg shadow-green-500/50"
                  >
                    Daftar
                  </Link>
                </>
              )}

              {user && (
                <>
                  <Link
                    to={dashboardPath}
                    className="flex items-center gap-2 text-gray-300 hover:text-green-500 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>

                  <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                      <User className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-sm text-white">{user.email}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
