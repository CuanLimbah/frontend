import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Package, DollarSign } from 'lucide-react';
import type { AdminStats } from '../../types';

interface AnalyticsDashboardProps {
  stats: AdminStats;
}

export function AnalyticsDashboard({ stats }: AnalyticsDashboardProps) {
  const wasteColors = {
    food: '#22c55e',
    oil: '#f59e0b',
  };

  const wasteLabels = {
    food: 'Sampah Makanan',
    oil: 'Minyak Jelantah',
  };

  const pieData = stats.waste_by_type.map(item => ({
    name: wasteLabels[item.type],
    value: item.weight,
    color: wasteColors[item.type],
  }));

  const topWaste = [...stats.waste_by_type].sort((left, right) => right.weight - left.weight)[0];
  const growthStart = stats.user_growth[0]?.users ?? 0;
  const growthEnd = stats.user_growth[stats.user_growth.length - 1]?.users ?? 0;
  const growthRate =
    growthStart > 0 ? (((growthEnd - growthStart) / growthStart) * 100).toFixed(1) : '0.0';

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl text-white mb-6">Analytics & Reports</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 border border-purple-500/30">
          <Users className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400 mb-3" />
          <div className="text-gray-400 text-sm mb-1">Total Users</div>
          <div className="text-2xl sm:text-3xl text-white">{stats.total_users}</div>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30">
          <Package className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mb-3" />
          <div className="text-gray-400 text-sm mb-1">Total Limbah (KG)</div>
          <div className="text-2xl sm:text-3xl text-white">{stats.total_waste_collected.toLocaleString('id-ID')}</div>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-500/5 border border-blue-500/30">
          <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400 mb-3" />
          <div className="text-gray-400 text-sm mb-1">Total Cuan</div>
          <div className="text-2xl sm:text-3xl text-white">
            Rp {(stats.total_cuan_distributed / 1000000).toFixed(1)}Jt
          </div>
        </div>

        <div className="p-4 sm:p-6 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30">
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400 mb-3" />
          <div className="text-gray-400 text-sm mb-1">Avg. per User</div>
          <div className="text-2xl sm:text-3xl text-white">
            {stats.total_users > 0
              ? (stats.total_waste_collected / stats.total_users).toFixed(1)
              : '0.0'}{' '}
            KG
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
          <h3 className="text-white mb-4">Pertumbuhan User (30 Hari)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.user_growth}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 15, 0.95)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#9ca3af' }}
                itemStyle={{ color: '#22c55e' }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: '#22c55e', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Waste by Type - Pie Chart */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10">
          <h3 className="text-white mb-4">Distribusi Limbah (KG)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value.toFixed(1)} KG`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 15, 0.95)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Waste by Type - Bar Chart */}
        <div className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 md:col-span-2">
          <h3 className="text-white mb-4">Perbandingan Jenis Limbah</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.waste_by_type}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="type"
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af' }}
                tickFormatter={(value) => wasteLabels[value as keyof typeof wasteLabels]}
              />
              <YAxis stroke="#9ca3af" tick={{ fill: '#9ca3af' }} label={{ value: 'KG', angle: -90, position: 'insideLeft', fill: '#9ca3af' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(10, 10, 15, 0.95)',
                  border: '1px solid rgba(34, 197, 94, 0.3)',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#9ca3af' }}
                formatter={(value: number, name: string, props: any) => [
                  `${value.toFixed(1)} KG`,
                  wasteLabels[props.payload.type as keyof typeof wasteLabels]
                ]}
              />
              <Bar dataKey="weight" radius={[8, 8, 0, 0]}>
                {stats.waste_by_type.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={wasteColors[entry.type]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/30">
          <h4 className="text-white mb-2">Top Performing Waste</h4>
          <div className="text-2xl text-green-500">
            {topWaste ? wasteLabels[topWaste.type] : '-'}
          </div>
          <div className="text-gray-400 text-sm">
            {topWaste ? `${topWaste.weight.toFixed(1)} KG terkumpul` : 'Belum ada data'}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
          <h4 className="text-white mb-2">User Growth Rate</h4>
          <div className="text-2xl text-blue-400">+{growthRate}%</div>
          <div className="text-gray-400 text-sm">30 hari terakhir</div>
        </div>

        <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
          <h4 className="text-white mb-2">Avg. Transaction Value</h4>
          <div className="text-2xl text-purple-400">
            Rp{' '}
            {Math.floor(
              stats.total_users > 0 ? stats.total_cuan_distributed / stats.total_users : 0,
            ).toLocaleString('id-ID')}
          </div>
          <div className="text-gray-400 text-sm">Per user</div>
        </div>
      </div>
    </div>
  );
}
