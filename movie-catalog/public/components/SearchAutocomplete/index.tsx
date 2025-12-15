import React, { useState, useEffect, useRef } from 'react';
import { tmdbApi } from '../../api/tmdb';

interface SearchResult {
    id: number;
    name?: string;
    title?: string;
    profile_path?: string | null;
    poster_path?: string | null;
    media_type?: string;
}

interface SearchAutocompleteProps {
    searchType: 'actor' | 'movie';
    onSelect: (id: number, name: string) => void;
    placeholder: string;
}

const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
    searchType,
    onSelect,
    placeholder,
}) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const searchDebounce = setTimeout(async () => {
            if (query.trim().length < 2) {
                setResults([]);
                setIsOpen(false);
                return;
            }

            setLoading(true);
            try {
                const response =
                    searchType === 'actor'
                        ? await tmdbApi.searchActors(query)
                        : await tmdbApi.searchMovies(query);

                setResults(response.results.slice(0, 10));
                setIsOpen(true);
            } catch (error) {
                console.error('Search error:', error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(searchDebounce);
    }, [query, searchType]);

    const handleSelect = (result: SearchResult) => {
        const name = searchType === 'actor' ? result.name! : result.title!;
        setQuery(name);
        setIsOpen(false);
        onSelect(result.id, name);
    };

    const getImageUrl = (result: SearchResult) => {
        const path = searchType === 'actor' ? result.profile_path : result.poster_path;
        return path
            ? `https://image.tmdb.org/t/p/w92${path}`
            : 'https://via.placeholder.com/92x138?text=No+Image';
    };

    return (
        <div className="search-autocomplete" ref={wrapperRef}>
            <input
                type="text"
                className="search-autocomplete__input"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setIsOpen(true)}
            />
            {loading && <div className="search-autocomplete__loader">Поиск...</div>}
            {isOpen && results.length > 0 && (
                <div className="search-autocomplete__dropdown">
                    {results.map((result) => (
                        <div
                            key={result.id}
                            className="search-autocomplete__item"
                            onClick={() => handleSelect(result)}
                        >
                            <img
                                src={getImageUrl(result)}
                                alt={searchType === 'actor' ? result.name : result.title}
                                className="search-autocomplete__image"
                            />
                            <span className="search-autocomplete__name">
                                {searchType === 'actor' ? result.name : result.title}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchAutocomplete;

