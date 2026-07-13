// In-memory cache for the process lifetime
const holidayCache = {};

export async function getIndianHolidays(year) {
  if (holidayCache[year]) {
    return holidayCache[year];
  }

  try {
    const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IN`, {
      // Don't cache via Next.js fetch cache if we are handling it in-memory,
      // but force-cache is fine as a fallback
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch holidays: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map to just the fields we need: { date, localName }
    const holidays = data.map(h => ({
      date: h.date, // Format: "YYYY-MM-DD"
      localName: h.localName || h.name
    }));

    holidayCache[year] = holidays;
    return holidays;
  } catch (error) {
    console.error(`[getIndianHolidays] Error fetching holidays for ${year}:`, error);
    // Graceful degradation: return empty array if API is unreachable
    return [];
  }
}
