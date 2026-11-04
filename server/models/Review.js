import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
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
    userName: {
      type: String,
      required: true,
    },
    userLocation: {
      type: String,
      default: 'Punjab, India',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

import { createModelProxy } from './modelProxy.js';
import { localReviews } from '../config/localDb.js';

const MongooseReview = mongoose.model('Review', reviewSchema);
export const Review = createModelProxy('Review', MongooseReview, localReviews);
