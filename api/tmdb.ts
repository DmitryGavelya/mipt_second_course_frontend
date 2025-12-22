/// <reference types="vite/client" />

import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY || "28a92785ce852626d116ff7e6aaa2b35";

// Настройка прокси для обхода блокировок TMDB API
const USE_PROXY = import.meta.env.VITE_USE_PROXY !== 'false'; // По умолчанию включен
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Используем CORS Anywhere или AllOrigins для обхода блокировок
const PROXY_URL = import.meta.env.VITE_PROXY_URL || 'https://api.allorigins.win/raw?url=';

// Функция для построения URL с или без прокси
const buildUrl = (endpoint: string): string => {
    const fullUrl = `${TMDB_BASE_URL}${endpoint}`;
    return USE_PROXY ? `${PROXY_URL}${encodeURIComponent(fullUrl)}` : fullUrl;
};

export interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    overview: string;
    release_date: string;
    vote_average: number;
    backdrop_path?: string | null;
}

export interface MovieDetails extends Movie {
    runtime: number;
    genres: { id: number; name: string }[];
    credits: {
        cast: {
            id: number;
            name: string;
            character: string;
            profile_path: string | null;
        }[];
    };
}

export interface ActorDetails {
    id: number;
    name: string;
    profile_path: string | null;
    biography: string;
    birthday: string;
    place_of_birth: string;
    movie_credits: {
        cast: {
            id: number;
            title: string;
            character: string;
            poster_path: string | null;
        }[];
    };
}

export const tmdbApi = {
    getPopularMovies: async (page = 1) => {
        const response = await axios.get(buildUrl(`/movie/popular?api_key=${API_KEY}&page=${page}`));
        return response.data;
    },

    searchMovies: async (query: string, page = 1) => {
        const response = await axios.get(buildUrl(`/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`));
        return response.data;
    },

    getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
        const [movieResponse, creditsResponse] = await Promise.all([
            axios.get(buildUrl(`/movie/${movieId}?api_key=${API_KEY}`)),
            axios.get(buildUrl(`/movie/${movieId}/credits?api_key=${API_KEY}`)),
        ]);

        return {
            ...movieResponse.data,
            credits: {
                cast: creditsResponse.data.cast.slice(0, 10), // Только первые 10 актеров
            },
        };
    },

    getActorDetails: async (actorId: number): Promise<ActorDetails> => {
        const [actorResponse, creditsResponse] = await Promise.all([
            axios.get(buildUrl(`/person/${actorId}?api_key=${API_KEY}`)),
            axios.get(buildUrl(`/person/${actorId}/movie_credits?api_key=${API_KEY}`)),
        ]);

        return {
            ...actorResponse.data,
            movie_credits: {
                // Сортируем по популярности и убираем дубликаты
                cast: creditsResponse.data.cast
                    .filter((movie: any) => movie.title) // Только фильмы с названием
                    .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0)) // Сортировка по популярности
            }
        };
    },

    searchActors: async (query: string, page = 1) => {
        const response = await axios.get(buildUrl(`/search/person?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`));
        return response.data;
    },
};