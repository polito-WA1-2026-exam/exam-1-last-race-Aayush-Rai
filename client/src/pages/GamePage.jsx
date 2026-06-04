import { useState, useEffect } from 'react';
import { startGame, executeGame } from '../api/api';
import SetupPhase     from './game/SetupPhase';
import PlanningPhase  from './game/PlanningPhase';
import ExecutionPhase from './game/ExecutionPhase';
import ResultPhase    from './game/ResultPhase';

// GamePage manages the 4-phase game flow as a simple state machine.
// All API calls happen here; child phases receive only props they need.
const PHASES = { SETUP:'setup', PLANNING:'planning', EXECUTION:'execution', RESULT:'result' };

const GamePage = () => {
  const [phase, setPhase]         = useState(PHASES.SETUP);
  const [network, setNetwork]     = useState(null);
  const [gameCtx, setGameCtx]     = useState(null);
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => { loadGame(); }, []);

  const loadGame = async () => {
    setLoading(true); setError('');
    try {
      const data = await startGame();
      setNetwork(data.network);
      setGameCtx(data.gameContext);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleRouteSubmit = async (route) => {
    setLoading(true);
    try {
      const res = await executeGame(route, gameCtx.startStation.id, gameCtx.endStation.id);
      setResult(res);
      setPhase(PHASES.EXECUTION);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handlePlayAgain = async () => {
    setResult(null); setPhase(PHASES.SETUP);
    await loadGame();
  };

  if (loading && phase === PHASES.SETUP)
    return <div className="page" style={{color:'var(--text-muted)'}}>Loading game…</div>;

  if (error)
    return (
      <div className="page">
        <div className="alert alert-danger">{error}</div>
        <button className="btn btn-secondary" onClick={loadGame}>Try again</button>
      </div>
    );

  return (
    <div className="page">
      {phase === PHASES.SETUP     && <SetupPhase     network={network} onReady={() => setPhase(PHASES.PLANNING)} />}
      {phase === PHASES.PLANNING  && <PlanningPhase  network={network} gameCtx={gameCtx} onSubmit={handleRouteSubmit} submitting={loading} />}
      {phase === PHASES.EXECUTION && <ExecutionPhase result={result} network={network} onComplete={() => setPhase(PHASES.RESULT)} />}
      {phase === PHASES.RESULT    && <ResultPhase    result={result} onPlayAgain={handlePlayAgain} />}
    </div>
  );
};

export default GamePage;
