import type { Table, TimelineEvent, NormalizedTable } from '../types/booking';

/**
 * Normalizes Table bookings (reservations and orders) into a standard TimelineEvent format
 * to prevent having different formats across components.
 */
export function normalizeTableEvents(table: Table): NormalizedTable {
  const events: TimelineEvent[] = [];

  // Normalize reservations
  if (table.reservations && Array.isArray(table.reservations)) {
    table.reservations.forEach((res) => {
      events.push({
        id: `res-${res.id}`,
        type: 'reservation',
        originalId: res.id,
        status: res.status,
        startTime: res.seating_time,
        endTime: res.end_time,
        name: res.name_for_reservation,
        numPeople: res.num_people,
        phoneNumber: res.phone_number,
        title: res.name_for_reservation,
        subtitle: `${res.num_people} чел • ${res.phone_number}`
      });
    });
  }

  // Normalize orders
  if (table.orders && Array.isArray(table.orders)) {
    table.orders.forEach((ord) => {
      // Avoid duplicate display if a reservation time perfectly matches an order,
      // or simply include both. In a restaurant timeline, having both helps staff see seating vs bills.
      events.push({
        id: `ord-${ord.id}`,
        type: 'order',
        originalId: ord.id,
        status: ord.status,
        startTime: ord.start_time,
        endTime: ord.end_time,
        title: `Заказ ${ord.id}`,
        subtitle: `Статус: ${ord.status}`
      });
    });
  }

  return {
    id: table.id,
    number: table.number,
    capacity: table.capacity,
    zone: table.zone,
    events
  };
}

/**
 * Normalizes an array of tables
 */
export function normalizeTables(tables: Table[]): NormalizedTable[] {
  return tables.map(normalizeTableEvents);
}
