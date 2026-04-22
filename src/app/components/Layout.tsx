import { ReactNode } from 'react';
import { Outlet } from 'react-router';
import { Navigation } from './Navigation';

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-x-hidden dark">
      {/* Grid pattern background dengan kotak-kotak */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(34, 197, 94, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(34, 197, 94, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Gradient overlay untuk depth */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(10, 10, 15, 0.8) 100%)',
        }}
      />

      <Navigation />

      <main className="relative z-10">
        {children || <Outlet />}
      </main>

      {/* Footer */}
      <footer className="relative z-10 mt-20 border-t border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="text-gray-400 text-sm">
              © 2026 CuanLimbah. Platform Circular Economy untuk UMKM Indonesia.
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                Tentang
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                Kontak
              </a>
              <a href="#" className="text-gray-400 hover:text-green-500 transition-colors text-sm">
                Kebijakan Privasi
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
