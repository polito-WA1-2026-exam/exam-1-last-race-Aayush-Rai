import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RULES = [
  { n:'01', icon:'🗺️', title:'Study the map',   body:'View the full network — all lines, stations and interchange points. Take your time.' },
  { n:'02', icon:'⏱️', title:'Plan your route', body:'90 seconds. Colours gone. Click segments to build your route from start to destination.' },
  { n:'03', icon:'🚇', title:'Execute',          body:'Watch the journey unfold step by step. Random events add or subtract coins at every stop.' },
  { n:'04', icon:'🪙', title:'Score',            body:'Start with 20 coins. Reach your destination with as many as possible. Invalid route = zero.' },
];

const HomePage = () => {
  const { user } = useAuth();
  return (
    <div className="page">

      {/* Hero */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'4rem', alignItems:'center', paddingTop:'2rem', paddingBottom:'4rem' }}>
        <div>
          <p className="tag-label" style={{ marginBottom:'1.2rem' }}>Single-player metro strategy game</p>
          <h1 style={{ marginBottom:'1.5rem' }}>
            Navigate the<br/>
            <span style={{ color:'var(--accent)', textShadow:'0 0 40px rgba(200,255,0,0.3)' }}>underground.</span>
          </h1>
          <p style={{ fontSize:'1.1rem', lineHeight:1.7, marginBottom:'2.5rem', maxWidth:440 }}>
            You get 90 seconds and a map with no lines. Reconstruct the network in your head. Plan fast. One shot.
          </p>
          <div style={{ display:'flex', gap:'1rem', flexWrap:'wrap' }}>
            {user
              ? <Link to="/game"  className="btn btn-primary btn-lg">Start playing →</Link>
              : <Link to="/login" className="btn btn-primary btn-lg">Log in to play →</Link>
            }
            <Link to="/leaderboard" className="btn btn-secondary btn-lg">View rankings</Link>
          </div>
        </div>

        {/* Decorative metro diagram */}
        <div style={{ background:'var(--bg-card)', border:'1px solid var(--border-light)', borderRadius:'var(--r-xl)', overflow:'hidden', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
          <div style={{ position:'relative', height:320 }}>
            {[
              { color:'var(--line-red)',    top:'22%', label:'Red Line'    },
              { color:'var(--line-blue)',   top:'40%', label:'Blue Line'   },
              { color:'var(--line-green)',  top:'58%', label:'Green Line'  },
              { color:'var(--line-yellow)', top:'76%', label:'Yellow Line' },
            ].map(l => (
              <div key={l.label} style={{ position:'absolute', top:l.top, left:'8%', right:'8%', display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ flex:1, height:4, background:l.color, borderRadius:2, boxShadow:`0 0 10px ${l.color}88` }} />
                <span style={{ fontSize:'0.7rem', fontFamily:'var(--font-display)', color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>{l.label}</span>
              </div>
            ))}
            {[[28,'22%'],[48,'22%'],[68,'22%'],[22,'40%'],[42,'40%'],[62,'40%'],[78,'40%'],[35,'58%'],[55,'58%'],[72,'58%'],[30,'76%'],[50,'76%'],[70,'76%']].map(([l,t],i) => (
              <div key={i} style={{ position:'absolute', left:`${l}%`, top:t, transform:'translate(-50%,-50%)', width:i%4===0?14:9, height:i%4===0?14:9, borderRadius:'50%', background:'var(--bg-dark)', border:`2px solid ${i%4===0?'var(--accent)':'rgba(255,255,255,0.3)'}`, boxShadow:i%4===0?'0 0 12px rgba(200,255,0,0.5)':'' }} />
            ))}
            <div style={{ position:'absolute', bottom:16, right:16, fontFamily:'var(--font-display)', fontSize:'0.65rem', letterSpacing:'0.12em', color:'rgba(255,255,255,0.2)', textTransform:'uppercase' }}>
              Metro Network
            </div>
          </div>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'4rem' }}>
        {[{ val:'4', label:'Metro lines' },{ val:'13', label:'Stations' },{ val:'90s', label:'To plan your route' }].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center', padding:'1.5rem' }}>
            <div style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'2rem', color:'var(--accent)', marginBottom:'0.25rem' }}>{s.val}</div>
            <p style={{ fontSize:'0.85rem', margin:0 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* How to play */}
      <div style={{ marginBottom:'3rem' }}>
        <p className="tag-label" style={{ marginBottom:'1.5rem' }}>How to play</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'1rem' }}>
          {RULES.map(r => (
            <div key={r.n} className="card" style={{ position:'relative', overflow:'hidden' }}>
              <div style={{ position:'absolute', top:-8, right:12, fontFamily:'var(--font-display)', fontWeight:800, fontSize:'4rem', color:'rgba(255,255,255,0.03)', lineHeight:1, userSelect:'none' }}>{r.n}</div>
              <div style={{ fontSize:'1.8rem', marginBottom:'0.75rem' }}>{r.icon}</div>
              <h3 style={{ marginBottom:'0.4rem' }}>{r.title}</h3>
              <p style={{ fontSize:'0.87rem' }}>{r.body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA for anon users */}
      {!user && (
        <div style={{ background:'linear-gradient(135deg,rgba(200,255,0,0.06),rgba(200,255,0,0.02))', border:'1px solid rgba(200,255,0,0.15)', borderRadius:'var(--r-lg)', padding:'3rem', textAlign:'center' }}>
          <h2 style={{ marginBottom:'0.75rem' }}>Ready to race?</h2>
          <p style={{ marginBottom:'2rem', maxWidth:400, margin:'0 auto 2rem' }}>Log in to play, save your scores, and climb the global leaderboard.</p>
          <Link to="/login" className="btn btn-primary btn-lg">Get started →</Link>
        </div>
      )}
    </div>
  );
};

export default HomePage;