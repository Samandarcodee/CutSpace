import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Barbers
export const getBarbers = () => api.get('/barbers');
export const getBarberById = (id) => api.get(`/barbers/${id}`);

// Bookings
export const createBooking = (booking) => api.post('/bookings', booking);
export const getClientBookings = (telegramId) => api.get(`/bookings/client/${telegramId}`);
export const getBarberBookings = (barberId) => api.get(`/bookings/barber/${barberId}`);
export const getPendingBookings = () => api.get('/bookings/pending');
export const updateBookingStatus = (bookingId, status) => 
  api.patch(`/bookings/${bookingId}/status`, { status });

// Reviews
export const createReview = (review) => api.post('/reviews', review);
export const getBarberReviews = (barberId) => api.get(`/reviews/barber/${barberId}`);

export default api;


