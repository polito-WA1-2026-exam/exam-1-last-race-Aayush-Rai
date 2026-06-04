import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();

  const handleLogout = async () => { await logout(); navigate('/'); };
  const active = (path) => location.pathname === path;

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.logo}>
        <span style={s.logoL}>LAST</span>
        <span style={s.logoR}>RACE</span>
        <span style={s.logoDot} />
      </Link>

      <div style={s.links}>
        <Link to="/leaderboard" style={{ ...s.link, ...(active('/leaderboard') ? s.linkOn : {}) }}>
          Rankings
        </Link>

        {user ? (
          <>
            <Link to="/game" style={{ ...s.link, ...(active('/game') ? s.linkOn : {}) }}>
              Play
            </Link>
            <div style={s.sep} />
            <span style={s.user}>@{user.username}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Log in →
          </Link>
        )}
      </div>
    </nav>
  );
};

const s = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 2.5rem', height: '64px',
    borderBottom: '1px solid rgba(255,255,255,0.07)',
    background: 'rgba(8,11,20,0.92)',
    backdropFilter: 'blur(16px)',
    position: 'sticky', top: 0, zIndex: 100,
  },
  logo: { display: 'flex', alignItems: 'center', gap: '2px', textDecoration: 'none' },
  logoL: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.08em', color: 'var(--text-primary)' },
  logoR: { fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.25rem', letterSpacing: '0.08em', color: 'var(--accent)' },
  logoDot: { width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', marginLeft: 4, marginBottom: 10, boxShadow: '0 0 8px var(--accent)' },
  links: { display: 'flex', alignItems: 'center', gap: '1.75rem' },
  link: { fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: '0.88rem', letterSpacing: '0.04em', color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.15s' },
  linkOn: { color: 'var(--text-primary)' },
  sep:  { width: 1, height: 20, background: 'var(--border-light)' },
  user: { fontFamily: 'var(--font-display)', fontSize: '0.82rem', color: 'var(--text-muted)' },
};

export default Navbar;