import React from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../SearchBar';

const Header: React.FC = () => {
    return (
        <header className="header">
            <div className="header__container">
                <Link to="/" className="header__logo">
                    MovieCatalog
                </Link>
                <nav className="header__nav">
                    <Link to="/" className="header__link">Home</Link>
                    <Link to="/favorites" className="header__link">Favorites</Link>
                    <Link to="/graph" className="header__link">Graph</Link>
                </nav>
                <SearchBar />
            </div>
        </header>
    );
};

export default Header;