// Game DAO — queries related to games and scores.

// Picks a random start/destination pair at least 3 segments apart (BFS).
const getRandomStartAndDestination = async (db) => {
  const stops = await db.all(
    'SELECT line_id, station_id, position FROM line_stations ORDER BY line_id, position'
  );

  const adjacency = {};
  const byLine = {};
  for (const stop of stops) {
    if (!byLine[stop.line_id]) byLine[stop.line_id] = [];
    byLine[stop.line_id].push(stop);
    if (!adjacency[stop.station_id]) adjacency[stop.station_id] = new Set();
  }
  for (const lineStops of Object.values(byLine)) {
    for (let i = 0; i < lineStops.length - 1; i++) {
      const a = lineStops[i].station_id;
      const b = lineStops[i + 1].station_id;
      adjacency[a].add(b);
      adjacency[b].add(a);
    }
  }

  const bfsDistances = (source) => {
    const dist = { [source]: 0 };
    const queue = [source];
    while (queue.length) {
      const cur = queue.shift();
      for (const neighbour of adjacency[cur] || []) {
        if (dist[neighbour] === undefined) {
          dist[neighbour] = dist[cur] + 1;
          queue.push(neighbour);
        }
      }
    }
    return dist;
  };

  const stationIds = Object.keys(adjacency).map(Number);
  const validPairs = [];
  for (const src of stationIds) {
    const distances = bfsDistances(src);
    for (const [dst, d] of Object.entries(distances)) {
      if (Number(dst) !== src && d >= 3) {
        validPairs.push({ start: src, end: Number(dst) });
      }
    }
  }

  if (validPairs.length === 0) throw new Error('No valid start/destination pairs found');

  const pick = validPairs[Math.floor(Math.random() * validPairs.length)];
  const startStation = await db.get('SELECT id, name FROM stations WHERE id = ?', pick.start);
  const endStation   = await db.get('SELECT id, name FROM stations WHERE id = ?', pick.end);

  return { startStation, endStation };
};

const getRandomEvent = async (db) => {
  const events = await db.all('SELECT * FROM events');
  return events[Math.floor(Math.random() * events.length)];
};

const saveGame = async (db, userId, startId, endId, score, routeValid) => {
  const result = await db.run(
    'INSERT INTO games (user_id, start_station, end_station, score, route_valid) VALUES (?, ?, ?, ?, ?)',
    userId, startId, endId, score, routeValid ? 1 : 0
  );
  return result.lastID;
};

const getLeaderboard = async (db) => {
  return db.all(`
    SELECT u.username, MAX(g.score) AS best_score, COUNT(g.id) AS games_played
    FROM games g
    JOIN users u ON u.id = g.user_id
    WHERE g.route_valid = 1
    GROUP BY g.user_id
    ORDER BY best_score DESC
  `);
};

export { getRandomStartAndDestination, getRandomEvent, saveGame, getLeaderboard };
