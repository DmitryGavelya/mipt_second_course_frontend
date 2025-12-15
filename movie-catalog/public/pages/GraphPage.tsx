import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tmdbApi } from '../api/tmdb';
import GraphVisualization from '../components/GraphVisualization';
import SearchAutocomplete from '../components/SearchAutocomplete';

export interface GraphNode {
    id: string;
    name: string;
    type: 'actor' | 'movie';
    image?: string;
    numericId: number;
}

export interface GraphLink {
    source: string;
    target: string;
    character?: string;
}

export interface GraphData {
    nodes: GraphNode[];
    links: GraphLink[];
}

const GraphPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // Load from localStorage on mount
    const [graphData, setGraphData] = useState<GraphData>(() => {
        const saved = localStorage.getItem('graphData');
        return saved ? JSON.parse(saved) : { nodes: [], links: [] };
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchType, setSearchType] = useState<'actor' | 'movie'>(() => {
        return (localStorage.getItem('searchType') as 'actor' | 'movie') || 'actor';
    });

    const [selectedActors, setSelectedActors] = useState<number[]>(() => {
        const saved = localStorage.getItem('selectedActors');
        return saved ? JSON.parse(saved) : [];
    });

    const [selectedMovies, setSelectedMovies] = useState<number[]>(() => {
        const saved = localStorage.getItem('selectedMovies');
        return saved ? JSON.parse(saved) : [];
    });

    const [actorNames, setActorNames] = useState<Map<number, string>>(() => {
        const saved = localStorage.getItem('actorNames');
        return saved ? new Map(JSON.parse(saved)) : new Map();
    });

    const [movieNames, setMovieNames] = useState<Map<number, string>>(() => {
        const saved = localStorage.getItem('movieNames');
        return saved ? new Map(JSON.parse(saved)) : new Map();
    });

    // Ref to track current selected actors (avoids stale closure)
    const selectedActorsRef = useRef<number[]>(selectedActors);
    const selectedMoviesRef = useRef<number[]>(selectedMovies);

    useEffect(() => {
        selectedActorsRef.current = selectedActors;
    }, [selectedActors]);

    useEffect(() => {
        selectedMoviesRef.current = selectedMovies;
    }, [selectedMovies]);

    // Save to localStorage whenever data changes
    useEffect(() => {
        localStorage.setItem('graphData', JSON.stringify(graphData));
    }, [graphData]);

    useEffect(() => {
        localStorage.setItem('searchType', searchType);
    }, [searchType]);

    useEffect(() => {
        localStorage.setItem('selectedActors', JSON.stringify(selectedActors));
    }, [selectedActors]);

    useEffect(() => {
        localStorage.setItem('selectedMovies', JSON.stringify(selectedMovies));
    }, [selectedMovies]);

    useEffect(() => {
        localStorage.setItem('actorNames', JSON.stringify(Array.from(actorNames.entries())));
    }, [actorNames]);

    useEffect(() => {
        localStorage.setItem('movieNames', JSON.stringify(Array.from(movieNames.entries())));
    }, [movieNames]);

    // Handle URL parameters (from actor/movie cards)
    useEffect(() => {
        const actorId = searchParams.get('actorId');
        const movieId = searchParams.get('movieId');

        if (actorId) {
            const id = Number(actorId);
            const currentActors = selectedActorsRef.current;

            if (!currentActors.includes(id)) {
                setSearchType('actor');
                const newActors = [...currentActors, id];
                selectedActorsRef.current = newActors;
                setSelectedActors(newActors);
                buildGraphFromActors(newActors);
            }
            setSearchParams({});
        } else if (movieId) {
            const id = Number(movieId);
            const currentMovies = selectedMoviesRef.current;

            if (!currentMovies.includes(id)) {
                setSearchType('movie');
                const newMovies = [...currentMovies, id];
                selectedMoviesRef.current = newMovies;
                setSelectedMovies(newMovies);
                buildGraphFromMovies(newMovies);
            }
            setSearchParams({});
        }
    }, [searchParams]);

    const buildGraphFromActors = useCallback(async (actorIds: number[]) => {
        console.log('=== buildGraphFromActors ВЫЗВАН ===');
        console.log('Передано actorIds:', actorIds);
        console.log('Количество актёров:', actorIds.length);

        setLoading(true);
        setError(null);

        try {
            const nodes: GraphNode[] = [];
            const links: GraphLink[] = [];
            const movieMap = new Map<number, { title: string; poster: string | null; actors: Set<number> }>();
            const newActorNames = new Map<number, string>();

            // Загружаем данные всех актёров
            console.log('Начинаем загрузку актёров...');
            for (const actorId of actorIds) {
                console.log(`Загружаем актёра ID: ${actorId}`);
                const actor = await tmdbApi.getActorDetails(actorId);
                console.log(`Загружен: ${actor.name}, фильмов: ${actor.movie_credits.cast.length}`);

                // Сохраняем имя актёра
                newActorNames.set(actorId, actor.name);

                // Формируем URL изображения
                const actorImageUrl = actor.profile_path ? `https://image.tmdb.org/t/p/w185${actor.profile_path}` : undefined;
                console.log(`  📷 Изображение актёра: ${actorImageUrl || 'НЕТ'}`);

                // Добавляем актёра
                nodes.push({
                    id: `actor-${actorId}`,
                    name: actor.name,
                    type: 'actor',
                    image: actorImageUrl,
                    numericId: actorId,
                });

                // Собираем фильмы
                actor.movie_credits.cast.forEach(movie => {
                    if (!movieMap.has(movie.id)) {
                        movieMap.set(movie.id, {
                            title: movie.title,
                            poster: movie.poster_path,
                            actors: new Set()
                        });
                    }
                    movieMap.get(movie.id)!.actors.add(actorId);
                });
            }

            // Если один актёр - показываем ВСЕ его фильмы (первые 20)
            if (actorIds.length === 1) {
                let count = 0;
                movieMap.forEach((movie, movieId) => {
                    if (count++ < 20) {
                        const movieImageUrl = movie.poster ? `https://image.tmdb.org/t/p/w185${movie.poster}` : undefined;
                        console.log(`  🎬 Фильм "${movie.title}": ${movieImageUrl || 'НЕТ постера'}`);

                        nodes.push({
                            id: `movie-${movieId}`,
                            name: movie.title,
                            type: 'movie',
                            image: movieImageUrl,
                            numericId: movieId,
                        });
                        links.push({
                            source: `actor-${actorIds[0]}`,
                            target: `movie-${movieId}`,
                        });
                    }
                });
            } else {
                // Несколько актёров - показываем только ОБЩИЕ фильмы (где >= 2 актёров)
                console.log('=== ПОИСК ОБЩИХ ФИЛЬМОВ ===');
                console.log('Всего фильмов собрано:', movieMap.size);
                console.log('Ищем для актёров с ID:', actorIds);

                let foundCommonMovies = 0;

                movieMap.forEach((movie, movieId) => {
                    // Проверяем сколько из ВЫБРАННЫХ актёров в этом фильме
                    const selectedActorsInMovie = actorIds.filter(id => movie.actors.has(id));

                    if (selectedActorsInMovie.length >= 1) {
                        console.log(`\nФильм: "${movie.title}" (ID: ${movieId})`);
                        console.log(`  - Всего актёров в фильме:`, movie.actors.size);
                        console.log(`  - Актёры из фильма:`, Array.from(movie.actors));
                        console.log(`  - ВЫБРАННЫХ актёров в фильме:`, selectedActorsInMovie.length, selectedActorsInMovie);
                    }

                    if (selectedActorsInMovie.length >= 2) {
                        foundCommonMovies++;
                        const movieImageUrl = movie.poster ? `https://image.tmdb.org/t/p/w185${movie.poster}` : undefined;
                        console.log(`  ✅ ДОБАВЛЯЕМ! (${selectedActorsInMovie.length} выбранных актёров)`);
                        console.log(`  📷 Постер фильма: ${movieImageUrl || 'НЕТ'}`);

                        nodes.push({
                            id: `movie-${movieId}`,
                            name: movie.title,
                            type: 'movie',
                            image: movieImageUrl,
                            numericId: movieId,
                        });

                        // Связываем фильм только с ВЫБРАННЫМИ актёрами
                        selectedActorsInMovie.forEach(actorId => {
                            links.push({
                                source: `actor-${actorId}`,
                                target: `movie-${movieId}`,
                            });
                        });
                    }
                });

                console.log(`\n=== ИТОГО: Найдено ${foundCommonMovies} общих фильмов ===`);
                console.log('Узлов в графе:', nodes.length);
                console.log('Связей в графе:', links.length);
            }

            setActorNames(newActorNames);
            setGraphData({ nodes, links });
        } catch (err) {
            setError('Ошибка построения графа');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const buildGraphFromMovies = useCallback(async (movieIds: number[]) => {
        setLoading(true);
        setError(null);

        try {
            const nodes: GraphNode[] = [];
            const links: GraphLink[] = [];
            const actorMap = new Map<number, { name: string; photo: string | null; movies: Set<number> }>();
            const newMovieNames = new Map(movieNames);

            // Загружаем данные всех фильмов
            for (const movieId of movieIds) {
                const movie = await tmdbApi.getMovieDetails(movieId);

                // Сохраняем название фильма
                newMovieNames.set(movieId, movie.title);

                // Формируем URL изображения
                const movieImageUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w185${movie.poster_path}` : undefined;
                console.log(`🎬 Фильм "${movie.title}": ${movieImageUrl || 'НЕТ постера'}`);

                // Добавляем фильм
                nodes.push({
                    id: `movie-${movieId}`,
                    name: movie.title,
                    type: 'movie',
                    image: movieImageUrl,
                    numericId: movieId,
                });

                // Собираем актёров
                movie.credits.cast.forEach(actor => {
                    if (!actorMap.has(actor.id)) {
                        actorMap.set(actor.id, {
                            name: actor.name,
                            photo: actor.profile_path,
                            movies: new Set()
                        });
                    }
                    actorMap.get(actor.id)!.movies.add(movieId);
                });
            }

            // Если один фильм - показываем ВСЕХ актёров
            if (movieIds.length === 1) {
                actorMap.forEach((actor, actorId) => {
                    const actorImageUrl = actor.photo ? `https://image.tmdb.org/t/p/w185${actor.photo}` : undefined;
                    console.log(`  👤 Актёр "${actor.name}": ${actorImageUrl || 'НЕТ фото'}`);

                    nodes.push({
                        id: `actor-${actorId}`,
                        name: actor.name,
                        type: 'actor',
                        image: actorImageUrl,
                        numericId: actorId,
                    });
                    links.push({
                        source: `actor-${actorId}`,
                        target: `movie-${movieIds[0]}`,
                    });
                });
            } else {
                // Несколько фильмов - показываем только ОБЩИХ актёров (>= 2 фильмов)
                actorMap.forEach((actor, actorId) => {
                    if (actor.movies.size >= 2) {
                        const actorImageUrl = actor.photo ? `https://image.tmdb.org/t/p/w185${actor.photo}` : undefined;
                        console.log(`  👤 Общий актёр "${actor.name}": ${actorImageUrl || 'НЕТ фото'}`);

                        nodes.push({
                            id: `actor-${actorId}`,
                            name: actor.name,
                            type: 'actor',
                            image: actorImageUrl,
                            numericId: actorId,
                        });

                        // Связываем актёра с фильмами
                        actor.movies.forEach(movieId => {
                            links.push({
                                source: `actor-${actorId}`,
                                target: `movie-${movieId}`,
                            });
                        });
                    }
                });
            }

            setMovieNames(newMovieNames);
            setGraphData({ nodes, links });
        } catch (err) {
            setError('Ошибка построения графа');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleSelect = async (id: number, name: string) => {
        console.log('=== handleSelect ВЫЗВАН ===');
        console.log('Добавляем ID:', id, 'Имя:', name);
        console.log('Текущий searchType:', searchType);
        console.log('Текущие selectedActors (ref):', selectedActorsRef.current);

        if (searchType === 'actor') {
            // Используем ref для актуального значения
            const currentActors = selectedActorsRef.current;

            // Проверяем что актёр ещё не добавлен
            if (currentActors.includes(id)) {
                console.log('Актёр уже добавлен, пропускаем');
                return;
            }

            const newActors = [...currentActors, id];
            console.log('Новый массив актёров:', newActors);

            // Сначала обновляем ref
            selectedActorsRef.current = newActors;
            setSelectedActors(newActors);

            // Затем строим граф
            await buildGraphFromActors(newActors);
        } else {
            const currentMovies = selectedMoviesRef.current;

            if (currentMovies.includes(id)) {
                console.log('Фильм уже добавлен, пропускаем');
                return;
            }

            const newMovies = [...currentMovies, id];
            selectedMoviesRef.current = newMovies;
            setSelectedMovies(newMovies);
            await buildGraphFromMovies(newMovies);
        }
    };

    const handleAddToGraph = async (id: number) => {
        const currentActors = selectedActorsRef.current;
        const currentMovies = selectedMoviesRef.current;

        // Определяем тип по существующим выбранным элементам
        if (currentActors.length > 0 && !currentActors.includes(id)) {
            const newActors = [...currentActors, id];
            selectedActorsRef.current = newActors;
            setSelectedActors(newActors);
            await buildGraphFromActors(newActors);
        } else if (currentMovies.length > 0 && !currentMovies.includes(id)) {
            const newMovies = [...currentMovies, id];
            selectedMoviesRef.current = newMovies;
            setSelectedMovies(newMovies);
            await buildGraphFromMovies(newMovies);
        }
    };

    const handleRemoveActor = async (id: number) => {
        const currentActors = selectedActorsRef.current;
        const newActors = currentActors.filter(actorId => actorId !== id);
        selectedActorsRef.current = newActors;
        setSelectedActors(newActors);
        if (newActors.length > 0) {
            await buildGraphFromActors(newActors);
        } else {
            setGraphData({ nodes: [], links: [] });
        }
    };

    const handleRemoveMovie = async (id: number) => {
        const currentMovies = selectedMoviesRef.current;
        const newMovies = currentMovies.filter(movieId => movieId !== id);
        selectedMoviesRef.current = newMovies;
        setSelectedMovies(newMovies);
        if (newMovies.length > 0) {
            await buildGraphFromMovies(newMovies);
        } else {
            setGraphData({ nodes: [], links: [] });
        }
    };

    const handleClearGraph = () => {
        setGraphData({ nodes: [], links: [] });
        setSelectedActors([]);
        setSelectedMovies([]);
        setActorNames(new Map());
        setMovieNames(new Map());
        setError(null);
        localStorage.removeItem('graphData');
        localStorage.removeItem('selectedActors');
        localStorage.removeItem('selectedMovies');
        localStorage.removeItem('actorNames');
        localStorage.removeItem('movieNames');
    };

    const handleSearchTypeChange = (type: 'actor' | 'movie') => {
        setSearchType(type);
        handleClearGraph();
    };

    const selectedCount = searchType === 'actor' ? selectedActors.length : selectedMovies.length;

    return (
        <div className="graph-page">
            <div className="graph-page__header">
                <h1 className="graph-page__title">🎬 Граф связей актёров и фильмов</h1>
                <p className="graph-page__description">
                    Добавляйте актёров чтобы найти их общие фильмы, или добавляйте фильмы чтобы найти общих актёров!
                </p>
            </div>

            <div className="graph-page__controls">
                <div className="graph-page__search">
                    <div className="graph-page__search-type">
                        <label>
                            <input
                                type="radio"
                                value="actor"
                                checked={searchType === 'actor'}
                                onChange={(e) => handleSearchTypeChange(e.target.value as 'actor')}
                            />
                            Актёр
                        </label>
                        <label>
                            <input
                                type="radio"
                                value="movie"
                                checked={searchType === 'movie'}
                                onChange={(e) => handleSearchTypeChange(e.target.value as 'movie')}
                            />
                            Фильм
                        </label>
                    </div>

                    <SearchAutocomplete
                        searchType={searchType}
                        onSelect={handleSelect}
                        placeholder={
                            searchType === 'actor'
                                ? 'Добавить актёра...'
                                : 'Добавить фильм...'
                        }
                    />

                    {graphData.nodes.length > 0 && (
                        <button
                            className="graph-page__clear-button"
                            onClick={handleClearGraph}
                        >
                            Очистить
                        </button>
                    )}
                </div>

                {selectedCount > 0 && (
                    <div className="graph-page__selected-info">
                        <span className="graph-page__selected-count">
                            ✅ Выбрано: {selectedCount} {searchType === 'actor' ? (selectedCount === 1 ? 'актёр' : 'актёров') : (selectedCount === 1 ? 'фильм' : 'фильмов')}
                        </span>
                        {selectedCount === 1 && (
                            <span className="graph-page__selected-hint">
                                → Добавьте ещё чтобы найти {searchType === 'actor' ? 'общие фильмы' : 'общих актёров'}
                            </span>
                        )}
                        {selectedCount >= 2 && (
                            <span className="graph-page__selected-hint graph-page__selected-hint--success">
                                {searchType === 'actor'
                                    ? `🎬 Фильмы где снимались минимум 2 актёра`
                                    : `👥 Актёры из минимум 2 фильмов`}
                            </span>
                        )}
                    </div>
                )}

                {/* Список выбранных актёров/фильмов с кнопками удаления */}
                {(selectedActors.length > 0 || selectedMovies.length > 0) && (
                    <div className="graph-page__selected-list">
                        <h3>Выбраны:</h3>
                        <div className="graph-page__selected-items">
                            {searchType === 'actor' && selectedActors.map(id => (
                                <div key={id} className="graph-page__selected-item">
                                    <span>👤 {actorNames.get(id) || `Актёр #${id}`}</span>
                                    <button
                                        className="graph-page__remove-btn"
                                        onClick={() => handleRemoveActor(id)}
                                        title="Удалить"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                            {searchType === 'movie' && selectedMovies.map(id => (
                                <div key={id} className="graph-page__selected-item">
                                    <span>🎬 {movieNames.get(id) || `Фильм #${id}`}</span>
                                    <button
                                        className="graph-page__remove-btn"
                                        onClick={() => handleRemoveMovie(id)}
                                        title="Удалить"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {error && <div className="graph-page__error">{error}</div>}

                {graphData.nodes.length > 0 && (
                    <div className="graph-page__stats">
                        <span>Узлов: {graphData.nodes.length}</span>
                        <span>Связей: {graphData.links.length}</span>
                        <span>Актёров: {graphData.nodes.filter((n) => n.type === 'actor').length}</span>
                        <span>Фильмов: {graphData.nodes.filter((n) => n.type === 'movie').length}</span>
                    </div>
                )}
            </div>

            <div className="graph-page__visualization">
                {loading && <div className="loading-spinner">Построение графа...</div>}
                {!loading && graphData.nodes.length > 0 && (
                    <GraphVisualization
                        data={graphData}
                        onAddToGraph={handleAddToGraph}
                    />
                )}
                {!loading && graphData.nodes.length === 0 && !error && (
                    <div className="graph-page__empty">
                        <p>Начните с поиска актёра или фильма</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GraphPage;

