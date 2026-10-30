const cleanValue = (value) => String(value || '')
  .replace(/[*_`]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

export function parseBookingMessageDetails(message) {
  if (typeof message !== 'string' || !message.trim()) return [];

  let text = message.replace(/%0A/gi, '\n').replace(/\\n/g, '\n');
  try {
    text = decodeURIComponent(text.replace(/\+/g, '%20'));
  } catch {
    // Keep the original message if it contains malformed URL encoding.
  }

  const entries = [];
  let activeEntry = null;
  const flush = () => {
    if (activeEntry?.label && activeEntry.value) entries.push(activeEntry);
    activeEntry = null;
  };

  for (const sourceLine of text.split(/\r?\n/)) {
    const line = sourceLine.trim().replace(/^[•·-]\s*/, '');
    if (!line || /https?:\/\//i.test(line) || /^(?:accept|decline|action required)\b/i.test(cleanValue(line))) continue;

    const match = line.match(/^(?:[^\p{L}\p{N}]{0,5}\s*)?\*?_?([^:*_]{2,60})\*?_?\s*:\s*(.*)$/u);
    if (match) {
      flush();
      const label = cleanValue(match[1]).replace(/\s+/g, ' ');
      const value = cleanValue(match[2]);
      if (label && !/^(booking request|service booking request|client details|service details|booking details|action required)$/i.test(label)) {
        activeEntry = { label, value };
      }
    } else if (activeEntry) {
      const continuation = cleanValue(line);
      if (continuation) activeEntry.value = [activeEntry.value, continuation].filter(Boolean).join(' ');
    }
  }
  flush();

  const seen = new Set();
  return entries.filter(({ label, value }) => {
    const key = `${label.toLowerCase()}\u0000${value.toLowerCase()}`;
    if (!label || !value || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
