import { useState, useCallback } from 'react';
import NetworkMap   from '../../components/NetworkMap';
import useCountdown from '../../hooks/useCountdown';

const PlanningPhase = ({ network, gameCtx, onSubmit, submitting }) => {
  const [route, setRoute]               = useState([]);
  const [usedSegments, setUsedSegments] = useState(new Set());

  const { startStation, endStation } = gameCtx;

  const handleExpire = useCallback(() => onSubmit(route), [route, onSubmit]);
  const { formatted, isExpired, pct } = useCountdown(90, handleExpire);
  const timerColor = pct > 50 ? 'var(--success)' : pct > 20 ? 'var(--warning)' : 'var(--danger)';

  // Deduplicated segment list (each undirected pair shown once)
  const segments = [];
  const seen = new Set();
  for (const s of (network.planningSegments ?? network.segments)) {
    const key = [s.from_station_id, s.to_station_id].sort().join('-');
    if (!seen.has(key)) { seen.add(key); segments.push(s); }
  }

  const stationName = id => network.stations.find(s => s.id === id)?.name ?? id;
  const last = route[route.length - 1];

  const segKey = (seg) => [seg.from_station_id, seg.to_station_id].sort().join('-');

  const canUse = (seg) => {
    if (usedSegments.has(segKey(seg))) return false;
    if (route.length === 0)
      return seg.from_station_id === startStation.id || seg.to_station_id === startStation.id;
    return seg.from_station_id === last || seg.to_station_id === last;
  };

  const handleSegClick = (seg) => {
    if (isExpired || submitting || !canUse(seg)) return;
    const key = segKey(seg);
    if (route.length === 0) {
      const next = seg.from_station_id === startStation.id ? seg.to_station_id : seg.from_station_id;
      setRoute([startStation.id, next]);
      setUsedSegments(prev => new Set([...prev, key]));
    } else {
      const next = seg.from_station_id === last ? seg.to_station_id : seg.from_station_id;
      setRoute(prev => [...prev, next]);
      setUsedSegments(prev => new Set([...prev, key]));
    }
  };

  const handleUndo = () => {
    if (route.length === 0) return;
    if (route.length === 1) {
      setRoute([]);
      setUsedSegments(new Set());
      return;
    }
    const from = route[route.length - 2];
    const to   = route[route.length - 1];
    const key  = [from, to].sort().join('-');
    setRoute(r => r.slice(0, -1));
    setUsedSegments(prev => { const n = new Set(prev); n.delete(key); return n; });
  };

  const routeReachesEnd = route[route.length - 1] === endStation.id;

  return (
    <div className="fade-up">

      {/* ── Mission banner ── */}
      <div style={{ background:'linear-gradient(135deg,rgba(200,255,0,0.07),rgba(200,255,0,0.02))', border:'1px solid rgba(200,255,0,0.2)', borderRadius:'var(--r-md)', padding:'1rem 1.5rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <p style={{ fontSize:'0.68rem', letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'var(--font-display)', color:'var(--accent)', marginBottom:'0.3rem' }}>
            Your mission
          </p>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', flexWrap:'wrap' }}>
            {/* Start */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <span style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontFamily:'var(--font-display)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'2px' }}>From</span>
              <span style={{ background:'var(--bg-raised)', border:'1px solid var(--border-bright)', borderRadius:'var(--r-sm)', padding:'0.3rem 0.9rem', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', color:'var(--text-primary)' }}>
                🚉 {startStation.name}
              </span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'2px' }}>
              <span style={{ fontSize:'1.5rem', color:'var(--accent)' }}>→</span>
            </div>
            {/* Destination */}
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
              <span style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontFamily:'var(--font-display)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'2px' }}>To</span>
              <span style={{ background:'rgba(200,255,0,0.1)', border:'1px solid rgba(200,255,0,0.4)', borderRadius:'var(--r-sm)', padding:'0.3rem 0.9rem', fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1rem', color:'var(--accent)' }}>
                🏁 {endStation.name}
              </span>
            </div>
          </div>
        </div>
        <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', maxWidth:280, lineHeight:1.5 }}>
          Build a valid metro route between these stations by selecting connected segments from the list below.
        </div>
      </div>

      {/* ── Header row: phase label + timer ── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <p className="tag-label" style={{ marginBottom:'0.2rem' }}>Phase 2 of 4 — Planning</p>
          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>
            Line colours are hidden. Use the segment list to reconstruct the network.
          </p>
        </div>

        {/* Countdown */}
        <div style={{ textAlign:'center', padding:'0.75rem 1.25rem', background:'var(--bg-card)', border:`1px solid ${timerColor}44`, borderRadius:'var(--r-md)', minWidth:120 }}>
          <div style={{ fontSize:'0.65rem', letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'var(--font-display)', color:'var(--text-muted)', marginBottom:'0.3rem' }}>
            Time left
          </div>
          <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'2.4rem', color:timerColor, lineHeight:1, transition:'color 0.5s', textShadow:`0 0 16px ${timerColor}55` }}>
            {formatted}
          </div>
          <div className="timer-track" style={{ marginTop:'0.5rem' }}>
            <div className="timer-fill" style={{ width:`${pct}%`, backgroundColor:timerColor }} />
          </div>
        </div>
      </div>

      {/* ── Main layout: map + sidebar ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 330px', gap:'1.25rem', alignItems:'start' }}>

        {/* Map — NO lines, only station dots and names */}
        <div style={{ border:'1px solid var(--border-bright)', borderRadius:'var(--r-lg)', overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.4)' }}>
          <NetworkMap network={network} showLines={false} />
        </div>

        {/* Sidebar */}
        <div style={{ display:'flex', flexDirection:'column', gap:'0.85rem' }}>

          {/* Route builder */}
          <div className="card-raised">
            <p style={{ fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-display)', marginBottom:'0.6rem' }}>
              Route so far
            </p>

            {route.length === 0 ? (
              <div style={{ padding:'0.4rem 0' }}>
                <p style={{ fontSize:'0.84rem', color:'var(--text-muted)', marginBottom:'0.5rem' }}>
                  Click a <span style={{ color:'var(--accent)', fontWeight:600 }}>highlighted segment</span> below that includes{' '}
                  <strong style={{ color:'var(--text-primary)' }}>{startStation.name}</strong>
                </p>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', background:'var(--bg-dark)', padding:'0.5rem 0.75rem', borderRadius:'var(--r-sm)', lineHeight:1.6, border:'1px solid var(--border)' }}>
                  💡 Only segments connected to your last stop are highlighted in green
                </div>
              </div>
            ) : (
              /* Horizontal scrolling route display */
              <div style={{ overflowX:'auto', paddingBottom:'0.25rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0', minWidth:'max-content', padding:'0.25rem 0' }}>
                  {route.map((id, i) => (
                    <div key={i} style={{ display:'flex', alignItems:'center' }}>
                      {/* Station chip */}
                      <div style={{
                        padding:'0.3rem 0.65rem',
                        borderRadius:'var(--r-sm)',
                        fontSize:'0.78rem',
                        fontFamily:'var(--font-display)',
                        fontWeight: (id===startStation.id||id===endStation.id) ? 700 : 500,
                        background: id===endStation.id   ? 'rgba(200,255,0,0.15)'
                                  : id===startStation.id ? 'rgba(255,255,255,0.08)'
                                  : 'var(--bg-dark)',
                        border: id===endStation.id   ? '1px solid rgba(200,255,0,0.4)'
                               : id===startStation.id ? '1px solid var(--border-bright)'
                               : '1px solid var(--border)',
                        color: id===endStation.id   ? 'var(--accent)'
                             : id===startStation.id ? 'var(--text-primary)'
                             : 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                      }}>
                        {id===startStation.id && '🚉 '}
                        {id===endStation.id   && '🏁 '}
                        {stationName(id)}
                      </div>
                      {/* Arrow between stations */}
                      {i < route.length - 1 && (
                        <div style={{ padding:'0 4px', color:'var(--accent)', fontSize:'0.75rem', flexShrink:0 }}>→</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Destination reached */}
            {routeReachesEnd && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginTop:'0.6rem', padding:'0.4rem 0.75rem', background:'rgba(200,255,0,0.08)', border:'1px solid rgba(200,255,0,0.3)', borderRadius:'var(--r-sm)', fontSize:'0.8rem', color:'var(--accent)' }}>
                ✓ Route reaches <strong>{endStation.name}</strong>!
              </div>
            )}

            {/* Undo + Submit */}
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.75rem' }}>
              <button className="btn btn-ghost btn-sm" onClick={handleUndo} disabled={route.length===0||isExpired}>
                ↩ Undo
              </button>
              <button className="btn btn-primary btn-sm" style={{ flex:1 }} onClick={() => onSubmit(route)} disabled={submitting||route.length<2||isExpired}>
                {submitting ? 'Submitting…' : 'Submit route'}
              </button>
            </div>
          </div>

          {/* Segment list */}
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'0.5rem' }}>
              <p style={{ fontSize:'0.68rem', letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-muted)', fontFamily:'var(--font-display)', margin:0 }}>
                All connections ({segments.length})
              </p>
              <p style={{ fontSize:'0.68rem', color:'var(--accent)', fontFamily:'var(--font-display)', margin:0 }}>
                green = clickable
              </p>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.3rem', maxHeight:360, overflowY:'auto', paddingRight:2 }}>
              {segments.map((seg, i) => {
                const used      = usedSegments.has(segKey(seg));
                const available = canUse(seg);
                return (
                  <div
                    key={i}
                    onClick={() => handleSegClick(seg)}
                    style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'0.5rem 0.75rem',
                      borderRadius:'var(--r-sm)',
                      fontSize:'0.83rem',
                      transition:'all 0.12s',
                      userSelect:'none',
                      cursor: available ? 'pointer' : 'default',
                      background: available ? 'rgba(200,255,0,0.07)' : used ? 'transparent' : 'var(--bg-card)',
                      border: available ? '1px solid rgba(200,255,0,0.45)'
                            : used     ? '1px solid rgba(255,255,255,0.04)'
                            : '1px solid var(--border)',
                      opacity: used ? 0.35 : 1,
                      boxShadow: available ? '0 0 10px rgba(200,255,0,0.08)' : 'none',
                    }}>
                    <span style={{ color: available ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: available ? 600 : 400, textDecoration: used ? 'line-through' : 'none', flex:1 }}>
                      {seg.from_station_name}
                    </span>
                    <span style={{ color: available ? 'var(--accent)' : 'var(--border-bright)', fontSize:'0.65rem', flexShrink:0, margin:'0 6px' }}>
                      {available ? '●—●' : '—'}
                    </span>
                    <span style={{ color: available ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: available ? 600 : 400, textDecoration: used ? 'line-through' : 'none', flex:1, textAlign:'right' }}>
                      {seg.to_station_name}
                    </span>
                    {used      && <span style={{ marginLeft:6, color:'var(--success)', fontSize:'0.7rem', flexShrink:0 }}>✓</span>}
                    {available && <span style={{ marginLeft:6, color:'var(--accent)', fontSize:'0.65rem', flexShrink:0, fontFamily:'var(--font-display)' }}>tap</span>}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PlanningPhase;