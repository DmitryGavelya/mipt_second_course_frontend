import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { tmdbApi, MovieDetails } from '../api/tmdb';
import FavoriteButton from '../components/FavoriteButton';
import { formatDate } from '../utils/formatDate';

const MovieDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [movie, setMovie] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchMovieDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await tmdbApi.getMovieDetails(Number(id));
                setMovie(data);
            } catch (err) {
                setError('Failed to load movie details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchMovieDetails();
    }, [id]);

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!movie) return <div className="error-message">Movie not found</div>;

    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
        : 'https://via.placeholder.com/1280x720?text=No+Backdrop';

    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : 'https://via.placeholder.com/500x750?text=No+Poster';

    return (
        <div className="movie-details">
            {/* === Фон и основная информация === */}
            <div
                className="movie-details__backdrop"
                style={{ backgroundImage: `url(${backdropUrl})` }}
            >
                <div className="movie-details__backdrop-overlay">
                    <div className="movie-details__container">
                        <img
                            src={posterUrl}
                            alt={movie.title}
                            className="movie-details__poster"
                        />
                        <div className="movie-details__info">
                            <div className="movie-details__header">
                                <h1 className="movie-details__title">{movie.title}</h1>
                                <FavoriteButton
                                    movie={movie}
                                    className="movie-details__favorite-button"
                                />
                            </div>
                            <p className="movie-details__overview">{movie.overview}</p>

                            <div className="movie-details__meta">
                                <div className="movie-details__meta-item">
                                    <span className="movie-details__meta-label">Release Date:</span>
                                    <span className="movie-details__meta-value">
                    {formatDate(movie.release_date)}
                  </span>
                                </div>
                                <div className="movie-details__meta-item">
                                    <span className="movie-details__meta-label">Rating:</span>
                                    <span className="movie-details__meta-value">
                    ⭐ {movie.vote_average.toFixed(1)}/10
                  </span>
                                </div>
                                <div className="movie-details__meta-item">
                                    <span className="movie-details__meta-label">Runtime:</span>
                                    <span className="movie-details__meta-value">
                    {movie.runtime} min
                  </span>
                                </div>
                            </div>

                            <div className="movie-details__genres">
                                <span className="movie-details__meta-label">Genres:</span>
                                <div className="movie-details__genres-list">
                                    {movie.genres.map((genre) => (
                                        <span key={genre.id} className="movie-details__genre">
                      {genre.name}
                    </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* === Блок Cast — ОТДЕЛЬНО, ПОД BACKDROP === */}
            <div className="movie-details__cast-section">
                <div className="movie-details__container">
                    <div className="movie-details__cast">
                        <h2 className="movie-details__section-title">Cast</h2>
                        <div className="movie-details__cast-grid">
                            {movie.credits.cast.map((actor) => (
                                <div key={actor.id} className="movie-details__actor">
                                    <img
                                        src={
                                            actor.profile_path
                                                ? `https://image.tmdb.org/t/p/w185${actor.profile_path}`
                                                : 'https://via.placeholder.com/185x278?text=No+Image'
                                        }
                                        alt={actor.name}
                                        className="movie-details__actor-image"
                                    />
                                    <div className="movie-details__actor-name">{actor.name}</div>
                                    <div className="movie-details__actor-character">
                                        {actor.character}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieDetailsPage;