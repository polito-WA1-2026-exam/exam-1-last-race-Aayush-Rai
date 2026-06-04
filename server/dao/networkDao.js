// Network DAO — all queries related to lines, stations, and segments.

const getNetwork = async (db) => {
  const lines    = await db.all('SELECT id, name, color FROM lines ORDER BY id');
  const stations = await db.all('SELECT id, name FROM stations ORDER BY name');

  const stops = await db.all(`
    SELECT ls.line_id, ls.station_id, ls.position,
           s.name  AS station_name,
           l.name  AS line_name,
           l.color AS line_color
    FROM line_stations ls
    JOIN stations s ON s.id = ls.station_id
    JOIN lines    l ON l.id = ls.line_id
    ORDER BY ls.line_id, ls.position
  `);

  // Build segments from consecutive stops on each line
  const byLine = {};
  for (const stop of stops) {
    if (!byLine[stop.line_id]) byLine[stop.line_id] = [];
    byLine[stop.line_id].push(stop);
  }

  const segments = [];
  for (const lineStops of Object.values(byLine)) {
    for (let i = 0; i < lineStops.length - 1; i++) {
      const a = lineStops[i];
      const b = lineStops[i + 1];
      segments.push({
        from_station_id:   a.station_id,
        from_station_name: a.station_name,
        to_station_id:     b.station_id,
        to_station_name:   b.station_name,
        line_id:           a.line_id,
        line_name:         a.line_name,
        line_color:        a.line_color,
      });
    }
  }

  return { lines, stations, segments };
};

const getInterchangeIds = async (db) => {
  const rows = await db.all(`
    SELECT station_id FROM line_stations
    GROUP BY station_id HAVING COUNT(DISTINCT line_id) > 1
  `);
  return rows.map(r => r.station_id);
};

export { getNetwork, getInterchangeIds };
