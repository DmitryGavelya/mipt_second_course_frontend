import { createBrowserRouter } from 'react-router-dom';
import App from '../public/app/App';
import HomePage from '../public/pages/HomePage';
import MovieDetailsPage from '../public/pages/MovieDetailsPage';
import ActorDetailsPage from '../public/pages/ActorDetailsPage';
import FavoritesPage from '../public/pages/FavoritesPage';
import SearchPage from '../public/pages/SearchPage';
import GraphPage from '../public/pages/GraphPage';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            { index: true, element: <HomePage /> },
            { path: '/movie/:id', element: <MovieDetailsPage /> },
            { path: '/actor/:id', element: <ActorDetailsPage /> },
            { path: '/favorites', element: <FavoritesPage /> },
            { path: '/search', element: <SearchPage /> },
            { path: '/graph', element: <GraphPage /> },
        ],
    },
]);