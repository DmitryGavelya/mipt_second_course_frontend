// import { render, screen, fireEvent } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import MovieCard from './index';
// import { Movie } from '../../types';
//
// const mockMovie: Movie = {
//     id: 1,
//     title: 'Test Movie',
//     poster_path: '/test.jpg',
//     overview: 'Test overview',
//     release_date: '2023-01-01',
//     vote_average: 8.5,
// };
//
// describe('MovieCard', () => {
//     it('renders movie title and rating', () => {
//         render(
//             <MemoryRouter>
//                 <MovieCard movie={mockMovie} />
//             </MemoryRouter>
//         );
//
//         expect(screen.getByText('Test Movie')).toBeInTheDocument();
//         expect(screen.getByText('⭐ 8.5')).toBeInTheDocument();
//     });
//
//     it('navigates to movie details page on click', () => {
//         const mockNavigate = jest.fn();
//         jest.mock('react-router-dom', () => ({
//             ...jest.requireActual('react-router-dom'),
//             useNavigate: () => mockNavigate,
//         }));
//
//         render(
//             <MemoryRouter>
//                 <MovieCard movie={mockMovie} />
//             </MemoryRouter>
//         );
//
//         fireEvent.click(screen.getByText('Test Movie').closest('.movie-card')!);
//         expect(mockNavigate).toHaveBeenCalledWith('/movie/1');
//     });
// });