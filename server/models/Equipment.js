import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Equipment name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Tractor',
        'Loader',
        'Combine Harvester',
        'Other Machinery',
      ],
    },
    customCategoryName: {
      type: String,
      default: '',
      trim: true,
    },
    attachedImplement: {
      type: String,
      default: 'Cultivator',
      trim: true,
    },
    availableAttachments: {
      type: [String],
      default: ['Cultivator'],
    },
    coordinates: {
      lat: { type: Number, default: 28.6139 },
      lng: { type: Number, default: 77.2090 },
    },
    isLiveOnMap: {
      type: Boolean,
      default: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    modelYear: {
      type: Number,
      default: 2023,
    },
    hp: {
      type: Number,
      default: 50,
    },
    hourlyRate: {
      type: Number,
      required: [true, 'Hourly rate in INR is required'],
      min: [50, 'Hourly rate must be at least ₹50'],
    },
    dailyRate: {
      type: Number,
      required: [true, 'Daily rate in INR is required'],
      min: [300, 'Daily rate must be at least ₹300'],
    },
    fuelIncluded: {
      type: Boolean,
      default: false,
    },
    driverIncluded: {
      type: Boolean,
      default: true,
    },
    location: {
      state: { type: String, required: true },
      district: { type: String, required: true },
      villageOrCity: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    images: {
      type: [String],
      default: [
        'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    specs: {
      engineHP: { type: String, default: '50 HP' },
      cylinderCount: { type: Number, default: 4 },
      fuelType: { type: String, default: 'Diesel' },
      attachmentIncluded: { type: String, default: 'Standard Hitch / Bucket' },
      workingWidth: { type: String, default: '7 Feet' },
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['available', 'rented', 'maintenance'],
      default: 'available',
    },
    rating: {
      type: Number,
      default: 4.8,
      min: 1,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 12,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

import { createModelProxy } from './modelProxy.js';
import { localEquipments } from '../config/localDb.js';

const MongooseEquipment = mongoose.model('Equipment', equipmentSchema);
export const Equipment = createModelProxy('Equipment', MongooseEquipment, localEquipments);
