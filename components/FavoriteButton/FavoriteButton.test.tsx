// import { render, screen, fireEvent } from '@testing-library/react';
// import { Provider } from 'react-redux';
// import configureStore from 'redux-mock-store';
// import FavoriteButton from './index';
// import { Movie } from '../../types';
//
// const mockStore = configureStore([]);
// const mockMovie: Movie = {
//     id: 1,
//     title: 'Test Movie',
//     poster_path: '/test.jpg',
//     overview: 'Test overview',
//     release_date: '2023-01-01',
//     vote_average: 8.5,
// };
//
// describe('FavoriteButton', () => {
//     it('renders empty heart when not favorited', () => {
//         const store = mockStore({ favorites: { items: [] } });
//
//         render(
//             <Provider store={store}>
//                 <FavoriteButton movie={mockMovie} />
//             </Provider>
//         );
//
//         expect(screen.getByText('♡')).toBeInTheDocument();
//     });
//
//     it('renders filled heart when favorited', () => {
//         const store = mockStore({ favorites: { items: [mockMovie] } });
//
//         render(
//             <Provider store={store}>
//                 <FavoriteButton movie={mockMovie} />
//             </Provider>
//         );
//
//         expect(screen.getByText('❤️')).toBeInTheDocument();
//     });
//
//     it('dispatches addFavorite action when clicked', () => {
//         const store = mockStore({ favorites: { items: [] } });
//
//         render(
//             <Provider store={store}>
//                 <FavoriteButton movie={mockMovie} />
//             </Provider>
//         );
//
//         fireEvent.click(screen.getByText('♡'));
//         const actions = store.getActions();
//         expect(actions[0].type).toBe('favorites/addFavorite');
//     });
// });