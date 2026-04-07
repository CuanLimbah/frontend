import { useState } from "react";
import { Link } from "react-router";
import { 
  Home, 
  Truck, 
  Store, 
  Settings, 
  Bell, 
  LogOut, 
  Search,
  Plus,
  ArrowUpRight,
  Droplet,
  Leaf
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const dataEarnings = [
  { name: "Jan", val: 400000 },
  { name: "Feb", val: 650000 },
  { name: "Mar", val: 550000 },
  { name: "Apr", val: 980000 },
  { name: "Mei", val: 1250000 },
  { name: "Jun", val: 1550000 },
];

const dataWaste = [
  { name: "Jelantah", value: 65, color: "#00FF94" },
  { name: "Organik", value: 35, color: "#164E63" },
];

const historyData = [
  { id: "#TRX-0982", date: "12 Jun 2026", type: "Minyak Jelantah", weight: "25 Liter", status: "Completed", amount: "Rp 187.500" },
  { id: "#TRX-0983", date: "15 Jun 2026", type: "Sisa Makanan", weight: "12 Kg", status: "Pending", amount: "Rp 36.000" },
  { id: "#TRX-0984", date: "18 Jun 2026", type: "Minyak Jelantah", weight: "15 Liter", status: "Processed", amount: "Rp 112.500" },
  { id: "#TRX-0985", date: "22 Jun 2026", type: "Sisa Makanan", weight: "8 Kg", status: "Completed", amount: "Rp 24.000" },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen bg-[#050505] flex font-sans text-[#94A3B8]">
      {/* Sidebar */}
      <aside className="w-20 md:w-64 border-r border-[#164E63] flex flex-col items-center md:items-start md:px-6 py-8 h-screen sticky top-0 bg-[#050505] z-50">
        <Link to="/" className="mb-12 flex items-center justify-center md:justify-start space-x-3">
          <div className="w-10 h-10 rounded-xl bg-[#4ADE80] flex items-center justify-center">
            <Leaf className="w-5 h-5 text-[#050505]" />
          </div>
          <span className="text-white font-bold text-xl hidden md:block">CuanLimbah</span>
        </Link>
        
        <nav className="flex-1 space-y-4 w-full px-4 md:px-0">
          {[
            { id: "home", icon: Home, label: "Beranda" },
            { id: "pickups", icon: Truck, label: "Penjemputan" },
            { id: "market", icon: Store, label: "Marketplace" },
            { id: "settings", icon: Settings, label: "Pengaturan" }
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-center md:justify-start space-x-4 p-3 rounded-2xl transition-all ${
                  isActive 
                    ? "bg-[#164E63]/30 text-[#4ADE80] shadow-[0_0_15px_rgba(74,222,128,0.1)]" 
                    : "text-[#94A3B8] hover:bg-[#0A0A0A] hover:text-white"
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? "text-[#4ADE80]" : ""}`} />
                <span className={`font-medium hidden md:block ${isActive ? "text-[#4ADE80]" : ""}`}>{item.label}</span>
              </button>
            )
          })}
        </nav>

        <Link to="/login" className="mt-auto w-full flex items-center justify-center md:justify-start space-x-4 p-3 rounded-2xl text-[#94A3B8] hover:bg-red-900/20 hover:text-red-400 transition-colors">
          <LogOut className="w-6 h-6" />
          <span className="font-medium hidden md:block">Keluar</span>
        </Link>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full relative">
        <div 
          className="absolute top-0 right-0 w-[50rem] h-[50rem] opacity-[0.05] pointer-events-none z-0" 
          style={{
            backgroundImage: `linear-gradient(to right, #164E63 1px, transparent 1px), linear-gradient(to bottom, #164E63 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />
        
        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header */}
          <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Halo, Warung Sederhana</h1>
              <p className="text-sm text-[#94A3B8]">Pantau dan kelola limbah harianmu dengan mudah.</p>
            </div>
            
            <div className="flex items-center space-x-4 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input 
                  type="text" 
                  placeholder="Cari transaksi..." 
                  className="w-full bg-[#0A0A0A] border border-[#164E63] text-white pl-10 pr-4 py-2.5 rounded-full focus:outline-none focus:border-[#4ADE80] text-sm transition-all"
                />
              </div>
              <button className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#164E63] flex items-center justify-center hover:border-[#4ADE80] transition-colors relative">
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#4ADE80] rounded-full border-2 border-[#0A0A0A]" />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Summary Card */}
            <div className="lg:col-span-1 bg-[#4ADE80] p-8 rounded-[2rem] shadow-[0_0_50px_rgba(74,222,128,0.2)] relative overflow-hidden group hover:shadow-[0_0_70px_rgba(74,222,128,0.3)] transition-shadow">
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-[#00FF94] opacity-50 blur-[50px] rounded-full group-hover:blur-[60px] transition-all pointer-events-none" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-12">
                  <div className="text-[#050505]">
                    <p className="font-semibold mb-1 opacity-80">Saldo Tersedia</p>
                    <h2 className="text-4xl lg:text-5xl font-bold tracking-tight">Rp 1.550K</h2>
                  </div>
                  <div className="w-12 h-12 bg-black/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                     <ArrowUpRight className="w-6 h-6 text-[#050505]" />
                  </div>
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-[#050505] text-white py-3.5 rounded-2xl font-semibold hover:bg-[#111] transition-colors shadow-lg">Tarik Saldo</button>
                  <button className="flex-1 bg-black/10 backdrop-blur-sm text-[#050505] border border-black/20 py-3.5 rounded-2xl font-semibold hover:bg-black/20 transition-colors">Top Up</button>
                </div>
              </div>
            </div>

            {/* Total Limbah */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-6">
              <div className="bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#164E63] p-8 rounded-[2rem] flex flex-col justify-center">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#164E63]/30 flex items-center justify-center border border-[#164E63]">
                    <Droplet className="w-6 h-6 text-[#00FF94]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#94A3B8]">Minyak Jelantah</p>
                    <p className="text-2xl font-bold text-white">450 Liter</p>
                  </div>
                </div>
                <div className="w-full bg-[#164E63]/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#00FF94] w-[70%] h-full rounded-full" />
                </div>
                <p className="text-xs text-[#94A3B8] mt-3 flex justify-between">
                  <span>Target Bulanan</span>
                  <span className="text-white">70%</span>
                </p>
              </div>

              <div className="bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#164E63] p-8 rounded-[2rem] flex flex-col justify-center">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#164E63]/30 flex items-center justify-center border border-[#164E63]">
                    <Leaf className="w-6 h-6 text-[#4ADE80]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#94A3B8]">Sisa Organik</p>
                    <p className="text-2xl font-bold text-white">125 Kg</p>
                  </div>
                </div>
                <div className="w-full bg-[#164E63]/30 h-2 rounded-full overflow-hidden">
                  <div className="bg-[#4ADE80] w-[45%] h-full rounded-full" />
                </div>
                <p className="text-xs text-[#94A3B8] mt-3 flex justify-between">
                  <span>Target Bulanan</span>
                  <span className="text-white">45%</span>
                </p>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-[#0A0A0A]/60 border border-[#164E63] p-6 sm:p-8 rounded-[2rem]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-white">Grafik Pendapatan</h3>
                <select className="bg-[#050505] border border-[#164E63] text-sm text-white px-4 py-2 rounded-xl focus:outline-none focus:border-[#4ADE80] transition-colors">
                  <option>Tahun Ini</option>
                  <option>Bulan Ini</option>
                </select>
              </div>
              <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dataEarnings}>
                    <defs>
                      <linearGradient id="colorGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4ADE80" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4ADE80" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#164E63" vertical={false} />
                    <XAxis dataKey="name" stroke="#94A3B8" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                    <YAxis stroke="#94A3B8" axisLine={false} tickLine={false} tickFormatter={(val) => `Rp${val/1000}k`} tick={{ fontSize: 12 }} dx={-10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#164E63', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ color: '#4ADE80' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="val" 
                      stroke="#4ADE80" 
                      strokeWidth={3} 
                      dot={{ fill: '#050505', stroke: '#4ADE80', strokeWidth: 2, r: 4 }} 
                      activeDot={{ r: 6, fill: '#00FF94', stroke: '#fff', strokeWidth: 2 }} 
                      style={{ filter: "drop-shadow(0px 10px 10px rgba(74,222,128,0.2))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-1 bg-[#0A0A0A]/60 border border-[#164E63] p-6 sm:p-8 rounded-[2rem]">
              <h3 className="text-xl font-bold text-white mb-2">Komposisi Limbah</h3>
              <p className="text-sm text-[#94A3B8] mb-6">Total setoran bulan ini</p>
              <div className="h-[200px] w-full relative mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dataWaste}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {dataWaste.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0A0A0A', borderColor: '#164E63', borderRadius: '12px', color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text in donut chart */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-white">575</span>
                  <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider">Unit</span>
                </div>
              </div>
              <div className="space-y-3">
                {dataWaste.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-white">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-white">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Activity Table */}
          <div className="bg-[#0A0A0A]/60 border border-[#164E63] rounded-[2rem] overflow-hidden">
            <div className="p-6 sm:p-8 border-b border-[#164E63] flex justify-between items-center bg-[#0A0A0A]">
              <h3 className="text-xl font-bold text-white">Riwayat Penjemputan</h3>
              <button className="text-sm font-medium text-[#4ADE80] hover:text-[#00FF94] transition-colors flex items-center">
                Lihat Semua <ArrowUpRight className="w-4 h-4 ml-1" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-[#164E63]/50 text-xs uppercase tracking-wider text-[#94A3B8]">
                    <th className="p-4 pl-8 font-medium">ID Transaksi</th>
                    <th className="p-4 font-medium">Tanggal</th>
                    <th className="p-4 font-medium">Jenis Limbah</th>
                    <th className="p-4 font-medium">Berat/Volume</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 pr-8 font-medium text-right">Potensi Cuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#164E63]/30 text-sm">
                  {historyData.map((row, i) => (
                    <tr key={i} className="hover:bg-[#164E63]/10 transition-colors">
                      <td className="p-4 pl-8 text-white font-medium">{row.id}</td>
                      <td className="p-4">{row.date}</td>
                      <td className="p-4">
                        <span className="inline-flex items-center space-x-1.5 bg-[#164E63]/20 border border-[#164E63] px-2.5 py-1 rounded-lg text-white text-xs">
                          {row.type === "Minyak Jelantah" ? <Droplet className="w-3 h-3 text-[#00FF94]" /> : <Leaf className="w-3 h-3 text-[#4ADE80]" />}
                          <span>{row.type}</span>
                        </span>
                      </td>
                      <td className="p-4 font-medium text-white">{row.weight}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold
                          ${row.status === 'Completed' ? 'bg-[#4ADE80]/10 text-[#4ADE80] border border-[#4ADE80]/30' : 
                            row.status === 'Pending' ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30' : 
                            'bg-blue-400/10 text-blue-400 border border-blue-400/30'}
                        `}>
                          {row.status}
                        </span>
                      </td>
                      <td className="p-4 pr-8 font-bold text-white text-right">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Floating Action Button for Mobile */}
          <button className="md:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#4ADE80] shadow-[0_0_30px_rgba(74,222,128,0.4)] flex items-center justify-center text-[#050505] z-50">
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </main>
    </div>
  );
}
