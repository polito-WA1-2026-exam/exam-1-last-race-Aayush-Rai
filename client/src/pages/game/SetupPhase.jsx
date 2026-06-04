import NetworkMap from '../../components/NetworkMap';

const SetupPhase = ({ network, onReady }) => {
  if (!network) return null;
  return (
    <div className="fade-up">
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'flex-start', marginBottom:'1.75rem', gap:'2rem' }}>
        <div>
          <p className="tag-label" style={{ marginBottom:'0.5rem' }}>Phase 1 of 4 — Setup</p>
          <h2 style={{ marginBottom:'0.5rem' }}>Study the network</h2>
          <p style={{ maxWidth:560, fontSize:'0.95rem' }}>
            Memorise the lines, station names, and interchange points (gold dots).
            The line colours disappear when you start — you'll need to recall the layout from memory.
          </p>
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem', paddingTop:'0.25rem' }}>
          {network.lines.map(l => (
            <span key={l.id} className="line-pill" style={{ background:l.color, boxShadow:`0 0 12px ${l.color}55` }}>
              ● {l.name}
            </span>
          ))}
        </div>
      </div>

      <div style={{ border:'1px solid var(--border-bright)', borderRadius:'var(--r-lg)', overflow:'hidden', marginBottom:'2rem', boxShadow:'0 8px 40px rgba(0,0,0,0.5)' }}>
        <NetworkMap network={network} showLines={true} />
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'2rem', marginBottom:'2rem', padding:'1rem 1.5rem', background:'var(--bg-card)', borderRadius:'var(--r-sm)', border:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <div style={{ width:14, height:14, borderRadius:'50%', background:'#080b14', border:'2.5px solid #c8ff00', boxShadow:'0 0 8px rgba(200,255,0,0.5)', flexShrink:0 }} />
          <span style={{ fontSize:'0.83rem', color:'var(--text-secondary)' }}>Interchange station (served by 2+ lines)</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
          <div style={{ width:9, height:9, borderRadius:'50%', background:'#1a2035', border:'1.5px solid rgba(255,255,255,0.35)', flexShrink:0 }} />
          <span style={{ fontSize:'0.83rem', color:'var(--text-secondary)' }}>Regular station</span>
        </div>
      </div>

      <div style={{ textAlign:'center' }}>
        <button className="btn btn-primary btn-lg" onClick={onReady}>
          I'm ready — start the clock →
        </button>
        <p style={{ marginTop:'0.75rem', fontSize:'0.78rem', color:'var(--text-muted)' }}>
          The 90-second timer begins the moment you click this button.
        </p>
      </div>
    </div>
  );
};

export default SetupPhase;