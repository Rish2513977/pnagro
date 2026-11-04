import express from 'express';
import { Booking } from '../models/Booking.js';
import { Equipment } from '../models/Equipment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/bookings
// @desc    Get current user's bookings (or owner's equipment bookings)
router.get('/', protect, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'admin') {
      // Admin can see all bookings
      query = {};
    } else if (req.user.role === 'owner') {
      // Owner sees bookings for their equipment or made by them
      query = { $or: [{ owner: req.user._id }, { user: req.user._id }] };
    } else {
      // Regular farmer sees their own bookings
      query = { user: req.user._id };
    }

    const bookings = await Booking.find(query)
      .populate({
        path: 'equipment',
        select: 'name category brand hourlyRate dailyRate images location hp',
      })
      .populate('user', 'name email phone location')
      .populate('owner', 'name email phone location')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error retrieving bookings',
    });
  }
});

// @route   POST /api/bookings
// @desc    Create a new equipment rental booking
router.post('/', protect, async (req, res) => {
  try {
    const {
      equipmentId,
      startDate,
      endDate,
      rentalType,
      duration,
      driverRequested,
      deliveryAddress,
      contactNumber,
      farmerName,
      notes,
    } = req.body;

    if (!equipmentId || !startDate || !duration || !deliveryAddress || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory booking fields',
      });
    }

    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found',
      });
    }

    const unitRate = rentalType === 'daily' ? equipment.dailyRate : equipment.hourlyRate;
    const baseTotal = unitRate * Number(duration);
    const driverFee = driverRequested && !equipment.driverIncluded ? (rentalType === 'daily' ? 500 * Number(duration) : 100 * Number(duration)) : 0;
    const totalAmount = baseTotal + driverFee;

    const booking = await Booking.create({
      equipment: equipment._id,
      user: req.user._id,
      owner: equipment.owner,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(new Date(startDate).getTime() + Number(duration) * 3600 * 1000),
      rentalType: rentalType || 'hourly',
      duration: Number(duration),
      unitRate,
      driverRequested: driverRequested !== undefined ? driverRequested : true,
      deliveryAddress,
      contactNumber,
      farmerName: farmerName || req.user.name,
      totalAmount,
      status: 'confirmed',
      paymentStatus: 'cash_on_delivery',
      notes: notes || '',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('equipment')
      .populate('owner', 'name phone email location')
      .populate('user', 'name phone email');

    res.status(201).json({
      success: true,
      data: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error processing booking',
    });
  }
});

// @route   PATCH /api/bookings/:id/status
// @desc    Update booking status (with strict RBAC validation per role)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.owner.toString() === req.user._id.toString();
    const isRenter = booking.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isRenter && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to modify this booking record.",
      });
    }

    // Role-specific action validation:
    if (isRenter && !isOwner && !isAdmin) {
      // Farmer/renter is ONLY allowed to cancel their own pending/confirmed booking
      if (status && status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          message: "Farmers cannot mark bookings as in-progress or completed. Only the equipment owner can manage rental operations.",
        });
      }

      if (booking.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a completed booking.',
        });
      }
    }

    if (isOwner && !isAdmin) {
      // Owner can confirm, start (in_progress), complete, or reject (cancelled)
      const allowedOwnerStatuses = ['confirmed', 'in_progress', 'completed', 'cancelled'];
      if (status && !allowedOwnerStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition for owner: ${status}`,
        });
      }
    }

    if (status) booking.status = status;
    if (paymentStatus) booking.paymentStatus = paymentStatus;
    if (status === 'completed') booking.completedAt = new Date().toISOString();

    await booking.save();

    const updated = await Booking.findById(booking._id)
      .populate('equipment')
      .populate('owner', 'name phone email location avatar')
      .populate('user', 'name phone email location avatar');

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
