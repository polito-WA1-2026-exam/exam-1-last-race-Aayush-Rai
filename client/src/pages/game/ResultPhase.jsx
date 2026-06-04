import { Link } from 'react-router-dom';

const getMessage = (score, valid) => {
  if (!valid)      return { emoji:'💸', text:'Route invalid',       color:'var(--danger)'   };
  if (score >= 24) return { emoji:'🏆', text:'Outstanding!',        color:'var(--accent)'   };
  if (score >= 18) return { emoji:'🎉', text:'Great journey!',      color:'var(--success)'  };
  if (score >= 10) return { emoji:'👍', text:'Solid effort.',       color:'var(--line-blue)' };
  if (score > 0)   return { emoji:'😅', text:'Rough ride.',         color:'var(--warning)'  };
  return               { emoji:'💸', text:'Better luck next time.', color:'var(--danger)'   };
};

const ResultPhase = ({ result, onPlayAgain }) => {
  if (!result) return null;
  const { finalScore, valid, steps } = result;
  const { emoji, text, color } = getMessage(finalScore, valid);

  return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:'3rem', paddingBottom:'3rem' }}>
      <p className="tag-label" style={{ marginBottom:'2rem' }}>Phase 4 of 4 — Result</p>

      <div style={{ width:'100%', maxWidth:480, background:'var(--bg-card)', border:`1px solid ${color}33`, borderRadius:'var(--r-xl)', padding:'3rem 2.5rem', textAlign:'center', boxShadow:`0 0 60px ${color}15`, display:'flex', flexDirection:'column', alignItems:'center' }}>
        <div style={{ fontSize:'5rem', lineHeight:1, marginBottom:'1rem', filter:`drop-shadow(0 0 20px ${color}66)` }}>{emoji}</div>
        <h2 style={{ color, marginBottom:'0.25rem' }}>{text}</h2>
        <p style={{ fontSize:'0.9rem', marginBottom:'2.5rem' }}>
          {valid ? `You completed ${steps?.length ?? 0} segment${steps?.length!==1?'s':''}.` : 'Invalid route — all coins lost.'}
        </p>

        <div style={{ width:'100%', background:'var(--bg-dark)', border:`1px solid ${color}33`, borderRadius:'var(--r-md)', padding:'2rem', marginBottom:'2rem' }}>
          <p style={{ fontSize:'0.68rem', letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'var(--font-display)', color:'var(--text-muted)', marginBottom:'0.75rem' }}>Final score</p>
          <span className="coin-badge" style={{ fontSize:'2.8rem', padding:'0.6rem 2rem', borderColor:`${color}55`, boxShadow:`0 0 24px ${color}22` }}>
            🪙 {finalScore}
          </span>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem', width:'100%', marginBottom:'2rem' }}>
          <div style={{ background:'var(--bg-raised)', borderRadius:'var(--r-sm)', padding:'0.85rem', border:'1px solid var(--border)' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.4rem', color:'var(--text-primary)' }}>{steps?.length ?? 0}</div>
            <p style={{ fontSize:'0.78rem', margin:0 }}>segments completed</p>
          </div>
          <div style={{ background:'var(--bg-raised)', borderRadius:'var(--r-sm)', padding:'0.85rem', border:'1px solid var(--border)' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.4rem', color:valid?'var(--success)':'var(--danger)' }}>{valid?'✓':'✗'}</div>
            <p style={{ fontSize:'0.78rem', margin:0 }}>{valid?'valid route':'invalid route'}</p>
          </div>
        </div>

        <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap', justifyContent:'center' }}>
          <button className="btn btn-primary btn-lg" onClick={onPlayAgain}>Play again →</button>
          <Link to="/leaderboard" className="btn btn-secondary btn-lg">View rankings</Link>
        </div>
      </div>
    </div>
  );
};

export default ResultPhase;