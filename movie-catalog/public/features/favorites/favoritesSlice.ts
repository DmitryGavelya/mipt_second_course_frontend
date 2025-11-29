import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    overview: string;
    release_date: string;
    vote_average: number;
}

interface FavoritesState {
    items: Movie[];
}

const initialState: FavoritesState = {
    items: JSON.parse(localStorage.getItem('favorites') || '[]'),
};

const favoritesSlice = createSlice({
    name: 'favorites',
    initialState,
    reducers: {
        addFavorite: (state, action: PayloadAction<Movie>) => {
            if (!state.items.some(movie => movie.id === action.payload.id)) {
                state.items.push(action.payload);
                localStorage.setItem('favorites', JSON.stringify(state.items));
            }
        },
        removeFavorite: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(movie => movie.id !== action.payload);
            localStorage.setItem('favorites', JSON.stringify(state.items));
        },
    },
});

export const { addFavorite, removeFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;