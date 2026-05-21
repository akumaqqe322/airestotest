import type { BookingResponse, Table, OrderStatus, ReservationStatus, TableZone } from '../types/booking';

// Base date we use for references
export const BASE_DATE = "2025-04-04";

// Stable list of available days
export const AVAILABLE_DAYS = [
  "2025-04-04",
  "2025-04-05",
  "2025-04-06",
  "2025-04-07",
  "2025-04-08"
];

/**
 * Creates an ISO timestamp with Vladivostok offset (+10:00) for a given date and time
 * Example: ("2025-04-04", "11:30") -> "2025-04-04T11:30:00.000000+10:00"
 */
function makeTimestamp(dateStr: string, timeStr: string): string {
  return `${dateStr}T${timeStr}:00.000000+10:00`;
}

/**
 * Dynamically shifts event dates to match the selectedDate
 */
export function generateMockDataForDate(selectedDate: string): BookingResponse {
  // Ensure we use a valid fallback day
  const targetDate = AVAILABLE_DAYS.includes(selectedDate) ? selectedDate : BASE_DATE;

  const tables: Table[] = [];

  // Helper inside generator to populate structured tables
  // Let's generate 28 tables to satisfy 25-35 requirements
  
  // ZONE 1: "1 этаж" (Tables 1 - 10)
  for (let i = 1; i <= 10; i++) {
    const tableId = `t-${i}`;
    const capacity = i % 3 === 0 ? 6 : (i % 2 === 0 ? 4 : 2);
    
    // Add custom reservation and orders for some tables
    const orders: any[] = [];
    const reservations: any[] = [];

    if (i === 1) {
      // Direct overlap test (Reservation vs Reservation)
      reservations.push({
        id: 101,
        name_for_reservation: "Александр Г.",
        num_people: 4,
        phone_number: "+7 (914) 100-11-22",
        status: "Новая",
        seating_time: makeTimestamp(targetDate, "12:00"),
        end_time: makeTimestamp(targetDate, "14:00")
      });
      // Overlapping reservation on the same table
      reservations.push({
        id: 102,
        name_for_reservation: "Евгений К. (Перехлест)",
        num_people: 3,
        phone_number: "+7 (924) 200-33-44",
        status: "Заявка",
        seating_time: makeTimestamp(targetDate, "13:00"),
        end_time: makeTimestamp(targetDate, "15:00")
      });
      // Active order running concurrently
      orders.push({
        id: "ord-101",
        status: "New",
        start_time: makeTimestamp(targetDate, "12:15"),
        end_time: makeTimestamp(targetDate, "13:45")
      });
    }

    if (i === 2) {
      // Exact opening boundary event
      reservations.push({
        id: 201,
        name_for_reservation: "Ранние Пташки",
        num_people: 2,
        phone_number: "+7 (902) 111-22-33",
        status: "Живая очередь",
        seating_time: makeTimestamp(targetDate, "11:00"), // opening
        end_time: makeTimestamp(targetDate, "12:30")
      });
      orders.push({
        id: "ord-201",
        status: "Closed",
        start_time: makeTimestamp(targetDate, "11:00"),
        end_time: makeTimestamp(targetDate, "12:15")
      });
    }

    if (i === 3) {
      // Long banquet event
      reservations.push({
        id: 301,
        name_for_reservation: "Семейный ужин",
        num_people: 6,
        phone_number: "+7 (999) 777-66-55",
        status: "Открыт",
        seating_time: makeTimestamp(targetDate, "16:00"),
        end_time: makeTimestamp(targetDate, "21:00") // 5 hour long reservation
      });
      orders.push({
        id: "ord-301",
        status: "Banquet",
        start_time: makeTimestamp(targetDate, "16:15"),
        end_time: makeTimestamp(targetDate, "20:45")
      });
    }

    if (i === 4) {
      // Short events in sequence
      reservations.push({
        id: 401,
        name_for_reservation: "Кофе-брейк",
        num_people: 2,
        phone_number: "+7 (914) 222-33-44",
        status: "Закрыт",
        seating_time: makeTimestamp(targetDate, "11:30"),
        end_time: makeTimestamp(targetDate, "12:15")
      });
      reservations.push({
        id: 402,
        name_for_reservation: "Консультация",
        num_people: 2,
        phone_number: "+7 (914) 333-44-55",
        status: "Новая",
        seating_time: makeTimestamp(targetDate, "13:00"),
        end_time: makeTimestamp(targetDate, "13:45")
      });
      reservations.push({
        id: 403,
        name_for_reservation: "Поздняя встреча",
        num_people: 1,
        phone_number: "+7 (914) 444-55-66",
        status: "Заявка",
        seating_time: makeTimestamp(targetDate, "15:00"),
        end_time: makeTimestamp(targetDate, "15:30")
      });
    }

    if (i === 5) {
      // Test event that spills beyond closing boundary slightly to verify clamping
      reservations.push({
        id: 501,
        name_for_reservation: "Ночные Гости (Клапм)",
        num_people: 2,
        phone_number: "+7 (908) 555-55-55",
        status: "Открыт",
        seating_time: makeTimestamp(targetDate, "22:30"),
        end_time: "2025-04-05T01:00:00.000000+10:00" // late, beyond closing (23:40)
      });
    }

    if (i === 6) {
      // Double overlap case with active bill status
      reservations.push({
        id: 601,
        name_for_reservation: "Группа А",
        num_people: 4,
        phone_number: "+7 (991) 601-11-11",
        status: "Заявка",
        seating_time: makeTimestamp(targetDate, "14:00"),
        end_time: makeTimestamp(targetDate, "16:00")
      });
      reservations.push({
        id: 602,
        name_for_reservation: "Группа Б",
        num_people: 4,
        phone_number: "+7 (991) 602-22-22",
        status: "Новая",
        seating_time: makeTimestamp(targetDate, "15:00"),
        end_time: makeTimestamp(targetDate, "17:00")
      });
      orders.push({
        id: "ord-601",
        status: "Bill",
        start_time: makeTimestamp(targetDate, "14:15"),
        end_time: makeTimestamp(targetDate, "16:45")
      });
    }

    tables.push({
      id: tableId,
      number: `Стол ${i}`,
      capacity,
      zone: "1 этаж",
      orders,
      reservations
    });
  }

  // ZONE 2: "2 этаж" (Tables 11 - 20)
  for (let i = 11; i <= 20; i++) {
    const tableId = `t-${i}`;
    const capacity = i % 4 === 0 ? 8 : (i % 2 === 0 ? 4 : 2);
    
    const orders: any[] = [];
    const reservations: any[] = [];

    if (i === 11) {
      // Active order only, no reservation
      orders.push({
        id: `ord-${i}-1`,
        status: "New",
        start_time: makeTimestamp(targetDate, "13:00"),
        end_time: makeTimestamp(targetDate, "15:30")
      });
    }

    if (i === 12) {
      // Reservation only, no order
      reservations.push({
        id: 1201,
        name_for_reservation: "Олег Макаров",
        num_people: 2,
        phone_number: "+7 (924) 888-00-11",
        status: "Новая",
        seating_time: makeTimestamp(targetDate, "18:00"),
        end_time: makeTimestamp(targetDate, "20:00")
      });
    }

    if (i === 13) {
      // Multi overlap 3-way to test robust layout spacing and relative margins!
      reservations.push({
        id: 1301,
        name_for_reservation: "Компания Альфа",
        num_people: 4,
        phone_number: "+7 (924) 130-11-11",
        status: "Заявка",
        seating_time: makeTimestamp(targetDate, "15:00"),
        end_time: makeTimestamp(targetDate, "17:00")
      });
      reservations.push({
        id: 1302,
        name_for_reservation: "Компания Бета",
        num_people: 4,
        phone_number: "+7 (924) 130-22-22",
        status: "Новая",
        seating_time: makeTimestamp(targetDate, "15:30"),
        end_time: makeTimestamp(targetDate, "17:30")
      });
      reservations.push({
        id: 1303,
        name_for_reservation: "Компания Гамма",
        num_people: 3,
        phone_number: "+7 (924) 130-33-33",
        status: "Живая очередь",
        seating_time: makeTimestamp(targetDate, "16:00"),
        end_time: makeTimestamp(targetDate, "18:00")
      });
    }

    if (i === 15) {
      // Event exactly ending at closing_time
      reservations.push({
        id: 1501,
        name_for_reservation: "Ночной Жор",
        num_people: 2,
        phone_number: "+7 (914) 151-51-51",
        status: "Открыт",
        seating_time: makeTimestamp(targetDate, "22:00"),
        end_time: makeTimestamp(targetDate, "23:40") // exactly closing
      });
      orders.push({
        id: "ord-1501",
        status: "Bill",
        start_time: makeTimestamp(targetDate, "22:15"),
        end_time: makeTimestamp(targetDate, "23:40")
      });
    }

    tables.push({
      id: tableId,
      number: `Стол ${i}`,
      capacity,
      zone: "2 этаж",
      orders,
      reservations
    });
  }

  // ZONE 3: "Банкетный зал" (Tables 21 - 28)
  for (let i = 21; i <= 28; i++) {
    const tableId = `t-${i}`;
    const capacity = i === 25 ? 20 : (i % 2 === 0 ? 12 : 10);
    const tableName = i === 25 ? "Президентский VIP" : `Банкетный стол ${i}`;
    
    const orders: any[] = [];
    const reservations: any[] = [];

    if (i === 21) {
      // VIP Banquet
      reservations.push({
        id: 2101,
        name_for_reservation: "Свадьба Смирновых",
        num_people: 12,
        phone_number: "+7 (900) 211-12-12",
        status: "Новая",
        seating_time: makeTimestamp(targetDate, "13:00"),
        end_time: makeTimestamp(targetDate, "19:00")
      });
      orders.push({
        id: "ord-2101",
        status: "Banquet",
        start_time: makeTimestamp(targetDate, "13:00"),
        end_time: makeTimestamp(targetDate, "18:30")
      });
    }

    if (i === 25) {
      // Megabanquet
      reservations.push({
        id: 2501,
        name_for_reservation: "Юбилей Корпорации",
        num_people: 20,
        phone_number: "+7 (999) 250-50-50",
        status: "Открыт",
        seating_time: makeTimestamp(targetDate, "15:00"),
        end_time: makeTimestamp(targetDate, "22:00")
      });
      orders.push({
        id: "ord-2501",
        status: "Banquet",
        start_time: makeTimestamp(targetDate, "15:15"),
        end_time: makeTimestamp(targetDate, "21:45")
      });
    }

    tables.push({
      id: tableId,
      number: tableName,
      capacity,
      zone: "Банкетный зал",
      orders,
      reservations
    });
  }

  return {
    available_days: AVAILABLE_DAYS,
    current_day: BASE_DATE,
    restaurant: {
      id: 1,
      timezone: "Asia/Vladivostok",
      restaurant_name: "Супра",
      opening_time: "11:00",
      closing_time: "23:40"
    },
    tables
  };
}

// Keep a constant base mock data export for backwards compatibility
export const MOCK_BOOKING_DATA = generateMockDataForDate(BASE_DATE);
