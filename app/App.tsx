import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';

const App: React.FC = () => {
    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <Outlet />
            </main>
            <footer className="footer">
                <p>Movie Catalog &copy; {new Date().getFullYear()}</p>
            </footer>
        </div>
    );
};

export default App;