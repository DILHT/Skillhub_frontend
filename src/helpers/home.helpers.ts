export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export const getTimeOfDay = (date: Date = new Date()): TimeOfDay => {
  const hours = date.getHours();

  if (hours >= 5 && hours < 12) {
    return 'morning';
  }

  if (hours >= 12 && hours < 17) {
    return 'afternoon';
  }

  return 'evening';
};

export const isMorning = (date: Date = new Date()): boolean =>
  getTimeOfDay(date) === 'morning';

export const isAfternoon = (date: Date = new Date()): boolean =>
  getTimeOfDay(date) === 'afternoon';

export const isEvening = (date: Date = new Date()): boolean =>
  getTimeOfDay(date) === 'evening';
