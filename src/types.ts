export type UserRole = 'farmer' | 'owner' | 'contractor' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  alternatePhone?: string;
  role: UserRole;
  dob?: string;
  aadhaarNumber?: string;
  location?: {
    state: string;
    district: string;
    pincode?: string;
    address?: string;
  };
  avatar?: string;
  verified?: boolean;
}

export type EquipmentCategory =
  | 'All'
  | 'Tractor'
  | 'Loader'
  | 'Combine Harvester'
  | 'Other Machinery';

export type ImplementAttachment =
  | 'Cultivator'
  | 'Rotavator'
  | 'Disc Harrow'
  | 'MB Plough'
  | 'Seed Drill'
  | 'Trolley / Trailer'
  | 'Straw Reaper'
  | 'Post Hole Digger'
  | 'Mulcher'
  | 'Front Bucket Loader'
  | 'Laser Land Leveler'
  | 'None / Bare Machine';

export interface Equipment {
  _id: string;
  name: string;
  category: EquipmentCategory;
  customCategoryName?: string;
  attachedImplement?: string;
  availableAttachments?: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
  isLiveOnMap?: boolean;
  distanceKm?: number;
  etaMinutes?: number;
  brand: string;
  modelYear: number;
  hp: number;
  hourlyRate: number;
  dailyRate: number;
  fuelIncluded: boolean;
  driverIncluded: boolean;
  location: {
    state: string;
    district: string;
    villageOrCity?: string;
    pincode?: string;
  };
  images: string[];
  description: string;
  specs: {
    engineHP?: string;
    cylinderCount?: number;
    fuelType?: string;
    attachmentIncluded?: string;
    workingWidth?: string;
  };
  owner: User;
  status: 'available' | 'rented' | 'maintenance';
  rating: number;
  totalReviews: number;
  featured?: boolean;
  createdAt?: string;
}

export interface BookingMessage {
  _id?: string;
  senderId?: string;
  senderName: string;
  senderRole: string;
  message: string;
  timestamp: string | Date;
}

export interface Booking {
  _id: string;
  equipment: Equipment;
  user: User;
  owner: User;
  startDate: string;
  endDate: string;
  rentalType: 'hourly' | 'daily';
  duration: number;
  unitRate: number;
  driverRequested: boolean;
  deliveryAddress: {
    street: string;
    villageOrDistrict: string;
    state: string;
    pincode: string;
  };
  contactNumber: string;
  farmerName: string;
  totalAmount: number;
  startOtp?: string;
  completeOtp?: string;
  isOtpVerified?: boolean;
  otpVerifiedAt?: string;
  completedAt?: string;
  assignedDriver?: {
    name: string;
    phone: string;
  };
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'cash_on_delivery';
  notes?: string;
  messages?: BookingMessage[];
  createdAt: string;
}

export interface Review {
  _id: string;
  equipment: string;
  user: string;
  userName: string;
  userLocation: string;
  rating: number;
  comment: string;
  date: string;
}

export interface MonthlyRevenueItem {
  month: string;
  revenue: number;
  trips: number;
}

export interface AdminStats {
  totalUsers: number;
  totalFarmers: number;
  totalOwners: number;
  totalEquipment: number;
  availableEquipment?: number;
  onWorkEquipment?: number;
  maintenanceEquipment?: number;
  totalBookings: number;
  pendingBookings?: number;
  confirmedBookings?: number;
  inProgressBookings?: number;
  completedCount?: number;
  cancelledCount?: number;
  activeBookings: number;
  totalRevenue: number;
  activePipelineRevenue?: number;
  monthlyRevenue?: MonthlyRevenueItem[];
  recentBookings: Booking[];
  categoriesCount: { _id: string; count: number }[];
  stateDistribution: { _id: string; count: number }[];
}


