export interface Restaurant {
  id: number;
  timezone: string;
  restaurant_name: string;
  opening_time: string;
  closing_time: string;
}

export type OrderStatus = "New" | "Bill" | "Closed" | "Banquet";

export interface Order {
  id: string;
  status: OrderStatus;
  start_time: string; // "HH:MM"
  end_time: string;   // "HH:MM"
}

export type ReservationStatus = "Живая очередь" | "Новая" | "Заявка" | "Открыт" | "Закрыт";

export interface Reservation {
  id: number;
  name_for_reservation: string;
  num_people: number;
  phone_number: string;
  status: ReservationStatus;
  seating_time: string; // "HH:MM"
  end_time: string;     // "HH:MM"
}

export type TableZone = "1 этаж" | "2 этаж" | "Банкетный зал";

export interface Table {
  id: string;
  capacity: number;
  number: string;
  zone: TableZone;
  orders: Order[];
  reservations: Reservation[];
}

export interface BookingResponse {
  available_days: string[];
  current_day: string;
  restaurant: Restaurant;
  tables: Table[];
}

// Normalized timeline formats for easy visual rendering without mixing up raw API shapes
export interface TimelineEvent {
  id: string; // Unified unique identifier, e.g. 'order-123' or 'res-456'
  type: 'order' | 'reservation';
  originalId: string | number;
  status: OrderStatus | ReservationStatus;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
  name?: string;     // Reservation name
  numPeople?: number;// Number of guests
  phoneNumber?: string;
  // Computed values convenient for rendering
  title: string;
  subtitle?: string;
}

export interface NormalizedTable {
  id: string;
  number: string;
  capacity: number;
  zone: TableZone;
  events: TimelineEvent[];
}

export interface PositionedTimelineEvent extends TimelineEvent {
  topPx: number;
  heightPx: number;
  leftPx: number;
  widthPx: number;
  lane: number;
  overlapCount: number;
  isOverlapped: boolean;
  compact: boolean;
  zIndex: number;
}

