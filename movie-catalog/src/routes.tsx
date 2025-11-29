import { createBrowserRouter } from 'react-router-dom';
import App from '../public/app/App';
import HomePage from '../public/pages/HomePage';
import MovieDetailsPage from '../public/pages/MovieDetailsPage';
import FavoritesPage from '../public/pages/FavoritesPage';
import SearchPage from '../public/pages/SearchPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <HomePage /> },
            { path: '/movie/:id', element: <MovieDetailsPage /> },
            { path: '/favorites', element: <FavoritesPage /> },
            { path: '/search', element: <SearchPage /> },
        ],
    },
]);