import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    equipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Equipment',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    rentalType: {
      type: String,
      enum: ['hourly', 'daily'],
      default: 'hourly',
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    unitRate: {
      type: Number,
      required: true,
    },
    driverRequested: {
      type: Boolean,
      default: true,
    },
    deliveryAddress: {
      street: { type: String, required: true },
      villageOrDistrict: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    contactNumber: {
      type: String,
      required: true,
    },
    farmerName: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    startOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    completeOtp: {
      type: String,
      default: () => Math.floor(1000 + Math.random() * 9000).toString(),
    },
    isOtpVerified: {
      type: Boolean,
      default: false,
    },
    otpVerifiedAt: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    assignedDriver: {
      name: { type: String, default: 'Certified PNagro Operator' },
      phone: { type: String, default: '+91 98765 00123' },
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'],
      default: 'confirmed',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'cash_on_delivery'],
      default: 'cash_on_delivery',
    },
    notes: {
      type: String,
      default: '',
    },
    messages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        senderName: { type: String, required: true },
        senderRole: { type: String, default: 'admin' },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

import { createModelProxy } from './modelProxy.js';
import { localBookings } from '../config/localDb.js';

const MongooseBooking = mongoose.model('Booking', bookingSchema);
export const Booking = createModelProxy('Booking', MongooseBooking, localBookings);
