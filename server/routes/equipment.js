import express from 'express';
import { Equipment } from '../models/Equipment.js';
import { protect, ownerOnly } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/equipment/my-equipment
// @desc    Get all equipment owned by current authenticated owner
router.get('/my-equipment', protect, ownerOnly, async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    const myEquipment = await Equipment.find(filter)
      .populate('owner', 'name phone email location avatar verified')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: myEquipment.length,
      data: myEquipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching owner equipment',
    });
  }
});

// @route   GET /api/equipment
// @desc    Get all equipment with search, category, location, price, and pagination filters
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      attachment,
      state,
      district,
      minPrice,
      maxPrice,
      status,
      sort,
      limit = 50,
      page = 1,
    } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (attachment && attachment !== 'All') {
      query.$or = [
        { attachedImplement: { $regex: attachment, $options: 'i' } },
        { availableAttachments: { $in: [new RegExp(attachment, 'i')] } },
        { 'specs.attachmentIncluded': { $regex: attachment, $options: 'i' } },
      ];
    }

    if (state && state !== 'All') {
      query['location.state'] = { $regex: state, $options: 'i' };
    }

    if (district && district !== 'All') {
      query['location.district'] = { $regex: district, $options: 'i' };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.hourlyRate = {};
      if (minPrice) query.hourlyRate.$gte = Number(minPrice);
      if (maxPrice) query.hourlyRate.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { attachedImplement: { $regex: search, $options: 'i' } },
        { 'location.district': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { 'location.address': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { featured: -1, createdAt: -1 };
    if (sort === 'price_asc') sortOption = { hourlyRate: 1 };
    if (sort === 'price_desc') sortOption = { hourlyRate: -1 };
    if (sort === 'rating_desc') sortOption = { rating: -1 };
    if (sort === 'hp_desc') sortOption = { hp: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Equipment.countDocuments(query);
    const equipment = await Equipment.find(query)
      .populate('owner', 'name phone email verified location avatar')
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));

    res.json({
      success: true,
      count: equipment.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: equipment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching equipment',
    });
  }
});

// @route   GET /api/equipment/featured
// @desc    Get featured equipment
router.get('/featured', async (req, res) => {
  try {
    const featured = await Equipment.find({ featured: true })
      .populate('owner', 'name phone location verified')
      .limit(8);
    res.json({ success: true, data: featured });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/equipment/:id
// @desc    Get single equipment details
router.get('/:id', async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id).populate(
      'owner',
      'name phone email location avatar verified'
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Equipment item not found',
      });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/equipment
// @desc    Create new equipment listing (Equipment Owner or Admin only)
router.post('/', protect, ownerOnly, async (req, res) => {
  try {
    const {
      name,
      category,
      customCategoryName,
      attachedImplement,
      availableAttachments,
      coordinates,
      brand,
      modelYear,
      hp,
      hourlyRate,
      dailyRate,
      fuelIncluded,
      driverIncluded,
      location,
      images,
      description,
      specs,
    } = req.body;

    if (!name || !category || !brand || !hourlyRate || !dailyRate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all mandatory equipment details',
      });
    }

    const newEquipment = await Equipment.create({
      name,
      category,
      customCategoryName: customCategoryName || '',
      attachedImplement: attachedImplement || 'Cultivator',
      availableAttachments: availableAttachments || [attachedImplement || 'Cultivator'],
      coordinates: coordinates || {
        lat: 28.6139 + (Math.random() - 0.5) * 0.1,
        lng: 77.2090 + (Math.random() - 0.5) * 0.1,
      },
      isLiveOnMap: true,
      brand,
      modelYear: modelYear || 2023,
      hp: hp || 50,
      hourlyRate: Number(hourlyRate),
      dailyRate: Number(dailyRate),
      fuelIncluded: fuelIncluded || false,
      driverIncluded: driverIncluded !== undefined ? driverIncluded : true,
      location: location || {
        state: req.user.location?.state || 'Active State',
        district: req.user.location?.district || 'Central District',
        villageOrCity: req.user.location?.address || 'Nearby Area',
        pincode: req.user.location?.pincode || '110001',
      },
      images:
        images && images.length > 0
          ? images
          : [
              'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80',
            ],
      description: description || 'High performance farming machine available on rent with certified operator.',
      specs: specs || {
        engineHP: `${hp || 50} HP`,
        cylinderCount: 4,
        fuelType: 'Diesel',
        attachmentIncluded: attachedImplement || 'Cultivator',
        workingWidth: '7 Feet',
      },
      owner: req.user._id,
      status: 'available',
      rating: 5.0,
      totalReviews: 1,
    });

    const populated = await Equipment.findById(newEquipment._id).populate(
      'owner',
      'name phone email location avatar verified'
    );

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating equipment listing',
    });
  }
});

// @route   PUT /api/equipment/:id
// @desc    Update equipment listing (Owner or Admin)
router.put('/:id', protect, async (req, res) => {
  try {
    let item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this equipment listing',
      });
    }

    item = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate('owner', 'name phone email location avatar verified');

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/equipment/:id
// @desc    Delete equipment listing
router.delete('/:id', protect, async (req, res) => {
  try {
    const item = await Equipment.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }

    if (item.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this equipment listing',
      });
    }

    await Equipment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Equipment deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
