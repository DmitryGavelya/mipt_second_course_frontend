import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { tmdbApi, Movie } from '../api/tmdb';
import MovieCard from '../components/MovieCard';

const SearchPage: React.FC = () => {
    const location = useLocation();
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [query, setQuery] = useState('');

    // Извлекаем параметр q из URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const searchQuery = params.get('q') || '';
        setQuery(searchQuery);

        if (searchQuery) {
            searchMovies(searchQuery);
        } else {
            setMovies([]);
            setLoading(false);
        }
    }, [location.search]);

    const searchMovies = async (searchQuery: string) => {
        try {
            setLoading(true);
            const data = await tmdbApi.searchMovies(searchQuery);
            setMovies(data.results);
        } catch (err) {
            setError('Failed to search movies');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="loading-spinner">Loading...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!query) return <div className="search-page empty"><h1 className="page-title">Search Movies</h1><p className="empty-message">Enter a search term to find movies</p></div>;

    return (
        <div className="search-page">
            <h1 className="page-title">Search Results for "{query}"</h1>
            {movies.length === 0 ? (
                <p className="empty-message">No movies found for your search. Try different keywords.</p>
            ) : (
                <div className="movies-grid">
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchPage;