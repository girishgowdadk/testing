export const formatSeconds = (seconds) => {
  const secs = parseFloat(seconds);
  if (isNaN(secs)) return '00:00:00';
  
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  const ms = (secs % 1).toFixed(1).substring(2); // Get the tenth of a second if any

  const hDisplay = h < 10 ? '0' + h : h;
  const mDisplay = m < 10 ? '0' + m : m;
  const sDisplay = s < 10 ? '0' + s : s;
  
  // If we have hours, show HH:MM:SS
  // If we don't have hours but have minutes, show MM:SS
  // Actually the user specifically asked for HH:MM:SS
  
  return `${hDisplay}:${mDisplay}:${sDisplay}${ms > 0 ? '.' + ms : ''}`;
};