import { useState } from 'react';

const ExecutionPhase = ({ result, network, onComplete }) => {
  const [idx, setIdx] = useState(0);
  if (!result) return null;

  const name = id => network.stations.find(s => s.id === id)?.name ?? id;
  const { valid, steps, reason } = result;

  if (!valid) return (
    <div className="fade-up" style={{ display:'flex', flexDirection:'column', alignItems:'center', textAlign:'center', paddingTop:'3rem' }}>
      <p className="tag-label" style={{ marginBottom:'1.5rem' }}>Phase 3 of 4 — Execution</p>
      <div style={{ background:'rgba(255,61,87,0.06)', border:'1px solid rgba(255,61,87,0.22)', borderRadius:'var(--r-xl)', padding:'3rem 2.5rem', maxWidth:460, width:'100%' }}>
        <div style={{ fontSize:'4rem', marginBottom:'1rem' }}>🚫</div>
        <h2 style={{ color:'var(--danger)', marginBottom:'0.6rem' }}>Invalid route</h2>
        <p style={{ marginBottom:'0.4rem', fontSize:'0.95rem' }}>{reason}</p>
        <p style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:'2rem' }}>All 20 coins have been lost.</p>
        <span className="coin-badge" style={{ fontSize:'1.4rem', padding:'0.5rem 1.5rem' }}>🪙 0</span>
        <br/>
        <button className="btn btn-primary" style={{ marginTop:'2rem' }} onClick={onComplete}>See result →</button>
      </div>
    </div>
  );

  const step = steps[idx];
  const isLast = idx === steps.length - 1;
  const eff = step.event.effect;
  const effColor = eff > 0 ? 'var(--success)' : eff < 0 ? 'var(--danger)' : 'var(--text-muted)';
  const effBg    = eff > 0 ? 'rgba(0,229,160,0.08)' : eff < 0 ? 'rgba(255,61,87,0.08)' : 'var(--bg-raised)';

  return (
    <div className="fade-up">
      <div style={{ marginBottom:'1.75rem' }}>
        <p className="tag-label" style={{ marginBottom:'0.4rem' }}>Phase 3 of 4 — Execution</p>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', flexWrap:'wrap', gap:'1rem' }}>
          <h2>Journey in progress</h2>
          <span style={{ fontFamily:'var(--font-display)', fontSize:'0.85rem', color:'var(--text-muted)' }}>Stop {idx+1} / {steps.length}</span>
        </div>
      </div>

      <div className="timer-track" style={{ marginBottom:'2.5rem', height:8 }}>
        <div className="timer-fill" style={{ width:`${((idx+1)/steps.length)*100}%`, backgroundColor:'var(--accent)', transition:'width 0.5s ease' }} />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', maxWidth:800 }}>
        {/* Left: segment + event */}
        <div className="card-raised fade-up" key={idx}>
          <div style={{ marginBottom:'1.5rem' }}>
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-display)', marginBottom:'0.75rem' }}>Travelling</p>
            <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
              <div style={{ padding:'0.5rem 1rem', background:'var(--bg-dark)', border:'1px solid var(--border-bright)', borderRadius:'var(--r-sm)', fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.95rem' }}>
                {name(step.from)}
              </div>
              <span style={{ color:'var(--accent)', fontSize:'1.3rem' }}>→</span>
              <div style={{ padding:'0.5rem 1rem', background:'var(--bg-dark)', border:'1px solid var(--border-bright)', borderRadius:'var(--r-sm)', fontFamily:'var(--font-display)', fontWeight:600, fontSize:'0.95rem' }}>
                {name(step.to)}
              </div>
            </div>
          </div>

          <div style={{ background:effBg, border:`1px solid ${effColor}44`, borderRadius:'var(--r-sm)', padding:'1.25rem' }}>
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-display)', marginBottom:'0.5rem' }}>Event</p>
            <p style={{ color:'var(--text-primary)', fontSize:'1rem', marginBottom:'0.75rem' }}>{step.event.description}</p>
            <span style={{ display:'inline-block', padding:'0.22rem 0.8rem', border:`1px solid ${effColor}`, borderRadius:'999px', color:effColor, fontFamily:'var(--font-display)', fontWeight:700, fontSize:'0.88rem', background:`${effColor}15` }}>
              {eff > 0 ? '+' : ''}{eff} coins
            </span>
          </div>
        </div>

        {/* Right: balance + next */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div className="card-glow" style={{ textAlign:'center', padding:'2rem' }}>
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-display)', marginBottom:'1rem' }}>Current balance</p>
            <span className="coin-badge" style={{ fontSize:'2rem', padding:'0.6rem 1.75rem' }}>🪙 {step.coinsAfter}</span>
            {eff !== 0 && (
              <p style={{ marginTop:'0.75rem', fontSize:'0.82rem', color:effColor }}>
                {eff > 0 ? `↑ +${eff} from previous stop` : `↓ ${eff} from previous stop`}
              </p>
            )}
          </div>

          <div className="card" style={{ textAlign:'center' }}>
            <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:'0.25rem' }}>Stops remaining</p>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.8rem', color:'var(--text-primary)' }}>
              {steps.length - idx - 1}
            </div>
          </div>

          <button className="btn btn-primary btn-block btn-lg" onClick={() => isLast ? onComplete() : setIdx(i => i+1)}>
            {isLast ? 'See final score →' : 'Next stop →'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutionPhase;