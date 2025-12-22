import favoritesReducer, { addFavorite, removeFavorite } from './favoritesSlice';
import { Movie } from './favoritesSlice';

const initialState = {
    items: [],
};

const testMovie: Movie = {
    id: 1,
    title: 'Test Movie',
    poster_path: '/test.jpg',
    overview: 'Test overview',
    release_date: '2023-01-01',
    vote_average: 8.5,
};

describe('favoritesSlice', () => {
    it('should handle initial state', () => {
        expect(favoritesReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should add a movie to favorites', () => {
        const actual = favoritesReducer(initialState, addFavorite(testMovie));
        expect(actual.items.length).toEqual(1);
        expect(actual.items[0]).toEqual(testMovie);
    });

    it('should not add duplicate movies to favorites', () => {
        const stateWithMovie = {
            items: [testMovie],
        };
        const actual = favoritesReducer(stateWithMovie, addFavorite(testMovie));
        expect(actual.items.length).toEqual(1);
    });

    it('should remove a movie from favorites', () => {
        const stateWithMovie = {
            items: [testMovie],
        };
        const actual = favoritesReducer(stateWithMovie, removeFavorite(testMovie.id));
        expect(actual.items.length).toEqual(0);
    });
});