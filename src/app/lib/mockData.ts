import { User, WasteSubmission, Transaction, WastePrice, DropPoint, UserStats, AdminStats } from '../types';

// Mock current user - will be replaced with Supabase auth
export const mockUser: User = {
  id: '1',
  email: 'user@example.com',
  full_name: 'John Doe',
  role: 'user',
  created_at: new Date().toISOString(),
};

export const mockAdmin: User = {
  id: 'admin-1',
  email: 'admin@cuanlimbah.com',
  full_name: 'Admin User',
  role: 'admin',
  created_at: new Date().toISOString(),
};

export const mockWastePrices: WastePrice[] = [
  { id: '1', waste_type: 'food', price_per_kg: 1000, updated_at: new Date().toISOString(), updated_by: 'admin-1' },
  { id: '2', waste_type: 'oil', price_per_kg: 3000, updated_at: new Date().toISOString(), updated_by: 'admin-1' },
];

export const mockSubmissions: WasteSubmission[] = [
  {
    id: '1',
    user_id: '1',
    waste_type: 'oil',
    estimated_weight: 5,
    actual_weight: 4.8,
    status: 'completed',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    verified_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    earnings: 14400,
  },
  {
    id: '2',
    user_id: '1',
    waste_type: 'food',
    estimated_weight: 3,
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    user_id: '1',
    type: 'deposit',
    amount: 12000,
    status: 'completed',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    submission_id: '1',
  },
];

export const mockDropPoints: DropPoint[] = [
  {
    id: '1',
    name: 'Drop Point Sudirman',
    address: 'Jl. Jend. Sudirman No. 123, Jakarta Pusat',
    latitude: -6.2088,
    longitude: 106.8456,
    operating_hours: 'Senin - Sabtu: 08:00 - 17:00',
    contact: '081234567890',
  },
  {
    id: '2',
    name: 'Drop Point Tebet',
    address: 'Jl. Tebet Raya No. 45, Jakarta Selatan',
    latitude: -6.2297,
    longitude: 106.8560,
    operating_hours: 'Senin - Jumat: 09:00 - 16:00',
    contact: '081234567891',
  },
  {
    id: '3',
    name: 'Drop Point Kelapa Gading',
    address: 'Jl. Boulevard Raya No. 78, Jakarta Utara',
    latitude: -6.1571,
    longitude: 106.9096,
    operating_hours: 'Setiap Hari: 08:00 - 18:00',
    contact: '081234567892',
  },
];

export const mockUserStats: UserStats = {
  total_submissions: 2,
  total_weight: 4.8,
  total_earnings: 12000,
  current_balance: 12000,
  pending_submissions: 1,
};

export const mockAdminStats: AdminStats = {
  total_users: 156,
  total_waste_collected: 2456.5,
  total_cuan_distributed: 6780000,
  pending_verifications: 8,
  pending_withdrawals: 3,
  user_growth: [
    { date: '2026-03-20', users: 120 },
    { date: '2026-03-27', users: 128 },
    { date: '2026-04-03', users: 138 },
    { date: '2026-04-10', users: 145 },
    { date: '2026-04-17', users: 156 },
  ],
  waste_by_type: [
    { type: 'food', weight: 1245.8 },
    { type: 'oil', weight: 1210.7 },
  ],
};
