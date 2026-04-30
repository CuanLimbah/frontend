export type UserRole = 'admin' | 'user' | 'driver';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  email: string;
  full_name: string;
  business_name?: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  avatar_url?: string;
  phone_number?: string;
  vehicle_number?: string;
}

export type WasteType = 'food' | 'oil';

export type SubmissionStatus = 'pending' | 'verified' | 'completed' | 'rejected';

export interface WasteSubmission {
  id: string;
  user_id: string;
  waste_type: WasteType;
  estimated_weight: number;
  actual_weight?: number;
  image_url?: string;
  status: SubmissionStatus;
  created_at: string;
  verified_at?: string;
  completed_at?: string;
  notes?: string;
  earnings?: number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  completed_at?: string;
  submission_id?: string;
  withdrawal_method?: WithdrawalMethod;
  withdrawal_account?: string;
  notes?: string;
}

export type WithdrawalMethod = 'gopay' | 'ovo' | 'dana' | 'bank';

export interface WastePrice {
  id: string;
  waste_type: WasteType;
  price_per_kg: number;
  updated_at: string;
  updated_by: string;
}

export interface DropPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  operating_hours: string;
  contact: string;
}

export interface UserStats {
  total_submissions: number;
  total_weight: number;
  total_earnings: number;
  current_balance: number;
  pending_submissions: number;
}

export interface AdminStats {
  total_users: number;
  total_waste_collected: number;
  total_cuan_distributed: number;
  pending_verifications: number;
  pending_withdrawals: number;
  user_growth: Array<{ date: string; users: number }>;
  waste_by_type: Array<{ type: WasteType; weight: number }>;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  redirectTo: string;
}

export interface UserDashboardData {
  user: User;
  stats: UserStats;
  waste_prices: WastePrice[];
  submissions: WasteSubmission[];
  transactions: Transaction[];
  drop_points: DropPoint[];
}

export interface AdminUser extends User {
  display_name: string;
  total_submissions: number;
  total_weight: number;
  total_earnings: number;
  joined_at: string;
}

export interface AdminWithdrawalRequest {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  amount: number;
  method: string;
  account: string;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  completed_at?: string;
  notes?: string;
}

export interface AdminWithdrawals {
  pending: AdminWithdrawalRequest[];
  processed: AdminWithdrawalRequest[];
}

export interface AdminDashboardData {
  stats: AdminStats;
  prices: WastePrice[];
  pending_submissions: WasteSubmission[];
  users: AdminUser[];
  drivers: User[];
  pickup_routes: PickupRoute[];
  payments: PaymentRecord[];
  withdrawals: AdminWithdrawals;
}

export type PickupRouteStatus =
  | 'assigned'
  | 'on_the_way'
  | 'picked_up'
  | 'completed'
  | 'cancelled';

export interface PickupRoute {
  id: string;
  submission_id: string;
  user_id: string;
  driver_id: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  scheduled_at: string;
  status: PickupRouteStatus;
  created_at: string;
  started_at?: string;
  picked_up_at?: string;
  completed_at?: string;
  notes?: string;
  user_name?: string;
  user_email?: string;
  driver_name?: string;
  driver_email?: string;
  driver_vehicle?: string;
  submission?: WasteSubmission;
}

export type PaymentMethod = 'qris' | 'virtual_account' | 'ewallet';

export type PaymentStatus = 'pending' | 'paid' | 'expired' | 'failed';

export interface PaymentRecord {
  id: string;
  user_id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  provider: string;
  purpose: string;
  checkout_url: string;
  external_reference?: string;
  created_at: string;
  paid_at?: string;
  expires_at?: string;
  notes?: string;
}

export interface DriverDashboardData {
  driver: User;
  routes: PickupRoute[];
  stats: {
    assigned: number;
    active: number;
    completed: number;
  };
}
