import React from 'react';
import { Movie } from '../../types';
import { useNavigate } from 'react-router-dom';
import FavoriteButton from '../FavoriteButton';

interface MovieCardProps {
    movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
    const navigate = useNavigate();
    const imageUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';

    const handleClick = () => {
        navigate(`/movie/${movie.id}`);
    };

    const handleFavoriteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Предотвращает переход при клике на кнопку избранного
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.onerror = null; // Предотвращает бесконечный цикл при ошибке
        e.currentTarget.src = 'https://via.placeholder.com/500x750?text=Image+Not+Available';
    };

    return (
        <div className="movie-card" onClick={handleClick}>
            <div className="movie-card__image-container">
                <img
                    src={imageUrl}
                    alt={movie.title}
                    className="movie-card__image"
                    onError={handleImageError}
                />
                <div onClick={handleFavoriteClick}>
                    <FavoriteButton movie={movie} className="movie-card__favorite-button" />
                </div>
            </div>
            <div className="movie-card__content">
                <h3 className="movie-card__title">{movie.title}</h3>
                <div className="movie-card__info">
          <span className="movie-card__release-date">
            {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
          </span>
                    <span className="movie-card__rating">
            ⭐ {movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}
          </span>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;