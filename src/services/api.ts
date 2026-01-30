/**
 * API Service Layer
 * Centralized API calls untuk komunikasi dengan backend
 */

// Get base URL - if VITE_API_URL is set, use it directly (should be without trailing slash)
// Otherwise use localhost with /api
const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  // Ensure no trailing slash
  return baseUrl.replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();

// Helper untuk get token dari localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper untuk set auth header
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic request handler
const request = async (endpoint: string, options: RequestInit = {}) => {
  // Normalize endpoint - ensure it starts with /api
  let normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  if (!normalizedEndpoint.startsWith('/api')) {
    normalizedEndpoint = `/api${normalizedEndpoint}`;
  }
  const url = `${API_BASE_URL}${normalizedEndpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'Request failed');
      (error as any).statusCode = response.status;
      (error as any).data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// ============================================
// AUTHENTICATION API
// ============================================

export const authAPI = {
  // Register user baru
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const response = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Jika memerlukan verifikasi OTP, jangan simpan token
    if (response.success && response.data?.requiresVerification) {
      return response;
    }

    // Save token dan user ke localStorage (sama seperti login)
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Verify OTP
  verifyOTP: async (data: { email: string; otpCode: string }) => {
    const response = await request('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Save token dan user ke localStorage setelah verifikasi
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Resend OTP
  resendOTP: async (data: { email: string }) => {
    return request('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Forgot password - request reset OTP
  forgotPassword: async (data: { email: string }) => {
    return request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Reset password with OTP
  resetPassword: async (data: { email: string; resetOtp: string; newPassword: string; confirmPassword: string }) => {
    const response = await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Clear token jika ada (user akan login lagi dengan password baru)
    if (response.success) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    return response;
  },

  // Login
  login: async (credentials: { email: string; password: string }) => {
    const response = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Save token dan user ke localStorage
    if (response.success && response.data) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getMe: async () => {
    return request('/auth/me', {
      method: 'GET',
    });
  },

  // Update profile
  updateProfile: async (profileData: { name?: string; phone?: string }) => {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => {
    return request('/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
};

// ============================================
// POSITIONS API
// ============================================

export const positionsAPI = {
  // Get all positions
  getAll: async (filters?: {
    isActive?: boolean;
    applicantType?: string;
    department?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.applicantType) params.append('applicantType', filters.applicantType);
    if (filters?.department) params.append('department', filters.department);

    const queryString = params.toString();
    return request(`/positions${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get position by ID
  getById: async (id: string) => {
    return request(`/positions/${id}`, {
      method: 'GET',
    });
  },

  // Create position (admin only)
  create: async (positionData: any) => {
    return request('/positions', {
      method: 'POST',
      body: JSON.stringify(positionData),
    });
  },

  // Update position (admin only)
  update: async (id: string, positionData: any) => {
    return request(`/positions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(positionData),
    });
  },

  // Delete position (admin only)
  delete: async (id: string) => {
    return request(`/positions/${id}`, {
      method: 'DELETE',
    });
  },

  // Toggle active status (admin only)
  toggleActive: async (id: string) => {
    return request(`/positions/${id}/toggle-active`, {
      method: 'PATCH',
    });
  },
};

// ============================================
// APPLICATIONS API
// ============================================

export const applicationsAPI = {
  // Get all applications (user: own, admin: all)
  getAll: async (filters?: {
    status?: string;
    applicantType?: string;
    positionId?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.applicantType) params.append('applicantType', filters.applicantType);
    if (filters?.positionId) params.append('positionId', filters.positionId);

    const queryString = params.toString();
    return request(`/applications${queryString ? `?${queryString}` : ''}`, {
      method: 'GET',
    });
  },

  // Get application by ID
  getById: async (id: string) => {
    return request(`/applications/${id}`, {
      method: 'GET',
    });
  },

  // Create application with file upload
  create: async (formData: FormData) => {
    const token = getToken();
    const url = `${API_BASE_URL}/applications`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          // Jangan set Content-Type untuk FormData, browser akan set otomatis dengan boundary
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Submit application failed');
      }

      return data;
    } catch (error) {
      console.error('Submit application error:', error);
      throw error;
    }
  },

  // Update application status (admin only)
  updateStatus: async (
    id: string,
    status: string,
    adminNotes?: string
  ) => {
    return request(`/applications/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminNotes }),
    });
  },

  // Delete application
  delete: async (id: string) => {
    return request(`/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // Get statistics (admin only)
  getStats: async () => {
    return request('/applications/stats', {
      method: 'GET',
    });
  },
};

// ============================================
// CHAT API (Gemini AI)
// ============================================

export const chatAPI = {
  // Send message to chatbot
  sendMessage: async (message: string, conversationHistory?: any[]) => {
    return request('/chat', {
      method: 'POST',
      body: JSON.stringify({ message, conversationHistory }),
    });
  },

  // Test Gemini connection
  testConnection: async () => {
    return request('/chat/test', {
      method: 'GET',
    });
  },
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Get file URL untuk download/preview through API endpoint (with CORS)
export const getFileUrl = (filename: string): string => {
  if (!filename) return '';
  return `${API_BASE_URL}/file/${filename}`;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Get current user from localStorage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Check if user is admin
export const isAdmin = (): boolean => {
  const user = getCurrentUser();
  return user?.role === 'admin';
};