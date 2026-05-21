import type { BookingResponse } from '../types/booking';
import { MOCK_BOOKING_DATA } from '../mocks/bookingMock';

/**
 * Simulates calling an API endpoint with a network delay
 */
export async function getBookingData(): Promise<BookingResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(JSON.parse(JSON.stringify(MOCK_BOOKING_DATA)));
    }, 450); // 450ms simulated delay
  });
}
