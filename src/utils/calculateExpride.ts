const calculateExpiration = (duration: string | number): number => {
  const now = new Date();

  // If it's just a number, assume it is seconds (standard JWT practice)
  if (typeof duration === "number") {
    return now.getTime() + duration * 1000;
  }

  // Regex to separate the number from the unit (s, m, h, d)
  // ^(\d+) captures the number
  // ([smhd])$ captures the unit at the end
  const match = duration.match(/^(\d+)([smhd])$/);

  if (!match) {
    // If no unit is found (e.g. "3600"), try to parse as seconds
    const seconds = parseInt(duration);
    if (isNaN(seconds)) throw new Error(`Invalid time format: ${duration}`);
    return now.getTime() + seconds * 1000;
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  let millisecondsToAdd = 0;

  switch (unit) {
    case "s": // Seconds
      millisecondsToAdd = value * 1000;
      break;
    case "m": // Minutes
      millisecondsToAdd = value * 60 * 1000;
      break;
    case "h": // Hours
      millisecondsToAdd = value * 60 * 60 * 1000;
      break;
    case "d": // Days
      millisecondsToAdd = value * 24 * 60 * 60 * 1000;
      break;
    default:
      throw new Error(`Unsupported time unit: ${unit}`);
  }

  return now.getTime() + millisecondsToAdd;
};

export default calculateExpiration;
