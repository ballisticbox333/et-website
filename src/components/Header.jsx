import { Link } from 'react-router-dom'

function Header() {
  return (
    <header className="bg-[#39ff14] text-black py-4 px-6 flex items-center justify-between">
      <div className="font-bold">E.T. Custom Landscaping</div>

      <nav className="flex gap-4">
        <Link to="/" className="text-black no-underline">
          Home
        </Link>

        <Link to="/contact" className="text-black no-underline">
          Contact
        </Link>
      </nav>
    </header>
  )
}

export default Header
