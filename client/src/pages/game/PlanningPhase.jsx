import { useState, useCallback } from 'react';
import NetworkMap   from '../../components/NetworkMap';
import useCountdown from '../../hooks/useCountdown';

const PlanningPhase = ({ network, gameCtx, onSubmit, submitting }) => {
  const [route, setRoute] = useState([]);
  const { startStation, endStation } = gameCtx;

  const handleExpire = useCallback(() => onSubmit(route), [route, onSubmit]);
  const { formatted, isExpired, pct } = useCountdown(90, handleExpire);
  const timerColor = pct > 50 ? 'var(--success)' : pct > 20 ? 'var(--warning)' : 'var(--danger)';

  const segments = [];
  const seen = new Set();
  for (const s of (network.planningSegments ?? network.segments)) {
    const key = [s.from_station_id, s.to_station_id].sort().join('-');
    if (!seen.has(key)) { seen.add(key); segments.push(s); }
  }

  const stationName = id => network.stations.find(s => s.id === id)?.name ?? id;
  const last = route[route.length - 1];

  const canUse = (seg) => {
    if (route.length === 0)
      return seg.from_station_id === startStation.id || seg.to_station_id === startStation.id;
    return seg.from_station_id === last || seg.to_station_id === last;
  };

  const handleSegClick = (seg) => {
    if (isExpired || submitting || !canUse(seg)) return;
    if (route.length === 0) {
      const next = seg.from_station_id === startStation.id ? seg.to_station_id : seg.from_station_id;
      setRoute([startStation.id, next]);
    } else {
      const next = seg.from_station_id === last ? seg.to_station_id : seg.from_station_id;
      setRoute(prev => [...prev, next]);
    }
  };

  const routeReachesEnd = route[route.length - 1] === endStation.id;

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <p className="tag-label" style={{ marginBottom:'0.35rem' }}>Phase 2 of 4 — Planning</p>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            <h2 style={{ margin:0 }}>{startStation.name}</h2>
            <span style={{ fontSize:'1.5rem', color:'var(--accent)' }}>→</span>
            <h2 style={{ margin:0, color:'var(--accent)' }}>{endStation.name}</h2>
          </div>
          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:'0.3rem' }}>
            Select segments to build your route. Line colours are hidden.
          </p>
        </div>

        {/* Timer */}
        <div style={{ textAlign:'center', padding:'1rem 1.5rem', background:'var(--bg-card)', border:`1px solid ${timerColor}44`, borderRadius:'var(--r-md)', minWidth:130 }}>
          <div style={{ fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'var(--font-display)', color:'var(--text-muted)', marginBottom:'0.35rem' }}>Time left</div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'2.8rem', color:timerColor, lineHeight:1, transition:'color 0.5s', textShadow:`0 0 20px ${timerColor}66` }}>
            {formatted}
          </div>
          <div className="timer-track" style={{ marginTop:'0.6rem' }}>
            <div className="timer-fill" style={{ width:`${pct}%`, backgroundColor:timerColor }} />
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:'1.25rem', alignItems:'start' }}>
        <div style={{ border:'1px solid var(--border-bright)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>
          <NetworkMap network={network} showLines={false} />
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>
          {/* Route builder */}
          <div className="card-raised">
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-display)', marginBottom:'0.7rem' }}>Your route</p>

            {route.length === 0 ? (
              <p style={{ fontSize:'0.84rem', color:'var(--text-muted)', padding:'0.5rem 0' }}>
                Click a segment starting from <strong style={{ color:'var(--accent)' }}>{startStation.name}</strong>
              </p>
            ) : (
              <div style={{ fontSize:'0.82rem', lineHeight:2, maxHeight:160, overflowY:'auto' }}>
                {route.map((id, i) => (
                  <span key={i}>
                    {i > 0 && <span style={{ color:'var(--text-muted)', margin:'0 4px', fontSize:'0.75rem' }}>→</span>}
                    <span style={{
                      padding:'0.1rem 0.5rem', borderRadius:4,
                      background: id===endStation.id ? 'rgba(200,255,0,0.12)' : id===startStation.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                      color: id===endStation.id ? 'var(--accent)' : id===startStation.id ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontWeight: (id===startStation.id||id===endStation.id) ? 700 : 400,
                    }}>
                      {stationName(id)}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {routeReachesEnd && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.5rem', padding:'0.4rem 0.6rem', background:'rgba(200,255,0,0.08)', border:'1px solid rgba(200,255,0,0.25)', borderRadius:'var(--r-sm)', fontSize:'0.8rem', color:'var(--accent)' }}>
                ✓ Route reaches destination!
              </div>
            )}

            <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.85rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => setRoute(r => r.slice(0,-1))} disabled={route.length===0||isExpired}>↩ Undo</button>
              <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={() => onSubmit(route)} disabled={submitting||route.length<2||isExpired}>
                {submitting ? 'Submitting…' : 'Submit route'}
              </button>
            </div>
          </div>

          {/* Segment list */}
          <div>
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-display)', marginBottom:'0.5rem' }}>
              All connections ({segments.length})
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.35rem', maxHeight:380, overflowY:'auto', paddingRight:2 }}>
              {segments.map((seg, i) => (
                <div key={i} className={`seg-item ${canUse(seg) ? 'available' : 'disabled'}`} onClick={() => handleSegClick(seg)}>
                  <span style={{ color:'var(--text-secondary)' }}>{seg.from_station_name}</span>
                  <span style={{ color:'var(--border-bright)', fontSize:'0.7rem', flexShrink:0, margin:'0 4px' }}>——</span>
                  <span style={{ color:'var(--text-secondary)', textAlign:'right' }}>{seg.to_station_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanningPhase;