import { Link } from 'react-router-dom'

function Header() {
  return (
    <header
      style={{
        backgroundColor: '#39ff14',
        color: '#000',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ fontWeight: 700 }}>E.T. Custom Landscaping</div>

      <nav style={{ display: 'flex', gap: '16px' }}>
        <Link to="/" style={{ color: '#000', textDecoration: 'none' }}>
          Home
        </Link>

        <Link to="/contact" style={{ color: '#000', textDecoration: 'none' }}>
          Contact
        </Link>
      </nav>
    </header>
  )
}

export default Header
