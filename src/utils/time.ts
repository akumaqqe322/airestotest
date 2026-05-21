/**
 * Converts a "HH:MM" time string to the number of minutes since midnight
 * Example: "11:30" -> 690
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  // If it's an ISO date string, convert it first to time-of-day minutes
  if (timeStr.includes('T') || timeStr.includes('-')) {
    // Treat as ISO but without spec, we will let getMinutesOfDay handle it.
    // However, if called directly, we fallback to regex extraction or Date parse
    const match = timeStr.match(/T(\d{2}):(\d{2})/);
    if (match) {
      return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    }
  }
  const clean = timeStr.split(':');
  if (clean.length < 2) return 0;
  const hours = parseInt(clean[0], 10);
  const minutes = parseInt(clean[1], 10);
  if (isNaN(hours) || isNaN(minutes)) return 0;
  return hours * 60 + minutes;
}

/**
 * Converts minutes since midnight back into a "HH:MM" format
 * Example: 690 -> "11:30"
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Parses both "HH:mm" time and complete ISO datetimes (with timezone offset)
 * into minutes from the start of the day in the target timezone.
 * Returns 0 on invalid values.
 */
export function getMinutesOfDay(value: string, timezone?: string): number {
  if (!value) return 0;
  
  // Direct check for "HH:mm"
  if (!value.includes('T') && !value.includes('-')) {
    return timeToMinutes(value);
  }

  try {
    const date = new Date(value);
    if (isNaN(date.getTime())) return 0;

    const tz = timezone || 'UTC';
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    
    const parts = formatter.formatToParts(date);
    let hourStr = '0';
    let minuteStr = '0';
    
    for (const part of parts) {
      if (part.type === 'hour') hourStr = part.value;
      if (part.type === 'minute') minuteStr = part.value;
    }
    
    let hours = parseInt(hourStr, 10);
    // Adjust 24 hours midnight edge case if it occurs
    if (hours === 24) hours = 0;
    
    const minutes = parseInt(minuteStr, 10);
    return hours * 60 + minutes;
  } catch (e) {
    // Fallback parser using regex
    const match = value.match(/T(\d{2}):(\d{2})/);
    if (match) {
      return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
    }
    return 0;
  }
}

/**
 * Returns a styled formatted scale presentation of a time range, e.g. "12:00 - 13:30"
 */
export function formatTimeRange(start: string, end: string, timezone?: string): string {
  const startMins = getMinutesOfDay(start, timezone);
  const endMins = getMinutesOfDay(end, timezone);
  return `${minutesToTime(startMins)} - ${minutesToTime(endMins)}`;
}

/**
 * Returns current restaurant time in "HH:MM" format
 */
export function getCurrentTimeInTimezone(timezone: string): string {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    
    const parts = formatter.formatToParts(now);
    let hourStr = '00';
    let minuteStr = '00';
    
    for (const part of parts) {
      if (part.type === 'hour') hourStr = part.value;
      if (part.type === 'minute') minuteStr = part.value;
    }
    
    let hours = parseInt(hourStr, 10);
    if (hours === 24) hours = 0;
    
    return `${String(hours).padStart(2, '0')}:${minuteStr.padStart(2, '0')}`;
  } catch (e) {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }
}

/**
 * Simple clamping utility
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Returns total operational minutes
 */
export function getWorkingMinutes(openingTime: string, closingTime: string): number {
  return timeToMinutes(closingTime) - timeToMinutes(openingTime);
}

/**
 * Generates an array of time ticks (represented as minutes from midnight)
 */
export function generateTimeTicks(startStr: string, endStr: string, intervalMinutes: number = 30): number[] {
  const start = timeToMinutes(startStr);
  const end = timeToMinutes(endStr);
  const ticks: number[] = [];
  
  for (let t = start; t <= end; t += intervalMinutes) {
    ticks.push(t);
  }
  return ticks;
}

/**
 * Formats a raw date string or timestamp into a readable date or time of day
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        weekday: 'short'
      });
    }
  } catch (e) {
    // ignores
  }
  return dateStr;
}
