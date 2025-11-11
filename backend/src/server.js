import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  getAllBarbers,
  getBarberById,
  createBooking,
  getBookingsByClient,
  getBookingsByBarber,
  getAllPendingBookings,
  updateBookingStatus,
  createReview,
  getReviewsByBarber,
  addBarber
} from './database.js';
import { sendBookingNotification, sendStatusNotification } from './bot.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'barber-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Faqat rasm fayllar yuklanadi!'));
    }
  }
});

// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Serve public files (admin panel)
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CutSpace API is running' });
});

// Get all barbers
app.get('/api/barbers', (req, res) => {
  try {
    const barbers = getAllBarbers();
    const barbersWithParsedServices = barbers.map(barber => ({
      ...barber,
      services: JSON.parse(barber.services)
    }));
    res.json(barbersWithParsedServices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get barber by ID
app.get('/api/barbers/:id', (req, res) => {
  try {
    const barber = getBarberById(req.params.id);
    if (!barber) {
      return res.status(404).json({ error: 'Barber not found' });
    }
    res.json({
      ...barber,
      services: JSON.parse(barber.services)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { client_name, client_telegram_id, barber_id, booking_date, booking_time } = req.body;
    
    if (!client_name || !client_telegram_id || !barber_id || !booking_date || !booking_time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bookingId = createBooking({
      client_name,
      client_telegram_id,
      barber_id,
      booking_date,
      booking_time
    });

    const barber = getBarberById(barber_id);
    
    // Send notification
    await sendBookingNotification({
      id: bookingId,
      client_name,
      booking_date,
      booking_time
    }, barber?.telegram_id);

    res.json({ 
      success: true, 
      booking_id: bookingId,
      message: 'Booking created successfully' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get client bookings
app.get('/api/bookings/client/:telegram_id', (req, res) => {
  try {
    const bookings = getBookingsByClient(req.params.telegram_id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get barber bookings
app.get('/api/bookings/barber/:barber_id', (req, res) => {
  try {
    const bookings = getBookingsByBarber(req.params.barber_id);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all pending bookings (for admin/barber panel)
app.get('/api/bookings/pending', (req, res) => {
  try {
    const bookings = getAllPendingBookings();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking status
app.patch('/api/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const booking = updateBookingStatus(req.params.id, status);
    
    // Send notification to client
    if (status === 'accepted' || status === 'rejected') {
      await sendStatusNotification(booking, status);
    }

    res.json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create review
app.post('/api/reviews', (req, res) => {
  try {
    const { barber_id, client_name, client_telegram_id, rating, comment } = req.body;
    
    if (!barber_id || !client_name || !client_telegram_id || !rating) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    createReview({ barber_id, client_name, client_telegram_id, rating, comment });
    res.json({ success: true, message: 'Review created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get reviews by barber
app.get('/api/reviews/barber/:barber_id', (req, res) => {
  try {
    const reviews = getReviewsByBarber(req.params.barber_id);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload barber image
app.post('/api/upload/barber-image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Fayl yuklanmadi' });
    }
    
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      message: 'Rasm muvaffaqiyatli yuklandi' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new barber (admin)
app.post('/api/barbers/add', (req, res) => {
  try {
    const { name, telegram_id, description, avatar, services, rating, total_reviews } = req.body;
    
    if (!name || !description || !services) {
      return res.status(400).json({ error: 'Majburiy maydonlar to\'ldirilmagan' });
    }

    const barberId = addBarber({
      name,
      telegram_id,
      description,
      avatar: avatar || '👨‍🦱',
      services,
      rating: rating || 5.0,
      total_reviews: total_reviews || 0
    });

    res.json({ 
      success: true, 
      barber_id: barberId,
      message: 'Sartarosh qo\'shildi' 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});


