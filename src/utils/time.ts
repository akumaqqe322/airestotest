/**
 * Converts a "HH:MM" time string to the number of minutes since midnight
 * Example: "11:30" -> 690
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr || !timeStr.includes(':')) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
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
 * Generates an array of time ticks (represented as minutes from midnight)
 * spaced by a given interval between start and end times.
 * Example: "11:00", "23:40", interval 30
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
 * Formats a raw date string or timestamp into a readable date or time
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
    // Falls back to string if parsing failed
  }
  return dateStr;
}
