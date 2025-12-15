import axios from 'axios';

const API_KEY = "28a92785ce852626d116ff7e6aaa2b35";
const BASE_URL = 'https://api.themoviedb.org/3';

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
        const response = await axios.get(`${BASE_URL}/movie/popular`, {
            params: {
                api_key: API_KEY,
                page,
            },
        });
        return response.data;
    },

    searchMovies: async (query: string, page = 1) => {
        const response = await axios.get(`${BASE_URL}/search/movie`, {
            params: {
                api_key: API_KEY,
                query,
                page,
            },
        });
        return response.data;
    },

    getMovieDetails: async (movieId: number): Promise<MovieDetails> => {
        const [movieResponse, creditsResponse] = await Promise.all([
            axios.get(`${BASE_URL}/movie/${movieId}`, {
                params: {
                    api_key: API_KEY,
                },
            }),
            axios.get(`${BASE_URL}/movie/${movieId}/credits`, {
                params: {
                    api_key: API_KEY,
                },
            }),
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
            axios.get(`${BASE_URL}/person/${actorId}`, {
                params: {
                    api_key: API_KEY,
                },
            }),
            axios.get(`${BASE_URL}/person/${actorId}/movie_credits`, {
                params: {
                    api_key: API_KEY,
                },
            }),
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
        const response = await axios.get(`${BASE_URL}/search/person`, {
            params: {
                api_key: API_KEY,
                query,
                page,
            },
        });
        return response.data;
    },
};