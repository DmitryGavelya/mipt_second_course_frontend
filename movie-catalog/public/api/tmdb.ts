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
            }
        };
    },
};