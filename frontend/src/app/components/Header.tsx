// External dependencies
import { useState } from 'react'
import { Link } from 'react-router'

// Styles
import './Header.css'

// Header component
function Header() {
    // State
    const [menuOpen, setMenuOpen] = useState(false)

    // Event handlers
    function handleMenuToggle() {
        setMenuOpen(!menuOpen)
    }

    function handleMenuClose() {
        setMenuOpen(false)
    }

    // Render
    return (
        <header className="app-header">
            <div className="header-navigation">
                <button
                    className="menu-button"
                    type="button"
                    onClick={handleMenuToggle}
                    aria-expanded={menuOpen}
                    aria-controls="main-navigation"
                >
                    <span className="menu-line"></span>
                    <span className="menu-line"></span>
                    <span className="menu-line"></span>

                </button>

                {menuOpen && (
                    <nav 
                        id="main-navigation" 
                        className="navigation-links"
                        arial-label="Main navigation"
                    >
                        <Link to="/editor" onClick={handleMenuClose}>
                            Image Editor
                        </Link>

                        <Link to="/social" onClick={handleMenuClose}>
                            Social
                        </Link>

                    </nav>
                )}

            </div>

            <Link to="/" className="header-brand">
                Pictora
            </Link>

            <div className="header-account">
                {/* TODO: Implementirati funkcionalnost korisnickih racuna. */}
                <span className="account-name">Guest</span>
                <span className="account-avatar"></span>
            </div>

        </header>

    )

}

// Export
export default Header