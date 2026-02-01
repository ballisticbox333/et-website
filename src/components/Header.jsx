import { useState } from "react"
import { Link } from "react-router-dom"

function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="bg-[#39ff14] text-black">
      <div className="px-6 py-4 flex items-center justify-between">
        <div className="font-bold">E.T. Custom Landscaping</div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <nav className="flex gap-4">
            <Link to="/" className="text-black no-underline">
              Home
            </Link>

            <Link to="/contact" className="text-black no-underline">
              Contact Us
            </Link>
          </nav>

          <a
            href="tel:+19047750383"
            className="text-black font-semibold underline underline-offset-4 hover:opacity-80"
          >
            (904) 775-0383
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-md border border-black/20 px-3 py-2"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {/* Simple hamburger icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M4 7h16M4 12h16M4 17h16"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Mobile dropdown panel */}
      {menuOpen && (
        <div className="md:hidden px-6 pb-4">
          <nav className="flex flex-col gap-3">
            <Link to="/" className="text-black no-underline" onClick={closeMenu}>
              Home
            </Link>

            <Link
              to="/contact"
              className="text-black no-underline"
              onClick={closeMenu}
            >
              Contact Us
            </Link>

            <a
              href="tel:+19047750383"
              className="text-black font-semibold underline underline-offset-4 hover:opacity-80"
              onClick={closeMenu}
            >
              (904) 775-0383
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header
