import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import GraphPage from './GraphPage';
import { tmdbApi } from '../api/tmdb';

// Мокаем API
vi.mock('../api/tmdb', () => ({
    tmdbApi: {
        searchActors: vi.fn(),
        searchMovies: vi.fn(),
        getActorDetails: vi.fn(),
        getMovieDetails: vi.fn(),
    },
}));

// Мокаем компонент визуализации
vi.mock('../components/GraphVisualization', () => ({
    default: ({ data, onNodeClick }: any) => (
        <div data-testid="graph-visualization">
            <div>Nodes: {data.nodes.length}</div>
            <div>Links: {data.links.length}</div>
            {data.nodes.map((node: any) => (
                <button
                    key={node.id}
                    onClick={() => onNodeClick(node)}
                    data-testid={`node-${node.id}`}
                >
                    {node.name}
                </button>
            ))}
        </div>
    ),
}));

const createMockStore = () =>
    configureStore({
        reducer: {
            favorites: (state = { favorites: [] }) => state,
        },
    });

describe('GraphPage', () => {
    it('renders the graph page with initial state', () => {
        const store = createMockStore();
        render(
            <Provider store={store}>
                <GraphPage />
            </Provider>
        );

        expect(screen.getByText(/Граф связей актёров и фильмов/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Введите имя актёра/i)).toBeInTheDocument();
        expect(screen.getByText(/Построить граф/i)).toBeInTheDocument();
    });

    it('allows switching between actor and movie search', () => {
        const store = createMockStore();
        render(
            <Provider store={store}>
                <GraphPage />
            </Provider>
        );

        const movieRadio = screen.getByLabelText(/Фильм/i);
        fireEvent.click(movieRadio);

        expect(screen.getByPlaceholderText(/Введите название фильма/i)).toBeInTheDocument();
    });

    it('searches for an actor and builds a graph', async () => {
        const store = createMockStore();

        const mockSearchResults = {
            results: [{ id: 1, name: 'Test Actor' }],
        };

        const mockActorDetails = {
            id: 1,
            name: 'Test Actor',
            profile_path: '/test.jpg',
            biography: 'Test bio',
            birthday: '1990-01-01',
            place_of_birth: 'Test City',
            movie_credits: {
                cast: [
                    {
                        id: 100,
                        title: 'Test Movie',
                        character: 'Test Character',
                        poster_path: '/movie.jpg',
                    },
                ],
            },
        };

        (tmdbApi.searchActors as any).mockResolvedValue(mockSearchResults);
        (tmdbApi.getActorDetails as any).mockResolvedValue(mockActorDetails);

        render(
            <Provider store={store}>
                <GraphPage />
            </Provider>
        );

        const searchInput = screen.getByPlaceholderText(/Введите имя актёра/i);
        const searchButton = screen.getByText(/Построить граф/i);

        fireEvent.change(searchInput, { target: { value: 'Test Actor' } });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText(/Nodes: 2/i)).toBeInTheDocument();
            expect(screen.getByText(/Links: 1/i)).toBeInTheDocument();
        });
    });

    it('displays error message when search fails', async () => {
        const store = createMockStore();

        (tmdbApi.searchActors as any).mockRejectedValue(new Error('Search failed'));

        render(
            <Provider store={store}>
                <GraphPage />
            </Provider>
        );

        const searchInput = screen.getByPlaceholderText(/Введите имя актёра/i);
        const searchButton = screen.getByText(/Построить граф/i);

        fireEvent.change(searchInput, { target: { value: 'Test Actor' } });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText(/Search failed/i)).toBeInTheDocument();
        });
    });

    it('displays stats when graph has data', async () => {
        const store = createMockStore();

        const mockSearchResults = {
            results: [{ id: 1, name: 'Test Actor' }],
        };

        const mockActorDetails = {
            id: 1,
            name: 'Test Actor',
            profile_path: '/test.jpg',
            biography: 'Test bio',
            birthday: '1990-01-01',
            place_of_birth: 'Test City',
            movie_credits: {
                cast: [
                    {
                        id: 100,
                        title: 'Test Movie',
                        character: 'Test Character',
                        poster_path: '/movie.jpg',
                    },
                ],
            },
        };

        (tmdbApi.searchActors as any).mockResolvedValue(mockSearchResults);
        (tmdbApi.getActorDetails as any).mockResolvedValue(mockActorDetails);

        render(
            <Provider store={store}>
                <GraphPage />
            </Provider>
        );

        const searchInput = screen.getByPlaceholderText(/Введите имя актёра/i);
        const searchButton = screen.getByText(/Построить граф/i);

        fireEvent.change(searchInput, { target: { value: 'Test Actor' } });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText(/Узлов: 2/i)).toBeInTheDocument();
            expect(screen.getByText(/Связей: 1/i)).toBeInTheDocument();
            expect(screen.getByText(/Актёров: 1/i)).toBeInTheDocument();
            expect(screen.getByText(/Фильмов: 1/i)).toBeInTheDocument();
        });
    });

    it('clears the graph when clear button is clicked', async () => {
        const store = createMockStore();

        const mockSearchResults = {
            results: [{ id: 1, name: 'Test Actor' }],
        };

        const mockActorDetails = {
            id: 1,
            name: 'Test Actor',
            profile_path: '/test.jpg',
            biography: 'Test bio',
            birthday: '1990-01-01',
            place_of_birth: 'Test City',
            movie_credits: {
                cast: [
                    {
                        id: 100,
                        title: 'Test Movie',
                        character: 'Test Character',
                        poster_path: '/movie.jpg',
                    },
                ],
            },
        };

        (tmdbApi.searchActors as any).mockResolvedValue(mockSearchResults);
        (tmdbApi.getActorDetails as any).mockResolvedValue(mockActorDetails);

        render(
            <Provider store={store}>
                <GraphPage />
            </Provider>
        );

        const searchInput = screen.getByPlaceholderText(/Введите имя актёра/i);
        const searchButton = screen.getByText(/Построить граф/i);

        fireEvent.change(searchInput, { target: { value: 'Test Actor' } });
        fireEvent.click(searchButton);

        await waitFor(() => {
            expect(screen.getByText(/Nodes: 2/i)).toBeInTheDocument();
        });

        const clearButton = screen.getByText(/Очистить/i);
        fireEvent.click(clearButton);

        await waitFor(() => {
            expect(screen.getByText(/Начните с поиска/i)).toBeInTheDocument();
        });
    });
});

