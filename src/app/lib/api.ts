import type {
  AdminDashboardData,
  AuthResponse,
  DriverDashboardData,
  PaymentMethod,
  PaymentRecord,
  PickupRoute,
  PickupRouteStatus,
  QualityAiAnalytics,
  QualityFeedbackSeverity,
  QualityFeedbackTag,
  QualityGrade,
  QualityCheckResult,
  QualityGradeSource,
  User,
  UserDashboardData,
  WithdrawalMethod,
  WasteType,
  WasteSubmission,
  Transaction,
} from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || 'http://localhost:3000';

export function getApiBaseUrl() {
  return API_BASE_URL;
}

export function getGoogleAuthStartUrl() {
  return `${API_BASE_URL}/auth/google`;
}

export class ApiError extends Error {
  status: number;
  data?: unknown;

  constructor(message: string, status: number, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

function buildHeaders(
  token?: string,
  hasBody?: boolean,
  initHeaders?: HeadersInit,
): Headers {
  const headers = new Headers(initHeaders);

  if (hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (!headers.has('Accept')) {
    headers.set('Accept', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (
    data &&
    typeof data === 'object' &&
    'message' in data &&
    typeof data.message === 'string'
  ) {
    return data.message;
  }

  if (
    data &&
    typeof data === 'object' &&
    'message' in data &&
    Array.isArray(data.message)
  ) {
    return data.message.join(', ');
  }

  return fallback;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const hasBody = options.body !== undefined && options.body !== null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(token, hasBody, options.headers),
  });

  const raw = await response.text();
  const data = raw ? (JSON.parse(raw) as unknown) : null;

  if (!response.ok) {
    throw new ApiError(
      extractErrorMessage(data, 'Terjadi kesalahan saat menghubungi server'),
      response.status,
      data,
    );
  }

  return data as T;
}

export function getErrorMessage(
  error: unknown,
  fallback = 'Terjadi kesalahan, silakan coba lagi.',
): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  businessName?: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateSubmissionPayload {
  wasteType: WasteType;
  estimatedWeight: number;
  dropPointId?: string;
  imageUrl?: string;
}

export interface VerifySubmissionPayload {
  actualWeight: number;
  qualityGrade?: QualityGrade;
  qualityGradeSource?: QualityGradeSource;
  adminQualityNotes?: string;
  overrideReasonTags?: QualityFeedbackTag[];
  overridePrimaryReason?: QualityFeedbackTag;
  overrideFeedbackSeverity?: QualityFeedbackSeverity;
}

export interface QualityCheckPayload {
  conditionDescription?: string;
}

export interface QualityAiAnalyticsParams {
  startDate?: string;
  endDate?: string;
  wasteType?: WasteType;
}

export interface CreateWithdrawalPayload {
  amount: number;
  method: WithdrawalMethod;
  account: string;
}

export interface CreateDriverPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  vehicleNumber?: string;
}

export interface AssignPickupRoutePayload {
  submissionId: string;
  driverId: string;
  dropPointId: string;
  scheduledAt?: string;
  notes?: string;
}

export interface UpdatePickupRouteStatusPayload {
  status: PickupRouteStatus;
  notes?: string;
}

export interface UpdateDriverLocationPayload {
  latitude: number;
  longitude: number;
}

export interface CreatePaymentPayload {
  amount: number;
  method: PaymentMethod;
  purpose?: string;
  notes?: string;
}

export interface SessionData {
  accessToken: string;
  user: User;
}

export interface ChatAction {
  type: 'NAVIGATE' | 'ACTION';
  payload: string;
  reason?: string;
}

export interface ChatResponse {
  reply: string;
  action?: ChatAction | null;
  error?: string;
}

export interface ChatMessagePayload {
  message: string;
  userId?: string;
}

export interface UserDashboardActionHandlers {
  createSubmission: (payload: CreateSubmissionPayload) => Promise<WasteSubmission>;
  createWithdrawal: (payload: CreateWithdrawalPayload) => Promise<Transaction>;
}

export const api = {
  login(payload: LoginPayload) {
    return request<AuthResponse>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  register(payload: RegisterPayload) {
    return request<AuthResponse>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  },

  getCurrentUser(token: string) {
    return request<User>('/auth/me', {}, token);
  },

  getUserDashboard(token: string) {
    return request<UserDashboardData>('/users/me/dashboard', {}, token);
  },

  createSubmission(token: string, payload: CreateSubmissionPayload) {
    return request<WasteSubmission>(
      '/submissions',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  createWithdrawal(token: string, payload: CreateWithdrawalPayload) {
    return request<Transaction>(
      '/transactions/withdrawals',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  getAdminDashboard(token: string) {
    return request<AdminDashboardData>('/admin/dashboard', {}, token);
  },

  getQualityAiAnalytics(token: string, params?: QualityAiAnalyticsParams) {
    const searchParams = new URLSearchParams();

    if (params?.startDate) searchParams.set('startDate', params.startDate);
    if (params?.endDate) searchParams.set('endDate', params.endDate);
    if (params?.wasteType) searchParams.set('wasteType', params.wasteType);

    const query = searchParams.toString();
    return request<QualityAiAnalytics>(
      `/admin/analytics/quality-ai${query ? `?${query}` : ''}`,
      {},
      token,
    );
  },

  verifySubmission(
    token: string,
    submissionId: string,
    payload: VerifySubmissionPayload,
  ) {
    return request<WasteSubmission>(
      `/admin/submissions/${submissionId}/verify`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          actualWeight: payload.actualWeight,
          qualityGrade: payload.qualityGrade,
          qualityGradeSource: payload.qualityGradeSource,
          adminQualityNotes: payload.adminQualityNotes,
          overrideReasonTags: payload.overrideReasonTags,
          overridePrimaryReason: payload.overridePrimaryReason,
          overrideFeedbackSeverity: payload.overrideFeedbackSeverity,
        }),
      },
      token,
    );
  },

  runQualityCheck(
    token: string,
    submissionId: string,
    payload: QualityCheckPayload,
  ) {
    return request<QualityCheckResult>(
      `/admin/submissions/${submissionId}/quality-check`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  rejectSubmission(token: string, submissionId: string, reason: string) {
    return request<WasteSubmission>(
      `/admin/submissions/${submissionId}/reject`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      },
      token,
    );
  },

  updatePrice(token: string, priceId: string, pricePerKg: number) {
    return request(
      `/admin/prices/${priceId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({ pricePerKg }),
      },
      token,
    );
  },

  approveWithdrawal(token: string, withdrawalId: string) {
    return request(
      `/admin/withdrawals/${withdrawalId}/approve`,
      {
        method: 'PATCH',
      },
      token,
    );
  },

  rejectWithdrawal(token: string, withdrawalId: string, reason: string) {
    return request(
      `/admin/withdrawals/${withdrawalId}/reject`,
      {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      },
      token,
    );
  },

  createDriver(token: string, payload: CreateDriverPayload) {
    return request<User>(
      '/admin/drivers',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  assignPickupRoute(token: string, payload: AssignPickupRoutePayload) {
    return request<PickupRoute>(
      '/admin/pickup-routes',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  getDriverDashboard(token: string) {
    return request<DriverDashboardData>('/driver/dashboard', {}, token);
  },

  updatePickupRouteStatus(
    token: string,
    routeId: string,
    payload: UpdatePickupRouteStatusPayload,
  ) {
    return request<PickupRoute>(
      `/driver/pickup-routes/${routeId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  updateDriverLocation(
    token: string,
    routeId: string,
    payload: UpdateDriverLocationPayload,
  ) {
    return request<PickupRoute>(
      `/driver/pickup-routes/${routeId}/location`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  getMyPayments(token: string) {
    return request<PaymentRecord[]>('/payments/me', {}, token);
  },

  createPayment(token: string, payload: CreatePaymentPayload) {
    return request<PaymentRecord>(
      '/payments',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token,
    );
  },

  markPaymentPaid(token: string, paymentId: string) {
    return request<PaymentRecord>(
      `/admin/payments/${paymentId}/mark-paid`,
      {
        method: 'PATCH',
      },
      token,
    );
  },

  chat(token: string | null | undefined, payload: ChatMessagePayload) {
    return request<ChatResponse>(
      '/api/chat',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      token || undefined,
    );
  },
};
