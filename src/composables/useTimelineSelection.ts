import { ref, computed, type Ref } from 'vue';
import type { NormalizedTable, TableZone, TimelineSelection } from '../types/booking';
import { timeToMinutes, minutesToTime, clamp } from '../utils/time';

export function useTimelineSelection(
  tables: Ref<NormalizedTable[]>,
  openingTime: Ref<string>,
  closingTime: Ref<string>,
  selectedDate: Ref<string>,
  pixelsPerMinute: number,
  columnWidth: number
) {
  const selectionStart = ref<{ colIndex: number; mins: number } | null>(null);
  const selectionCurrent = ref<{ colIndex: number; mins: number } | null>(null);
  const isDragging = ref(false);

  // Computed selection model representing the active selected zone/times
  const activeSelection = computed<TimelineSelection | null>(() => {
    if (!selectionStart.value || !selectionCurrent.value) return null;

    const opMins = timeToMinutes(openingTime.value);
    const clMins = timeToMinutes(closingTime.value);

    // Columns range calculation
    const colStart = Math.min(selectionStart.value.colIndex, selectionCurrent.value.colIndex);
    const colEnd = Math.max(selectionStart.value.colIndex, selectionCurrent.value.colIndex);

    const tablesList = tables.value;
    const clampedColStart = clamp(colStart, 0, tablesList.length - 1);
    const clampedColEnd = clamp(colEnd, 0, tablesList.length - 1);

    const selectedTables = tablesList.slice(clampedColStart, clampedColEnd + 1);
    if (selectedTables.length === 0) return null;

    // Time ranges calculation
    const rawStartMins = Math.min(selectionStart.value.mins, selectionCurrent.value.mins);
    const rawEndMins = Math.max(selectionStart.value.mins, selectionCurrent.value.mins);

    // Snap to 15-minute intervals
    let startMins = Math.round(rawStartMins / 15) * 15;
    let endMins = Math.round(rawEndMins / 15) * 15;

    // Clamp inside restaurant boundaries
    startMins = clamp(startMins, opMins, clMins);
    endMins = clamp(endMins, opMins, clMins);

    // Enforce a minimum interval representation of 15 minutes to avoid zero-height overlays
    if (endMins <= startMins) {
      if (startMins + 15 <= clMins) {
        endMins = startMins + 15;
      } else if (endMins - 15 >= opMins) {
        startMins = endMins - 15;
      }
    }

    const startTime = minutesToTime(startMins);
    const endTime = minutesToTime(endMins);

    const tableIds = selectedTables.map((t) => t.id);
    const tableNumbers = selectedTables.map((t) => t.number);
    const zones = Array.from(new Set(selectedTables.map((t) => t.zone))) as TableZone[];

    // Conflict detection: Checks if the selected window overlaps any event in any of the selected tables
    let hasConflicts = false;
    for (const table of selectedTables) {
      for (const event of table.events) {
        const eventStart = timeToMinutes(event.startTime);
        const eventEnd = timeToMinutes(event.endTime);
        const overlaps = startMins < eventEnd && endMins > eventStart;
        if (overlaps) {
          hasConflicts = true;
          break;
        }
      }
      if (hasConflicts) break;
    }

    return {
      tableIds,
      tableNumbers,
      zones,
      selectedDate: selectedDate.value,
      startMins,
      endMins,
      startTime,
      endTime,
      hasConflicts
    };
  });

  const resetSelection = () => {
    selectionStart.value = null;
    selectionCurrent.value = null;
    isDragging.value = false;
  };

  // Helper to manually adjust selection times from numeric inputs or inline custom controls
  const updateStartTime = (timeStr: string) => {
    if (!selectionStart.value || !selectionCurrent.value) return;
    const mins = timeToMinutes(timeStr);
    if (selectionStart.value.mins <= selectionCurrent.value.mins) {
      selectionStart.value = { ...selectionStart.value, mins };
    } else {
      selectionCurrent.value = { ...selectionCurrent.value, mins };
    }
  };

  const updateEndTime = (timeStr: string) => {
    if (!selectionStart.value || !selectionCurrent.value) return;
    const mins = timeToMinutes(timeStr);
    if (selectionStart.value.mins <= selectionCurrent.value.mins) {
      selectionCurrent.value = { ...selectionCurrent.value, mins };
    } else {
      selectionStart.value = { ...selectionStart.value, mins };
    }
  };

  // Coordinates helper to parse Pointer Events into column & minute indices
  const getPointerCoords = (e: PointerEvent, container: HTMLElement) => {
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const opMins = timeToMinutes(openingTime.value);
    const clMins = timeToMinutes(closingTime.value);
    const numTables = tables.value.length;

    const colIndex = clamp(Math.floor(x / columnWidth), 0, numTables - 1);
    const mins = clamp((y / pixelsPerMinute) + opMins, opMins, clMins);

    return { colIndex, mins };
  };

  // Pointer event handlers
  const handlePointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    
    // Ignore if drag starts inside an EventBlock or any of its children
    if (target.closest('.event-block')) {
      return;
    }

    // Only allow primary pointer activity (e.g. left clicks)
    if (e.pointerType === 'mouse' && e.button !== 0) {
      return;
    }

    const container = e.currentTarget as HTMLElement;
    container.setPointerCapture(e.pointerId);
    isDragging.value = true;

    const coords = getPointerCoords(e, container);
    selectionStart.value = coords;
    selectionCurrent.value = coords;
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (!isDragging.value || !selectionStart.value) return;

    const container = e.currentTarget as HTMLElement;
    const coords = getPointerCoords(e, container);
    selectionCurrent.value = coords;
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (!isDragging.value) return;

    const container = e.currentTarget as HTMLElement;
    container.releasePointerCapture(e.pointerId);
    isDragging.value = false;
  };

  const handlePointerCancel = (e: PointerEvent) => {
    if (!isDragging.value) return;

    const container = e.currentTarget as HTMLElement;
    container.releasePointerCapture(e.pointerId);
    resetSelection();
  };

  return {
    isDragging,
    activeSelection,
    resetSelection,
    updateStartTime,
    updateEndTime,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel
  };
}
