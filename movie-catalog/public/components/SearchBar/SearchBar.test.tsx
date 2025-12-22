// import { render, screen, fireEvent } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import SearchBar from './index';
//
// describe('SearchBar', () => {
//     it('updates input value when typing', () => {
//         render(
//             <MemoryRouter>
//                 <SearchBar />
//             </MemoryRouter>
//         );
//
//         const input = screen.getByPlaceholderText('Search movies...');
//         fireEvent.change(input, { target: { value: 'test' } });
//         expect(input).toHaveValue('test');
//     });
//
//     it('navigates to search page with query on submit', () => {
//         const mockNavigate = jest.fn();
//         jest.mock('react-router-dom', () => ({
//             ...jest.requireActual('react-router-dom'),
//             useNavigate: () => mockNavigate,
//         }));
//
//         render(
//             <MemoryRouter>
//                 <SearchBar />
//             </MemoryRouter>
//         );
//
//         const input = screen.getByPlaceholderText('Search movies...');
//         const form = screen.getByRole('form');
//
//         fireEvent.change(input, { target: { value: 'inception' } });
//         fireEvent.submit(form);
//
//         expect(mockNavigate).toHaveBeenCalledWith('/search?q=inception');
//     });
// });
