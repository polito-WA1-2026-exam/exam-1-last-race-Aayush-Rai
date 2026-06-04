import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await login(username, password);
      navigate('/game');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:'calc(100vh - 64px)', display:'grid', gridTemplateColumns:'1fr 1fr' }}>

      {/* Left — branding */}
      <div style={{ background:'linear-gradient(160deg,#0e1a08 0%,#080b14 60%)', display:'flex', flexDirection:'column', justifyContent:'center', padding:'4rem', borderRight:'1px solid var(--border)' }}>
        <p className="tag-label" style={{ marginBottom:'1.5rem' }}>Last Race</p>
        <h1 style={{ marginBottom:'1rem', fontSize:'clamp(2rem,4vw,3rem)' }}>
          Time to<br/><span style={{ color:'var(--accent)' }}>race.</span>
        </h1>
        <p style={{ fontSize:'1rem', lineHeight:1.7, maxWidth:360 }}>
          Plan your metro route in 90 seconds. Every stop brings a new challenge.
        </p>
        <div style={{ marginTop:'3rem', display:'flex', flexDirection:'column', gap:'0.6rem' }}>
          {[['var(--line-red)','Red Line'],['var(--line-blue)','Blue Line'],['var(--line-green)','Green Line'],['var(--line-yellow)','Yellow Line']].map(([color,name]) => (
            <div key={name} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
              <div style={{ width:32, height:4, background:color, borderRadius:2, boxShadow:`0 0 8px ${color}66` }} />
              <span style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontFamily:'var(--font-display)' }}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right — form */}
      <div style={{ display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'center', padding:'4rem 3rem', background:'var(--bg-dark)' }}>
        <div style={{ width:'100%', maxWidth:380 }}>
          <h2 style={{ marginBottom:'0.4rem' }}>Welcome back</h2>
          <p style={{ fontSize:'0.9rem', marginBottom:'2.5rem' }}>Log in to start playing.</p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
            <div className="field">
              <label>Username</label>
              <input type="text" value={username} onChange={e=>setUsername(e.target.value)} placeholder="e.g. alice" required autoFocus />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading} style={{ marginTop:'0.25rem' }}>
              {loading ? 'Logging in…' : 'Log in →'}
            </button>
          </form>

          <div style={{ marginTop:'2rem', padding:'1rem', background:'var(--bg-card)', borderRadius:'var(--r-sm)', border:'1px solid var(--border-light)' }}>
            <p style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontFamily:'var(--font-display)', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'0.5rem' }}>Demo accounts</p>
            {[['alice','alice123'],['bob','bob456'],['carol','carol789']].map(([u,p]) => (
              <div key={u} style={{ display:'flex', justifyContent:'space-between', fontSize:'0.85rem', padding:'0.2rem 0' }}>
                <span style={{ color:'var(--text-primary)', fontFamily:'var(--font-display)' }}>{u}</span>
                <span style={{ color:'var(--text-muted)' }}>{p}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:'1.5rem' }}>
            <Link to="/" style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;