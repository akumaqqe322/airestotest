import type { BookingResponse } from '../types/booking';
import { generateMockDataForDate } from '../mocks/bookingMock';

/**
 * Simulates calling an API endpoint with a network delay for a specific selected date
 */
export async function getBookingData(selectedDate?: string): Promise<BookingResponse> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const data = generateMockDataForDate(selectedDate || "2025-04-04");
      resolve(JSON.parse(JSON.stringify(data)));
    }, 350); // 350ms simulated network delay
  });
}
