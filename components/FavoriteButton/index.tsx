import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../app/store';
import { addFavorite, removeFavorite, Movie } from '../../features/favorites/favoritesSlice';

interface FavoriteButtonProps {
    movie: Movie;
    className?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ movie, className = '' }) => {
    const dispatch = useDispatch<AppDispatch>();
    const favorites = useSelector((state: RootState) => state.favorites.items);
    const isFavorite = favorites.some((fav) => fav.id === movie.id);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFavorite) {
            dispatch(removeFavorite(movie.id));
        } else {
            dispatch(addFavorite(movie));
        }
    };

    return (
        <button
            onClick={handleClick}
            className={`favorite-button ${isFavorite ? 'favorite-button--active' : ''} ${className}`}
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            {isFavorite ? '❤️' : '♡'}
        </button>
    );
};

export default FavoriteButton;