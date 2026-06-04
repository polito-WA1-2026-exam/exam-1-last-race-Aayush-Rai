import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'lastrace.sqlite');

// Opens the database and runs schema + seed on first start.
// Returns a promise that resolves to the db connection.
const initDb = async () => {
  const db = await open({ filename: DB_PATH, driver: sqlite3.Database });

  await db.exec('PRAGMA foreign_keys = ON');
  await db.exec('PRAGMA journal_mode = WAL');

  // -------------------------------------------------------------------------
  // Schema
  // -------------------------------------------------------------------------

  await db.exec(`
    CREATE TABLE IF NOT EXISTS lines (
      id    INTEGER PRIMARY KEY AUTOINCREMENT,
      name  TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS stations (
      id   INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE IF NOT EXISTS line_stations (
      line_id    INTEGER NOT NULL REFERENCES lines(id),
      station_id INTEGER NOT NULL REFERENCES stations(id),
      position   INTEGER NOT NULL,
      PRIMARY KEY (line_id, station_id)
    );

    CREATE TABLE IF NOT EXISTS events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      description TEXT    NOT NULL,
      effect      INTEGER NOT NULL CHECK(effect BETWEEN -4 AND 4)
    );

    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      username      TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      salt          TEXT    NOT NULL
    );

    CREATE TABLE IF NOT EXISTS games (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id       INTEGER NOT NULL REFERENCES users(id),
      start_station INTEGER NOT NULL REFERENCES stations(id),
      end_station   INTEGER NOT NULL REFERENCES stations(id),
      score         INTEGER NOT NULL DEFAULT 0,
      route_valid   INTEGER NOT NULL DEFAULT 0,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // -------------------------------------------------------------------------
  // Seed — only runs when tables are empty
  // -------------------------------------------------------------------------

  const { n } = await db.get('SELECT COUNT(*) AS n FROM lines');
  if (n > 0) return db; // already seeded

  // Network:
  //  RED:    Centrale — Roma Est — Ponte Lungo — Colosseo — Testaccio
  //  BLUE:   Centrale — Trastevere — Garbatella — EUR Palasport — Laurentina
  //  GREEN:  Ponte Lungo — Trastevere — Ostiense — Magliana — Acilia
  //  YELLOW: Colosseo — Ostiense — EUR Palasport — Spinaceto — Laurentina
  //
  //  Interchange stations (served by 2+ lines):
  //  Centrale, Ponte Lungo, Trastevere, Colosseo, Ostiense, EUR Palasport, Laurentina

  const insertLine = await db.prepare('INSERT INTO lines (name, color) VALUES (?, ?)');
  const red    = (await insertLine.run('Red Line',    '#E63946')).lastID;
  const blue   = (await insertLine.run('Blue Line',   '#457B9D')).lastID;
  const green  = (await insertLine.run('Green Line',  '#2A9D8F')).lastID;
  const yellow = (await insertLine.run('Yellow Line', '#E9C46A')).lastID;
  await insertLine.finalize();

  const S = {};
  const insertStation = await db.prepare('INSERT INTO stations (name) VALUES (?)');
  for (const name of [
    'Centrale', 'Roma Est', 'Ponte Lungo', 'Colosseo', 'Testaccio',
    'Trastevere', 'Garbatella', 'EUR Palasport', 'Laurentina',
    'Ostiense', 'Magliana', 'Acilia', 'Spinaceto'
  ]) {
    S[name] = (await insertStation.run(name)).lastID;
  }
  await insertStation.finalize();

  const insertStop = await db.prepare(
    'INSERT INTO line_stations (line_id, station_id, position) VALUES (?, ?, ?)'
  );
  const seedLine = async (lineId, names) => {
    for (let i = 0; i < names.length; i++) {
      await insertStop.run(lineId, S[names[i]], i + 1);
    }
  };
  await seedLine(red,    ['Centrale', 'Roma Est', 'Ponte Lungo', 'Colosseo', 'Testaccio']);
  await seedLine(blue,   ['Centrale', 'Trastevere', 'Garbatella', 'EUR Palasport', 'Laurentina']);
  await seedLine(green,  ['Ponte Lungo', 'Trastevere', 'Ostiense', 'Magliana', 'Acilia']);
  await seedLine(yellow, ['Colosseo', 'Ostiense', 'EUR Palasport', 'Spinaceto', 'Laurentina']);
  await insertStop.finalize();

  const insertEvent = await db.prepare('INSERT INTO events (description, effect) VALUES (?, ?)');
  for (const [desc, effect] of [
    ['Smooth ride, no surprises.',                0],
    ['You find a seat immediately. Lucky!',       1],
    ['Kind passenger offers directions.',         1],
    ['Busker plays your favourite song.',         2],
    ['Train arrives early — you relax.',          2],
    ['You board the wrong carriage, scramble.',  -1],
    ['Doors close on your bag. Embarrassing.',   -1],
    ['Signal delay — you wait on the platform.', -2],
    ['You board the wrong platform entirely.',   -3],
    ['Emergency stop — total chaos.',            -4],
  ]) {
    await insertEvent.run(desc, effect);
  }
  await insertEvent.finalize();

  // Users — passwords hashed with scrypt (same algorithm used at login)
  const hashPassword = (plain) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(plain, salt, 32).toString('hex');
    return { hash, salt };
  };

  const insertUser = await db.prepare(
    'INSERT INTO users (username, password_hash, salt) VALUES (?, ?, ?)'
  );
  const alice = hashPassword('alice123');
  const bob   = hashPassword('bob456');
  const carol = hashPassword('carol789');

  const aliceId = (await insertUser.run('alice', alice.hash, alice.salt)).lastID;
  const bobId   = (await insertUser.run('bob',   bob.hash,   bob.salt)).lastID;
  await insertUser.run('carol', carol.hash, carol.salt);
  await insertUser.finalize();

  // Pre-populate some completed games for alice and bob (required by spec)
  const insertGame = await db.prepare(
    'INSERT INTO games (user_id, start_station, end_station, score, route_valid) VALUES (?, ?, ?, ?, 1)'
  );
  await insertGame.run(aliceId, S['Centrale'],   S['Acilia'],      18);
  await insertGame.run(aliceId, S['Roma Est'],   S['Laurentina'],  24);
  await insertGame.run(aliceId, S['Testaccio'],  S['Acilia'],       9);
  await insertGame.run(bobId,   S['Centrale'],   S['Spinaceto'],   15);
  await insertGame.run(bobId,   S['Garbatella'], S['Testaccio'],   22);
  await insertGame.finalize();

  console.log('Database seeded successfully.');
  return db;
};

export default initDb;
