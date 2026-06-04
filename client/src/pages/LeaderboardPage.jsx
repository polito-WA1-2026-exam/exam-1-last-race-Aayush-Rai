import { useState, useEffect } from 'react';
import { getLeaderboard } from '../api/api';

const MEDALS = ['🥇','🥈','🥉'];
const RANK_COLORS = ['var(--accent)','#c0c0c0','#cd7f32'];

const LeaderboardPage = () => {
  const [board, setBoard]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    getLeaderboard()
      .then(setBoard)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'flex-end', marginBottom:'3rem', gap:'2rem' }}>
        <div>
          <p className="tag-label" style={{ marginBottom:'0.6rem' }}>Global rankings</p>
          <h1>Leaderboard</h1>
          <p style={{ marginTop:'0.5rem', maxWidth:480 }}>Best scores from all valid completed runs. Can you top the board?</p>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'3rem', color:'var(--accent)', lineHeight:1 }}>{board.length}</div>
          <p style={{ fontSize:'0.8rem', margin:0 }}>players ranked</p>
        </div>
      </div>

      {loading && <p className="pulse" style={{ color:'var(--text-muted)' }}>Loading rankings…</p>}
      {error   && <div className="alert alert-danger">{error}</div>}

      {!loading && !error && board.length === 0 && (
        <div className="card" style={{ textAlign:'center', padding:'4rem' }}>
          <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>🏁</div>
          <h3>No scores yet</h3>
          <p style={{ marginTop:'0.5rem' }}>Be the first to finish a valid game!</p>
        </div>
      )}

      {!loading && !error && board.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
          {board.map((row, i) => (
            <div key={row.username} style={{
              display:'grid', gridTemplateColumns:'3rem 1fr auto auto',
              alignItems:'center', gap:'1.5rem',
              padding:'1.25rem 1.5rem',
              background: i===0 ? 'linear-gradient(135deg,rgba(200,255,0,0.08),rgba(200,255,0,0.02))' : 'var(--bg-card)',
              border: `1px solid ${i===0 ? 'rgba(200,255,0,0.25)' : 'var(--border-light)'}`,
              borderRadius:'var(--r-md)',
            }}>
              <div style={{ fontFamily:'var(--font-display)', fontWeight:800, fontSize:i<3?'1.5rem':'1rem', color:RANK_COLORS[i]??'var(--text-muted)', textAlign:'center' }}>
                {MEDALS[i] ?? i+1}
              </div>
              <div>
                <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', color:i===0?'var(--accent)':'var(--text-primary)' }}>{row.username}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.1rem' }}>{row.games_played} game{row.games_played!==1?'s':''} played</div>
              </div>
              <div style={{ width:120 }}>
                <div className="timer-track">
                  <div className="timer-fill" style={{ width:`${(row.best_score/28)*100}%`, backgroundColor:RANK_COLORS[i]??'var(--border-bright)' }} />
                </div>
              </div>
              <span className="coin-badge" style={{ fontSize:'0.95rem' }}>🪙 {row.best_score}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;