import React, { useEffect, useState } from 'react';
import MovieCard from '../components/MovieCard';
import { tmdbApi, Movie } from '../api/tmdb';

const HomePage: React.FC = () => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPopularMovies = async () => {
            try {
                setLoading(true);
                const data = await tmdbApi.getPopularMovies();
                setMovies(data.results);
            } catch (err) {
                setError('Failed to load popular movies');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPopularMovies();
    }, []);

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;

    return (
        <div className="home-page">
            <h1 className="page-title">Popular Movies</h1>
            <div className="movies-grid">
                {movies.map((movie) => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                    />
                ))}
            </div>
        </div>
    );
};

export default HomePage;