export const convertTimeToHH_MM = (timeString: string): string => {
  if (!timeString) return '';

  if (/^\d{2}:\d{2}$/.test(timeString)) {
    return timeString;
  }

  const timeRegex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
  const match = timeString.match(timeRegex);

  if (match) {
    let hours = parseInt(match[1]);
    const minutes = match[2];
    const period = match[3].toUpperCase();

    if (period === 'AM') {
      if (hours === 12) hours = 0; // 12:00 AM = 00:00
    } else {
      if (hours !== 12) hours += 12; // PM hours, но не 12:00 PM
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
  }

  return timeString;
};
