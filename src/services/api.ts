import { Equipment, Booking, Review, AdminStats, User } from '../types';

const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('pnagro_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth endpoints
  async login(credentials: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async register(userData: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: string;
    location?: { state: string; district: string; pincode?: string };
  }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data;
  },

  async socialLogin(socialData: {
    email: string;
    name?: string;
    avatar?: string;
    phone?: string;
    role?: 'farmer' | 'owner';
    provider?: 'google' | 'facebook';
    firebaseUid?: string;
  }) {
    const res = await fetch(`${API_BASE}/auth/social`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(socialData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Social authentication failed');
    return data;
  },

  async getMe(): Promise<{ success: boolean; user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user profile');
    return data;
  },

  async updateProfile(profileData: Partial<User>) {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  },

  // Equipment endpoints
  async getEquipment(params: {
    search?: string;
    category?: string;
    state?: string;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: string;
    sort?: string;
  } = {}): Promise<{ success: boolean; data: Equipment[]; count: number }> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append('search', params.search);
    if (params.category && params.category !== 'All') searchParams.append('category', params.category);
    if (params.state && params.state !== 'All') searchParams.append('state', params.state);
    if (params.district && params.district !== 'All') searchParams.append('district', params.district);
    if (params.minPrice) searchParams.append('minPrice', params.minPrice.toString());
    if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice.toString());
    if (params.status && params.status !== 'All') searchParams.append('status', params.status);
    if (params.sort) searchParams.append('sort', params.sort);

    const res = await fetch(`${API_BASE}/equipment?${searchParams.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch equipment');
    return data;
  },

  async getFeaturedEquipment(): Promise<{ success: boolean; data: Equipment[] }> {
    const res = await fetch(`${API_BASE}/equipment/featured`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch featured equipment');
    return data;
  },

  async getEquipmentById(id: string): Promise<{ success: boolean; data: Equipment }> {
    const res = await fetch(`${API_BASE}/equipment/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Equipment not found');
    return data;
  },

  async createEquipment(equipmentData: Partial<Equipment>): Promise<{ success: boolean; data: Equipment }> {
    const res = await fetch(`${API_BASE}/equipment`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(equipmentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add equipment');
    return data;
  },

  async updateEquipment(id: string, equipmentData: Partial<Equipment>): Promise<{ success: boolean; data: Equipment }> {
    const res = await fetch(`${API_BASE}/equipment/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(equipmentData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update equipment');
    return data;
  },

  async deleteEquipment(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/equipment/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete equipment');
    return data;
  },

  async getMyEquipment(): Promise<{ success: boolean; data: Equipment[]; count: number }> {
    const res = await fetch(`${API_BASE}/equipment/my-equipment`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch your equipment listings');
    return data;
  },

  // Bookings endpoints
  async getBookings(): Promise<{ success: boolean; data: Booking[]; count: number }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch bookings');
    return data;
  },

  async createBooking(bookingData: {
    equipmentId: string;
    startDate: string;
    endDate?: string;
    rentalType: 'hourly' | 'daily';
    duration: number;
    driverRequested?: boolean;
    deliveryAddress: {
      street: string;
      villageOrDistrict: string;
      state: string;
      pincode: string;
    };
    contactNumber: string;
    farmerName: string;
    notes?: string;
  }): Promise<{ success: boolean; data: Booking }> {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(bookingData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create booking');
    return data;
  },

  async updateBookingStatus(
    bookingId: string,
    status: string,
    paymentStatus?: string
  ): Promise<{ success: boolean; data: Booking }> {
    const res = await fetch(`${API_BASE}/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, paymentStatus }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update booking status');
    return data;
  },

  // Reviews endpoints
  async getReviews(equipmentId: string): Promise<{ success: boolean; data: Review[] }> {
    const res = await fetch(`${API_BASE}/reviews/${equipmentId}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch reviews');
    return data;
  },

  async addReview(reviewData: {
    equipmentId: string;
    rating: number;
    comment: string;
  }): Promise<{ success: boolean; data: Review }> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(reviewData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to post review');
    return data;
  },

  // Admin endpoints
  async getAdminStats(): Promise<{ success: boolean; data: AdminStats }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin stats');
    return data;
  },

  async getAdminBookings(params: { status?: string; search?: string } = {}): Promise<{ success: boolean; data: Booking[]; count: number }> {
    const searchParams = new URLSearchParams();
    if (params.status && params.status !== 'all') searchParams.append('status', params.status);
    if (params.search) searchParams.append('search', params.search);

    const res = await fetch(`${API_BASE}/admin/bookings?${searchParams.toString()}`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin bookings');
    return data;
  },

  async verifyAdminOtp(
    bookingId: string,
    otp: string,
    type: 'start' | 'complete' = 'start'
  ): Promise<{ success: boolean; message: string; data: Booking }> {
    const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/verify-otp`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ otp, type }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'OTP Verification failed');
    return data;
  },

  async updateEquipmentStatus(
    equipmentId: string,
    status: 'available' | 'rented' | 'maintenance'
  ): Promise<{ success: boolean; message: string; data: Equipment }> {
    const res = await fetch(`${API_BASE}/admin/equipment/${equipmentId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update equipment status');
    return data;
  },

  async sendAdminChat(
    bookingId: string,
    message: string
  ): Promise<{ success: boolean; message: string; data: any[] }> {
    const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/chat`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to dispatch chat message');
    return data;
  },

  async getAdminChats(): Promise<{ success: boolean; data: Booking[] }> {
    const res = await fetch(`${API_BASE}/admin/chats`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch chat conversations');
    return data;
  },

  async getAdminUsers(): Promise<{ success: boolean; count: number; data: User[] }> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin users');
    return data;
  },

  async updateUserRole(userId: string, role: 'farmer' | 'owner' | 'admin'): Promise<{ success: boolean; data: User }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update role');
    return data;
  },

  async toggleUserVerification(userId: string, isVerified: boolean): Promise<{ success: boolean; data: User }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/verify`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ isVerified }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update user verification');
    return data;
  },

  async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete user');
    return data;
  },

  async updateAdminBookingStatus(
    bookingId: string,
    status: string,
    paymentStatus?: string
  ): Promise<{ success: boolean; message: string; data: Booking }> {
    const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status, paymentStatus }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update booking status');
    return data;
  },

  async deleteAdminBooking(bookingId: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/admin/bookings/${bookingId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete booking');
    return data;
  },

  // Google Gemini AI Kisan Chatbot
  async sendGeminiChat(message: string, history: Array<{ role: 'user' | 'model'; text: string }> = [], language: 'en' | 'hi' = 'en'): Promise<{ success: boolean; reply: string; model?: string }> {
    const res = await fetch(`${API_BASE}/gemini/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, history, language }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.fallbackReply || 'Failed to reach Kisan AI');
    }
    return data;
  },
};
