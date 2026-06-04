// Route Validator — pure function, no database calls.
//
// A route is an ordered array of station IDs e.g. [1, 3, 5, 9]
// Rules:
//   1. Starts at assigned start station
//   2. Ends at assigned destination station
//   3. Every consecutive pair is a real segment on some line
//   4. Line changes only at interchange stations
//   5. No segment traversed more than once

const buildLookups = (segments, interchangeIds) => {
  const segmentLines = new Map();

  const addSegment = (from, to, lineId) => {
    const key = `${from}-${to}`;
    if (!segmentLines.has(key)) segmentLines.set(key, new Set());
    segmentLines.get(key).add(lineId);
  };

  for (const seg of segments) {
    addSegment(seg.from_station_id, seg.to_station_id, seg.line_id);
    addSegment(seg.to_station_id, seg.from_station_id, seg.line_id);
  }

  return { segmentLines, interchangeSet: new Set(interchangeIds) };
};

const validateRoute = (route, startId, endId, segments, interchangeIds) => {
  if (!Array.isArray(route) || route.length < 2)
    return { valid: false, reason: 'Route must contain at least two stations.' };

  if (route[0] !== startId)
    return { valid: false, reason: 'Route does not start at the assigned station.' };

  if (route[route.length - 1] !== endId)
    return { valid: false, reason: 'Route does not end at the assigned destination.' };

  const { segmentLines, interchangeSet } = buildLookups(segments, interchangeIds);
  const usedSegments = new Set();
  let currentLines = null;

  for (let i = 0; i < route.length - 1; i++) {
    const from = route[i];
    const to   = route[i + 1];
    const key  = `${from}-${to}`;

    if (usedSegments.has(key))
      return { valid: false, reason: `Segment ${from}→${to} used more than once.` };
    usedSegments.add(key);

    const linesForSegment = segmentLines.get(key);
    if (!linesForSegment)
      return { valid: false, reason: `No metro line connects stations ${from} and ${to}.` };

    if (currentLines === null) {
      currentLines = new Set(linesForSegment);
    } else {
      const continuingLines = new Set([...currentLines].filter(l => linesForSegment.has(l)));
      if (continuingLines.size > 0) {
        currentLines = continuingLines;
      } else {
        if (!interchangeSet.has(from))
          return { valid: false, reason: `Line change at ${from} is not an interchange station.` };
        currentLines = new Set(linesForSegment);
      }
    }
  }

  return { valid: true, reason: 'Route is valid.' };
};

export { validateRoute };
