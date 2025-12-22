import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';

const FavoritesPage: React.FC = () => {
    const favorites = useSelector((state: RootState) => state.favorites.items);

    if (favorites.length === 0) {
        return (
            <div className="favorites-page empty">
                <h1 className="page-title">Your Favorites</h1>
                <p className="empty-message">You don't have any favorite movies yet. Add some from the home page!</p>
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <h1 className="page-title">Your Favorites</h1>
            <div className="movies-grid">
                {favorites.map((movie: Movie) => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                    />
                ))}
            </div>
        </div>
    );
};

export default FavoritesPage;