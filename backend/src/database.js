import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, '..', 'database.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS barbers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    telegram_id TEXT,
    description TEXT,
    rating REAL DEFAULT 5.0,
    total_reviews INTEGER DEFAULT 0,
    avatar TEXT,
    services TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_name TEXT NOT NULL,
    client_telegram_id TEXT NOT NULL,
    barber_id INTEGER NOT NULL,
    booking_date TEXT NOT NULL,
    booking_time TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barber_id) REFERENCES barbers(id)
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    barber_id INTEGER NOT NULL,
    client_name TEXT NOT NULL,
    client_telegram_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (barber_id) REFERENCES barbers(id)
  );
`);

// Seed initial barbers data
const checkBarbers = db.prepare('SELECT COUNT(*) as count FROM barbers').get();

if (checkBarbers.count === 0) {
  const insertBarber = db.prepare(`
    INSERT INTO barbers (name, description, rating, total_reviews, avatar, services, telegram_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const barbers = [
    {
      name: 'Bobur Rahimov',
      telegram_id: null,
      description: 'Professional sartarosh, 5 yillik tajriba',
      rating: 4.8,
      total_reviews: 124,
      avatar: '👨‍🦱',
      services: JSON.stringify([
        { name: 'Soch olish', price: 50000 },
        { name: 'Soqol olish', price: 30000 },
        { name: 'Soch va soqol', price: 70000 }
      ])
    },
    {
      name: 'Jasur Aliyev',
      telegram_id: null,
      description: 'Zamonaviy uslublar bo\'yicha mutaxassis',
      rating: 4.9,
      total_reviews: 98,
      avatar: '👨‍🦰',
      services: JSON.stringify([
        { name: 'Soch olish', price: 60000 },
        { name: 'Soqol dizayni', price: 35000 },
        { name: 'VIP xizmat', price: 100000 }
      ])
    },
    {
      name: 'Shohruh Karimov',
      telegram_id: null,
      description: 'Klassik va zamonaviy uslublar',
      rating: 4.7,
      total_reviews: 156,
      avatar: '👨',
      services: JSON.stringify([
        { name: 'Soch olish', price: 45000 },
        { name: 'Soqol olish', price: 25000 },
        { name: 'Kompleks', price: 65000 }
      ])
    }
  ];

  barbers.forEach(barber => {
    insertBarber.run(
      barber.name,
      barber.description,
      barber.rating,
      barber.total_reviews,
      barber.avatar,
      barber.services,
      barber.telegram_id
    );
  });

  console.log('✅ Initial barbers data seeded');
}

// Database functions
export const getAllBarbers = () => {
  const stmt = db.prepare('SELECT * FROM barbers ORDER BY rating DESC');
  return stmt.all();
};

export const getBarberById = (id) => {
  const stmt = db.prepare('SELECT * FROM barbers WHERE id = ?');
  return stmt.get(id);
};

export const createBooking = (booking) => {
  const stmt = db.prepare(`
    INSERT INTO bookings (client_name, client_telegram_id, barber_id, booking_date, booking_time, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    booking.client_name,
    booking.client_telegram_id,
    booking.barber_id,
    booking.booking_date,
    booking.booking_time,
    'pending'
  );
  return result.lastInsertRowid;
};

export const getBookingsByClient = (telegramId) => {
  const stmt = db.prepare(`
    SELECT b.*, br.name as barber_name, br.avatar as barber_avatar
    FROM bookings b
    JOIN barbers br ON b.barber_id = br.id
    WHERE b.client_telegram_id = ?
    ORDER BY b.created_at DESC
  `);
  return stmt.all(telegramId);
};

export const getBookingsByBarber = (barberId) => {
  const stmt = db.prepare(`
    SELECT * FROM bookings
    WHERE barber_id = ?
    ORDER BY booking_date DESC, booking_time DESC
  `);
  return stmt.all(barberId);
};

export const getAllPendingBookings = () => {
  const stmt = db.prepare(`
    SELECT b.*, br.name as barber_name
    FROM bookings b
    JOIN barbers br ON b.barber_id = br.id
    WHERE b.status = 'pending'
    ORDER BY b.created_at DESC
  `);
  return stmt.all();
};

export const updateBookingStatus = (bookingId, status) => {
  const stmt = db.prepare('UPDATE bookings SET status = ? WHERE id = ?');
  stmt.run(status, bookingId);
  
  const getBooking = db.prepare(`
    SELECT b.*, br.name as barber_name
    FROM bookings b
    JOIN barbers br ON b.barber_id = br.id
    WHERE b.id = ?
  `);
  return getBooking.get(bookingId);
};

export const createReview = (review) => {
  const insertStmt = db.prepare(`
    INSERT INTO reviews (barber_id, client_name, client_telegram_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertStmt.run(
    review.barber_id,
    review.client_name,
    review.client_telegram_id,
    review.rating,
    review.comment
  );

  // Update barber rating
  const updateStmt = db.prepare(`
    UPDATE barbers
    SET rating = (
      SELECT AVG(rating) FROM reviews WHERE barber_id = ?
    ),
    total_reviews = (
      SELECT COUNT(*) FROM reviews WHERE barber_id = ?
    )
    WHERE id = ?
  `);
  updateStmt.run(review.barber_id, review.barber_id, review.barber_id);
};

export const getReviewsByBarber = (barberId) => {
  const stmt = db.prepare(`
    SELECT * FROM reviews
    WHERE barber_id = ?
    ORDER BY created_at DESC
  `);
  return stmt.all(barberId);
};

export const addBarber = (barber) => {
  const stmt = db.prepare(`
    INSERT INTO barbers (name, telegram_id, description, rating, total_reviews, avatar, services)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    barber.name,
    barber.telegram_id,
    barber.description,
    barber.rating || 5.0,
    barber.total_reviews || 0,
    barber.avatar,
    JSON.stringify(barber.services)
  );
  return result.lastInsertRowid;
};

export default db;


