import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { tmdbApi, ActorDetails } from '../api/tmdb';
import { formatDate } from '../utils/formatDate';

const ActorDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [actor, setActor] = useState<ActorDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAllMovies, setShowAllMovies] = useState(false);
    const INITIAL_MOVIES_COUNT = 20;

    useEffect(() => {
        const fetchActorDetails = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await tmdbApi.getActorDetails(Number(id));
                setActor(data);
            } catch (err) {
                setError('Failed to load actor details');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchActorDetails();
    }, [id]);

    const handleAddToGraph = () => {
        navigate(`/graph?actorId=${id}&actorName=${encodeURIComponent(actor?.name || '')}`);
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!actor) return <div className="error-message">Actor not found</div>;

    const profileUrl = actor.profile_path
        ? `https://image.tmdb.org/t/p/w500${actor.profile_path}`
        : 'https://via.placeholder.com/500x750?text=No+Image';

    return (
        <div className="actor-details">
            <div className="actor-details__container">
                <div className="actor-details__header">
                    <img
                        src={profileUrl}
                        alt={actor.name}
                        className="actor-details__image"
                    />
                    <div className="actor-details__info">
                        <h1 className="actor-details__name">{actor.name}</h1>

                        <div className="actor-details__meta">
                            {actor.birthday && (
                                <div className="actor-details__meta-item">
                                    <span className="actor-details__meta-label">Дата рождения:</span>
                                    <span className="actor-details__meta-value">
                                        {formatDate(actor.birthday)}
                                    </span>
                                </div>
                            )}
                            {actor.place_of_birth && (
                                <div className="actor-details__meta-item">
                                    <span className="actor-details__meta-label">Место рождения:</span>
                                    <span className="actor-details__meta-value">
                                        {actor.place_of_birth}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            className="actor-details__graph-button"
                            onClick={handleAddToGraph}
                        >
                            🔗 Добавить в граф связей
                        </button>

                        {actor.biography && (
                            <div className="actor-details__biography">
                                <h2>Биография</h2>
                                <p>{actor.biography}</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="actor-details__filmography">
                    <h2 className="actor-details__section-title">
                        Фильмография ({actor.movie_credits.cast.length} фильмов)
                    </h2>
                    <div className="actor-details__movies-grid">
                        {(showAllMovies
                            ? actor.movie_credits.cast
                            : actor.movie_credits.cast.slice(0, INITIAL_MOVIES_COUNT)
                        ).map((movie) => (
                            <Link
                                key={movie.id}
                                to={`/movie/${movie.id}`}
                                className="actor-details__movie-card"
                            >
                                <img
                                    src={
                                        movie.poster_path
                                            ? `https://image.tmdb.org/t/p/w185${movie.poster_path}`
                                            : 'https://via.placeholder.com/185x278?text=No+Poster'
                                    }
                                    alt={movie.title}
                                    className="actor-details__movie-poster"
                                />
                                <div className="actor-details__movie-info">
                                    <h3 className="actor-details__movie-title">{movie.title}</h3>
                                    {movie.character && (
                                        <p className="actor-details__movie-character">
                                            {movie.character}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>

                    {actor.movie_credits.cast.length > INITIAL_MOVIES_COUNT && !showAllMovies && (
                        <button
                            className="actor-details__show-more"
                            onClick={() => setShowAllMovies(true)}
                        >
                            Показать все фильмы ({actor.movie_credits.cast.length - INITIAL_MOVIES_COUNT} ещё)
                        </button>
                    )}

                    {showAllMovies && actor.movie_credits.cast.length > INITIAL_MOVIES_COUNT && (
                        <button
                            className="actor-details__show-more"
                            onClick={() => setShowAllMovies(false)}
                        >
                            Скрыть
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActorDetailsPage;

