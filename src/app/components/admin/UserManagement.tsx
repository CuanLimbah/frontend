import { User, TrendingUp, Package, DollarSign, Search } from 'lucide-react';
import { useState } from 'react';
import type { AdminUser } from '../../types';

interface UserManagementProps {
  users: AdminUser[];
}

export function UserManagement({ users }: UserManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter((user) =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl text-white">User Management</h2>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari user..."
            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-green-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-left text-sm text-gray-400">User</th>
              <th className="px-6 py-4 text-left text-sm text-gray-400">Total Setoran</th>
              <th className="px-6 py-4 text-left text-sm text-gray-400">Total Kuantitas</th>
              <th className="px-6 py-4 text-left text-sm text-gray-400">Total Earnings</th>
              <th className="px-6 py-4 text-left text-sm text-gray-400">Status</th>
              <th className="px-6 py-4 text-left text-sm text-gray-400">Bergabung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="bg-white/5 hover:bg-white/10 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <div className="text-white">{user.display_name}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-400" />
                    <span className="text-white">{user.total_submissions}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-white">{user.total_weight}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <span className="text-green-500">Rp {user.total_earnings.toLocaleString('id-ID')}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`
                    px-3 py-1 rounded-full text-sm
                    ${user.status === 'active'
                      ? 'bg-green-500/20 text-green-500 border border-green-500/30'
                      : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                    }
                  `}>
                    {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-400">
                  {new Date(user.joined_at).toLocaleDateString('id-ID')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30">
          <div className="text-gray-400 text-sm mb-1">Total Users</div>
          <div className="text-2xl text-white">{users.length}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30">
          <div className="text-gray-400 text-sm mb-1">Active Users</div>
          <div className="text-2xl text-white">
            {users.filter((user) => user.status === 'active').length}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30">
          <div className="text-gray-400 text-sm mb-1">Avg. Contribution</div>
          <div className="text-2xl text-white">
            {users.length > 0
              ? (users.reduce((sum, user) => sum + user.total_weight, 0) / users.length).toFixed(1)
              : '0.0'}{' '}
          </div>
        </div>
      </div>
    </div>
  );
}
