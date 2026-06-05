import express       from 'express';
import cors          from 'cors';
import session       from 'express-session';
import passport      from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import crypto        from 'crypto';

import initDb              from './db.js';
import { getUserByUsername, getUserById } from './dao/userDao.js';
import { getNetwork, getInterchangeIds } from './dao/networkDao.js';
import { getRandomStartAndDestination, getRandomEvent, saveGame, getLeaderboard } from './dao/gameDao.js';
import { validateRoute }   from './routes/validator.js';

const app  = express();
const PORT = 3001;

// ---------------------------------------------------------------------------
// Boot — initialise DB then start the server
// ---------------------------------------------------------------------------

const db = await initDb();

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(session({
  secret: 'lastrace-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' },
}));
app.use(passport.initialize());
app.use(passport.session());

// ---------------------------------------------------------------------------
// Passport — LocalStrategy with scrypt password verification
// ---------------------------------------------------------------------------

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await getUserByUsername(db, username);
    if (!user) return done(null, false, { message: 'Incorrect username or password.' });

    const candidateHash = crypto.scryptSync(password, user.salt, 32).toString('hex');
    const match = crypto.timingSafeEqual(
      Buffer.from(candidateHash, 'hex'),
      Buffer.from(user.password_hash, 'hex')
    );
    if (!match) return done(null, false, { message: 'Incorrect username or password.' });

    return done(null, user);
  } catch (err) {
    return done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await getUserById(db, id);
    done(user ? null : new Error('User not found'), user || null);
  } catch (err) {
    done(err);
  }
});

// Reusable auth guard middleware
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).json({ error: 'You must be logged in.' });
};

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------

// POST /api/session — login
app.post('/api/session', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err)   return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials.' });
    req.login(user, (loginErr) => {
      if (loginErr) return next(loginErr);
      res.status(200).json({ id: user.id, username: user.username });
    });
  })(req, res, next);
});

// DELETE /api/session — logout
app.delete('/api/session', (req, res) => {
  req.logout(() => res.status(204).end());
});

// GET /api/session/current — get logged-in user
app.get('/api/session/current', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Not authenticated.' });
  res.json({ id: req.user.id, username: req.user.username });
});

// ---------------------------------------------------------------------------
// Network routes
// ---------------------------------------------------------------------------

// GET /api/network — full metro map (protected)
app.get('/api/network', isLoggedIn, async (req, res) => {
  try {
    const network = await getNetwork(db);
    res.json(network);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---------------------------------------------------------------------------
// Game routes
// ---------------------------------------------------------------------------

// POST /api/game/start — pick random start/destination, return network
app.post('/api/game/start', isLoggedIn, async (req, res) => {
  try {
    const { startStation, endStation } = await getRandomStartAndDestination(db);
    const network = await getNetwork(db);

    // Strip line info from segments for the planning phase
    const planningSegments = network.segments.map(s => ({
      from_station_id:   s.from_station_id,
      from_station_name: s.from_station_name,
      to_station_id:     s.to_station_id,
      to_station_name:   s.to_station_name,
    }));

    res.json({
      gameContext: { startStation, endStation },
      network:     { ...network, planningSegments },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/game/execute — validate route and simulate journey
app.post('/api/game/execute', isLoggedIn, async (req, res) => {
  try {
    const { route, startId, endId } = req.body;

    if (!Array.isArray(route) || typeof startId !== 'number' || typeof endId !== 'number')
      return res.status(400).json({ error: 'Invalid request body.' });

    const network        = await getNetwork(db);
    const interchangeIds = await getInterchangeIds(db);
    const { valid, reason } = validateRoute(route, startId, endId, network.segments, interchangeIds);

    if (!valid) {
      await saveGame(db, req.user.id, startId, endId, 0, false);
      return res.json({ valid: false, reason, steps: [], finalScore: 0 });
    }

    // Simulate journey — apply a random event to each segment
    let coins = 20;
    const steps = [];
    for (let i = 0; i < route.length - 1; i++) {
      const event = await getRandomEvent(db);
      coins += event.effect;
      steps.push({
        from:       route[i],
        to:         route[i + 1],
        event:      { description: event.description, effect: event.effect },
        coinsAfter: coins,
      });
    }

    const finalScore = Math.max(0, coins);
    await saveGame(db, req.user.id, startId, endId, finalScore, true);

    res.json({ valid: true, steps, finalScore });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/game/leaderboard — public
app.get('/api/game/leaderboard', async (req, res) => {
  try {
    const board = await getLeaderboard(db);
    res.json(board);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic error handler
app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(PORT, () => {
  console.log(`Last Race server running on http://localhost:${PORT}`);
});
