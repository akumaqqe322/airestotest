import type { Table, TimelineEvent, NormalizedTable, PositionedTimelineEvent } from '../types/booking';
import { getMinutesOfDay } from './time';

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

/**
 * Positon/Layout engine for events inside a single table column track.
 * Orders events sequentially, assigns collision lanes, computes relative heights/top metrics,
 * and sets compact display states.
 */
export function layoutEventsForColumn(
  events: TimelineEvent[],
  openingTime: string,
  closingTime: string,
  timezone: string,
  pixelsPerMinute: number,
  columnWidth: number
): PositionedTimelineEvent[] {
  const openingMins = getMinutesOfDay(openingTime, timezone);
  const closingMins = getMinutesOfDay(closingTime, timezone);

  // 1. Map to temporary format with parsed minutes & filter out-of-bounds events
  const mapped = events
    .map(e => {
      const startMins = getMinutesOfDay(e.startTime, timezone);
      const endMins = getMinutesOfDay(e.endTime, timezone);
      return {
        event: e,
        originalStart: startMins,
        originalEnd: endMins
      };
    })
    .filter(item => {
      // Keep only events that fall at least partially within operating hours
      return item.originalStart < closingMins && item.originalEnd > openingMins;
    })
    .map(item => {
      // Clamp values safely
      let startMins = Math.max(openingMins, Math.min(closingMins, item.originalStart));
      let endMins = Math.max(openingMins, Math.min(closingMins, item.originalEnd));

      // Satisfy minimum display height block (15 mins minimum duration)
      if (endMins - startMins < 15) {
        endMins = Math.min(closingMins, startMins + 15);
      }

      return {
        event: item.event,
        startMins,
        endMins
      };
    });

  // Sort primarily by start time to make lane distribution deterministic
  mapped.sort((a, b) => {
    if (a.startMins !== b.startMins) {
      return a.startMins - b.startMins;
    }
    return String(a.event.id).localeCompare(String(b.event.id));
  });

  // 2. Greedy interval coloring (lane assignment)
  const positionedTemp: {
    event: TimelineEvent;
    startMins: number;
    endMins: number;
    topPx: number;
    heightPx: number;
    lane: number;
  }[] = [];

  for (let i = 0; i < mapped.length; i++) {
    const current = mapped[i];
    
    // Check previous placed items in the column for conflicts
    const conflictLanes = new Set<number>();
    for (let j = 0; j < positionedTemp.length; j++) {
      const prev = positionedTemp[j];
      // Time collision check
      const overlaps = current.startMins < prev.endMins && current.endMins > prev.startMins;
      if (overlaps) {
        conflictLanes.add(prev.lane);
      }
    }

    // Find the first free lane
    let lane = 0;
    while (conflictLanes.has(lane)) {
      lane++;
    }

    const topPx = (current.startMins - openingMins) * pixelsPerMinute;
    const heightPx = (current.endMins - current.startMins) * pixelsPerMinute;

    positionedTemp.push({
      event: current.event,
      startMins: current.startMins,
      endMins: current.endMins,
      topPx,
      heightPx,
      lane
    });
  }

  // 3. Assemble and calculate final PositionedTimelineEvent fields
  return positionedTemp.map((placed, i) => {
    const ev = placed.event;
    
    // Find how many overlaps this card actually shares total
    // (useful to determine if it requires compact visual state)
    const totalCollisions = positionedTemp.filter((other, idx) => {
      if (idx === i) return false;
      return placed.startMins < other.endMins && placed.endMins > other.startMins;
    });

    const isOverlapped = totalCollisions.length > 0;
    const overlapCount = totalCollisions.length;

    // Horizontally offset by 6px per lane and shrink width respectively
    const offset = placed.lane * 6;
    const leftPx = offset;
    const widthPx = isOverlapped 
      ? Math.max(50, columnWidth - offset - 6) 
      : columnWidth - 6;

    // Compact configuration to hide secondary details for small cards
    const compact = placed.heightPx < 55 || placed.lane > 0 || overlapCount > 1;

    // Scale z-index higher with lane depth so overlapping cards stack nicely
    const zIndex = 10 + placed.lane;

    return {
      ...ev,
      topPx: placed.topPx,
      heightPx: placed.heightPx,
      leftPx,
      widthPx,
      lane: placed.lane,
      overlapCount,
      isOverlapped,
      compact,
      zIndex
    };
  });
}
