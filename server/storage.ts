import {
  type Barbershop,
  type InsertBarbershop,
  type Review,
  type InsertReview,
  type Booking,
  type InsertBooking,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Barbershops
  getBarbershops(): Promise<Barbershop[]>;
  getBarbershop(id: string): Promise<Barbershop | undefined>;
  createBarbershop(barbershop: InsertBarbershop): Promise<Barbershop>;

  // Reviews
  getReviewsByBarbershop(barbershopId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: string, status: string): Promise<Booking | undefined>;
}

export class MemStorage implements IStorage {
  private barbershops: Map<string, Barbershop>;
  private reviews: Map<string, Review>;
  private bookings: Map<string, Booking>;

  constructor() {
    this.barbershops = new Map();
    this.reviews = new Map();
    this.bookings = new Map();
    this.seedData();
  }

  private seedData() {
    // Demo barbershops
    const shop1: Barbershop = {
      id: "1",
      name: "Premium Barber Shop",
      rating: 4.8,
      address: "Amir Temur ko'chasi 15, Yunusobod tumani",
      services: ["Soch olish - 50,000 so'm", "Soqol qirish - 30,000 so'm", "Styling - 40,000 so'm"],
      images: ["/images/luxury.png", "/images/barber-work.png"],
      reviewCount: 3,
    };

    const shop2: Barbershop = {
      id: "2",
      name: "Classic Barber",
      rating: 4.6,
      address: "Mustaqillik ko'chasi 42, Mirobod tumani",
      services: ["Soch olish - 45,000 so'm", "Soqol qirish - 25,000 so'm"],
      images: ["/images/classic.png", "/images/modern-exterior.png"],
      reviewCount: 3,
    };

    const shop3: Barbershop = {
      id: "3",
      name: "Modern Style Barber",
      rating: 4.9,
      address: "Buyuk Ipak Yo'li 88, Shayxontohur tumani",
      services: ["Soch olish - 60,000 so'm", "Soqol qirish - 35,000 so'm", "Styling - 50,000 so'm"],
      images: ["/images/minimalist.png", "/images/tools.png"],
      reviewCount: 3,
    };

    this.barbershops.set("1", shop1);
    this.barbershops.set("2", shop2);
    this.barbershops.set("3", shop3);

    // Demo reviews
    const reviewsData = [
      { barbershopId: "1", author: "Akmal Rahimov", rating: 5, comment: "Juda zo'r xizmat! Sartaroshlar professional va do'stona.", date: "3 kun oldin" },
      { barbershopId: "1", author: "Sardor Karimov", rating: 4, comment: "Yaxshi joy, sifatli ish. Narxlar ham qulay.", date: "1 hafta oldin" },
      { barbershopId: "1", author: "Bobur Toshmatov", rating: 5, comment: "Eng yaxshi sartaroshxona! Doimo shu yerga kelaman.", date: "2 hafta oldin" },
      { barbershopId: "2", author: "Javohir Alimov", rating: 5, comment: "Klassik uslub va yuqori sifat. Tavsiya qilaman!", date: "5 kun oldin" },
      { barbershopId: "2", author: "Dilshod Ergashev", rating: 4, comment: "Yaxshi xizmat, lekin biroz kutishga to'g'ri keladi.", date: "1 hafta oldin" },
      { barbershopId: "2", author: "Otabek Nazarov", rating: 5, comment: "Professional ustalar. Juda mamnunman!", date: "3 hafta oldin" },
      { barbershopId: "3", author: "Farrux Karimov", rating: 5, comment: "Zamonaviy uslub va eng yaxshi xizmat. 100% tavsiya!", date: "2 kun oldin" },
      { barbershopId: "3", author: "Aziz Mahmudov", rating: 5, comment: "Ustalar o'z ishini yaxshi biladilar. Rahmat!", date: "1 hafta oldin" },
      { barbershopId: "3", author: "Sherzod Yunusov", rating: 4, comment: "Narx biroz yuqori, lekin sifat bunga arziydi.", date: "2 hafta oldin" },
    ];

    reviewsData.forEach((r) => {
      const id = randomUUID();
      this.reviews.set(id, { id, ...r, createdAt: new Date() });
    });
  }

  async getBarbershops(): Promise<Barbershop[]> {
    return Array.from(this.barbershops.values());
  }

  async getBarbershop(id: string): Promise<Barbershop | undefined> {
    return this.barbershops.get(id);
  }

  async createBarbershop(barbershop: InsertBarbershop): Promise<Barbershop> {
    const id = randomUUID();
    const newShop: Barbershop = { ...barbershop, id, reviewCount: 0 };
    this.barbershops.set(id, newShop);
    return newShop;
  }

  async getReviewsByBarbershop(barbershopId: string): Promise<Review[]> {
    return Array.from(this.reviews.values()).filter(
      (r) => r.barbershopId === barbershopId
    );
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = randomUUID();
    const newReview: Review = { id, ...review, createdAt: new Date() };
    this.reviews.set(id, newReview);

    // Update review count
    const shop = this.barbershops.get(review.barbershopId);
    if (shop) {
      shop.reviewCount += 1;
      // Recalculate average rating
      const reviews = await this.getReviewsByBarbershop(review.barbershopId);
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      shop.rating = Math.round(avgRating * 10) / 10;
    }

    return newReview;
  }

  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const newBooking: Booking = { id, ...booking, status: "pending", createdAt: new Date() };
    this.bookings.set(id, newBooking);
    return newBooking;
  }

  async updateBookingStatus(id: string, status: string): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (booking) {
      booking.status = status;
      this.bookings.set(id, booking);
    }
    return booking;
  }
}

export const storage = new MemStorage();
