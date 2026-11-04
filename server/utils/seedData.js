import { User } from '../models/User.js';
import { Equipment } from '../models/Equipment.js';
import { Booking } from '../models/Booking.js';
import { Review } from '../models/Review.js';

export const seedDatabase = async () => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      console.log('Database already has records, skipping initial seed.');
      return;
    }

    console.log('🌱 Seeding initial MERN database with rich PNAgro data...');

    // 1. Create Default Users (Admin, Owners, Farmers)
    const adminUser = await User.create({
      name: 'PNAgro Central Admin',
      email: 'admin@pnagro.com',
      password: 'password123',
      phone: '+91 98765 43210',
      role: 'admin',
      location: {
        state: 'Punjab',
        district: 'Ludhiana',
        pincode: '141001',
        address: 'GT Road, Miller Ganj',
      },
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
    });

    const owner1 = await User.create({
      name: 'Gurpreet Singh Brar',
      email: 'gurpreet.brar@gmail.com',
      password: 'password123',
      phone: '+91 98140 11223',
      role: 'owner',
      location: {
        state: 'Punjab',
        district: 'Bathinda',
        pincode: '151001',
        address: 'Goniana Road Hub',
      },
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    });

    const owner2 = await User.create({
      name: 'Rameshwar Patel',
      email: 'rameshwar.patel@gmail.com',
      password: 'password123',
      phone: '+91 94250 88990',
      role: 'owner',
      location: {
        state: 'Madhya Pradesh',
        district: 'Indore',
        pincode: '452001',
        address: 'Sanwer Agri Hub',
      },
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    });

    const owner3 = await User.create({
      name: 'Dharmendra Yadav',
      email: 'dharmendra.yadav@gmail.com',
      password: 'password123',
      phone: '+91 98290 55441',
      role: 'owner',
      location: {
        state: 'Haryana',
        district: 'Karnal',
        pincode: '132001',
        address: 'Taraori Farm Center',
      },
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80',
    });

    const farmerUser = await User.create({
      name: 'Harbhajan Singh Gill',
      email: 'farmer@pnagro.com',
      password: 'password123',
      phone: '+91 98721 34567',
      role: 'farmer',
      location: {
        state: 'Punjab',
        district: 'Ludhiana',
        pincode: '141008',
        address: 'Jagraon Block',
      },
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    });

    // 2. Create Machinery Listings
    const machineryData = [
      {
        name: 'Mahindra 575 DI Sarpanch 45HP Tractor',
        category: 'Tractor',
        brand: 'Mahindra',
        attachedImplement: 'Cultivator',
        availableAttachments: ['Cultivator', 'Rotavator', 'Trolley / Trailer'],
        modelYear: 2024,
        hp: 45,
        hourlyRate: 650,
        dailyRate: 4800,
        fuelIncluded: false,
        driverIncluded: true,
        coordinates: { lat: 28.6139, lng: 77.2090 },
        isLiveOnMap: true,
        location: {
          state: 'Northern Region',
          district: 'Central Zone',
          villageOrCity: 'Sector 4 Hub',
          pincode: '110001',
        },
        images: [
          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=900&q=80',
        ],
        description:
          'Fuel efficient Mahindra 45HP tractor equipped with 9-tyne spring cultivator, dual clutch, and certified driver. Ready for instant field preparation and seedbed aerating.',
        specs: {
          engineHP: '45 HP',
          cylinderCount: 4,
          fuelType: 'Diesel',
          attachmentIncluded: '9-Tyne Spring Cultivator',
          workingWidth: '7.5 Feet',
        },
        owner: owner1._id,
        status: 'available',
        rating: 4.9,
        totalReviews: 28,
        featured: true,
      },
      {
        name: 'John Deere 5310 4WD 55HP Heavy Tractor',
        category: 'Tractor',
        brand: 'John Deere',
        attachedImplement: 'Rotavator',
        availableAttachments: ['Rotavator', 'Disc Harrow', 'MB Plough'],
        modelYear: 2024,
        hp: 55,
        hourlyRate: 850,
        dailyRate: 6200,
        fuelIncluded: false,
        driverIncluded: true,
        coordinates: { lat: 28.6250, lng: 77.2180 },
        isLiveOnMap: true,
        location: {
          state: 'Northern Region',
          district: 'Western Corridor',
          villageOrCity: 'Highway Junction',
          pincode: '110005',
        },
        images: [
          'https://images.unsplash.com/photo-1530267981375-f0de937f5f13?auto=format&fit=crop&w=900&q=80',
        ],
        description:
          '4-Wheel Drive powerhouse paired with high-performance 7-feet rotavator. Ideal for tough clay soil, clod crushing, and fast seedbed leveling.',
        specs: {
          engineHP: '55 HP Turbo',
          cylinderCount: 3,
          fuelType: 'Diesel',
          attachmentIncluded: 'Shaktiman 7-Feet Rotavator (54 Blades)',
          workingWidth: '8.5 Feet',
        },
        owner: owner3._id,
        status: 'available',
        rating: 4.8,
        totalReviews: 19,
        featured: true,
      },
      {
        name: 'Swaraj 855 FE 52HP Heavy Duty Tractor',
        category: 'Tractor',
        brand: 'Swaraj',
        attachedImplement: 'Disc Harrow',
        availableAttachments: ['Disc Harrow', 'Cultivator', 'Seed Drill'],
        modelYear: 2024,
        hp: 52,
        hourlyRate: 750,
        dailyRate: 5400,
        fuelIncluded: false,
        driverIncluded: true,
        coordinates: { lat: 28.6010, lng: 77.1950 },
        isLiveOnMap: true,
        location: {
          state: 'Western Region',
          district: 'Agri Belt',
          villageOrCity: 'Industrial Agro Station',
          pincode: '110012',
        },
        images: [
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=80',
        ],
        description:
          'High torque water-cooled engine fitted with 14-disc heavy hydraulic harrow for deep primary tillage and stubble cutting.',
        specs: {
          engineHP: '52 HP',
          cylinderCount: 3,
          fuelType: 'Diesel',
          attachmentIncluded: '14-Disc Hydraulic Harrow',
          workingWidth: '8.0 Feet',
        },
        owner: owner3._id,
        status: 'available',
        rating: 4.8,
        totalReviews: 31,
        featured: true,
      },
      {
        name: 'JCB 3DX Plus Heavy Agri Backhoe Loader',
        category: 'Loader',
        brand: 'JCB',
        attachedImplement: 'Front Bucket Loader',
        availableAttachments: ['Front Bucket Loader', 'Dozer Blade', 'Backhoe Trench Bucket'],
        modelYear: 2024,
        hp: 76,
        hourlyRate: 1550,
        dailyRate: 12500,
        fuelIncluded: false,
        driverIncluded: true,
        coordinates: { lat: 28.6320, lng: 77.2290 },
        isLiveOnMap: true,
        location: {
          state: 'Central Region',
          district: 'Industrial Ring',
          villageOrCity: 'Logistics Park',
          pincode: '110020',
        },
        images: [
          'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=900&q=80',
        ],
        description:
          'Heavy-duty loader and excavator for farm pond excavation, bund making, fertilizer loading, land reclamation, and site grading with certified operator.',
        specs: {
          engineHP: '76 HP Turbo',
          cylinderCount: 4,
          fuelType: 'Diesel',
          attachmentIncluded: '1.1 cu.m Front Loading Bucket & 0.26 cu.m Backhoe',
          workingWidth: '7.8 Feet',
        },
        owner: owner2._id,
        status: 'available',
        rating: 4.9,
        totalReviews: 42,
        featured: true,
      },
      {
        name: 'Escorts Digmax Heavy Front Wheel Loader',
        category: 'Loader',
        brand: 'Escorts',
        attachedImplement: 'Front Bucket Loader',
        availableAttachments: ['Front Bucket Loader', 'Silage Grabber'],
        modelYear: 2023,
        hp: 60,
        hourlyRate: 1200,
        dailyRate: 9800,
        fuelIncluded: false,
        driverIncluded: true,
        coordinates: { lat: 28.5980, lng: 77.2350 },
        isLiveOnMap: true,
        location: {
          state: 'Northern Region',
          district: 'East Hub',
          villageOrCity: 'Bypass Depot',
          pincode: '110034',
        },
        images: [
          'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=900&q=80',
        ],
        description:
          'Agri-specific front loader designed for rapid grain trolley loading, sugarcane handling, and compost spreader loading in farm yards.',
        specs: {
          engineHP: '60 HP',
          cylinderCount: 4,
          fuelType: 'Diesel',
          attachmentIncluded: 'Heavy 0.9 cu.m Agri Loader Bucket',
          workingWidth: '7.0 Feet',
        },
        owner: owner1._id,
        status: 'available',
        rating: 4.7,
        totalReviews: 18,
        featured: false,
      },
      {
        name: 'Preet 987 Self-Propelled Multi-Crop Combine Harvester',
        category: 'Combine Harvester',
        brand: 'Preet',
        attachedImplement: 'Straw Reaper',
        availableAttachments: ['Straw Reaper', '14ft Cutter Bar', 'Super SMS'],
        modelYear: 2024,
        hp: 101,
        hourlyRate: 2200,
        dailyRate: 18500,
        fuelIncluded: true,
        driverIncluded: true,
        coordinates: { lat: 28.6410, lng: 77.2010 },
        isLiveOnMap: true,
        location: {
          state: 'Northern Region',
          district: 'Harvest Belt',
          villageOrCity: 'North Agri Depot',
          pincode: '110042',
        },
        images: [
          'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=900&q=80',
        ],
        description:
          'High capacity 14-feet cutter bar combine harvester with straw reaper & chopper. Clean threshing with near-zero grain loss for wheat, paddy, soybean, and mustard.',
        specs: {
          engineHP: '101 HP Heavy Diesel',
          cylinderCount: 6,
          fuelType: 'Diesel',
          attachmentIncluded: '14ft Cutter Bar + Super SMS Straw Management',
          workingWidth: '14 Feet',
        },
        owner: owner1._id,
        status: 'available',
        rating: 4.9,
        totalReviews: 35,
        featured: true,
      },
      {
        name: 'Claas Crop Tiger 30 Wheel Multi-Crop Harvester',
        category: 'Combine Harvester',
        brand: 'Claas',
        attachedImplement: 'Straw Reaper',
        availableAttachments: ['Straw Reaper', 'Standard Cutter Bar'],
        modelYear: 2023,
        hp: 76,
        hourlyRate: 2000,
        dailyRate: 16500,
        fuelIncluded: true,
        driverIncluded: true,
        coordinates: { lat: 28.5850, lng: 77.2150 },
        isLiveOnMap: true,
        location: {
          state: 'Western Region',
          district: 'South Corridor',
          villageOrCity: 'Expressway Farm Station',
          pincode: '110055',
        },
        images: [
          'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=900&q=80',
        ],
        description:
          'Compact agile combine harvester engineered for damp fields and smaller plots. Delivers clean grain separation with low soil compaction.',
        specs: {
          engineHP: '76 HP Turbo',
          cylinderCount: 4,
          fuelType: 'Diesel',
          attachmentIncluded: '10.5ft Cutter Bar + High Grain Hopper',
          workingWidth: '10.5 Feet',
        },
        owner: owner2._id,
        status: 'available',
        rating: 4.8,
        totalReviews: 22,
        featured: false,
      },
      {
        name: 'Trimble Dual-Receiver Precision Laser Land Leveler',
        category: 'Other Machinery',
        customCategoryName: 'Laser Land Leveler',
        brand: 'Trimble Agri',
        attachedImplement: 'Laser Land Leveler',
        availableAttachments: ['Laser Land Leveler', 'Scraper Bucket'],
        modelYear: 2024,
        hp: 60,
        hourlyRate: 950,
        dailyRate: 7200,
        fuelIncluded: false,
        driverIncluded: true,
        coordinates: { lat: 28.6190, lng: 77.2390 },
        isLiveOnMap: true,
        location: {
          state: 'Northern Region',
          district: 'Tech Corridor',
          villageOrCity: 'Agri Innovation Centre',
          pincode: '110065',
        },
        images: [
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80',
        ],
        description:
          'Automated hydraulic laser leveler reducing water consumption by 30% and maximizing crop uniformity across uneven farmland.',
        specs: {
          engineHP: '50-65 HP Compatible',
          cylinderCount: 0,
          fuelType: 'Laser Controlled Hydraulic',
          attachmentIncluded: 'Transmitter Mast + Receiver + 7ft Scraper Bucket',
          workingWidth: '7.0 Feet',
        },
        owner: owner3._id,
        status: 'available',
        rating: 4.9,
        totalReviews: 27,
        featured: true,
      },
    ];

    const createdEquipments = await Equipment.insertMany(machineryData);

    // 3. Create Sample Bookings
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    await Booking.create({
      equipment: createdEquipments[0]._id,
      user: farmerUser._id,
      owner: owner1._id,
      startDate: today,
      endDate: tomorrow,
      rentalType: 'hourly',
      duration: 6,
      unitRate: 650,
      driverRequested: true,
      deliveryAddress: {
        street: 'Farm Plot #14, Near Canal Road',
        villageOrDistrict: 'Ludhiana',
        state: 'Punjab',
        pincode: '141008',
      },
      contactNumber: '+91 98721 34567',
      farmerName: 'Harbhajan Singh Gill',
      totalAmount: 3900,
      status: 'confirmed',
      paymentStatus: 'cash_on_delivery',
      notes: 'Need for field preparation before wheat sowing season.',
    });

    await Booking.create({
      equipment: createdEquipments[2]._id,
      user: farmerUser._id,
      owner: owner1._id,
      startDate: new Date(Date.now() - 3 * 86400000),
      endDate: new Date(Date.now() - 2 * 86400000),
      rentalType: 'daily',
      duration: 1,
      unitRate: 18000,
      driverRequested: true,
      deliveryAddress: {
        street: 'Gill Acres, Jagraon Block',
        villageOrDistrict: 'Ludhiana',
        state: 'Punjab',
        pincode: '141008',
      },
      contactNumber: '+91 98721 34567',
      farmerName: 'Harbhajan Singh Gill',
      totalAmount: 18000,
      status: 'completed',
      paymentStatus: 'paid',
      notes: 'Paddy harvesting completed on time.',
    });

    // 4. Create Initial Reviews
    await Review.create({
      equipment: createdEquipments[0]._id,
      user: farmerUser._id,
      userName: 'Harbhajan Singh Gill',
      userLocation: 'Ludhiana, Punjab',
      rating: 5,
      comment:
        'Tractor arrived on time with a skilled driver. Machine was in mint condition and completed 12 acres tilling seamlessly in 6 hours.',
    });

    await Review.create({
      equipment: createdEquipments[1]._id,
      user: farmerUser._id,
      userName: 'Kuldeep Sharma',
      userLocation: 'Karnal, Haryana',
      rating: 5,
      comment:
        'John Deere 4WD pulled the heavy laser leveler on wet soil effortlessly. Highly recommend Gurpreet and PNagro platform!',
    });

    console.log('✅ PNAgro database successfully seeded with initial MERN dataset!');
  } catch (error) {
    console.error('Error during database seed:', error.message);
  }
};
