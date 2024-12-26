import { render, screen, fireEvent } from '@testing-library/react';
import axios from 'axios';
import ReservationForm from '../components/ReservationForm';

jest.mock('axios');

test('adds a reservation successfully', async () => {
  axios.post.mockResolvedValueOnce({
    data: { message: 'Reservation created successfully' },
  });

  render(<ReservationForm />);

  // Fill in the form
  fireEvent.change(screen.getByPlaceholderText(/First Name/i), {
    target: { value: 'John' },
  });
  fireEvent.change(screen.getByPlaceholderText(/Last Name/i), {
    target: { value: 'Doe' },
  });

  // Mock route selection
  axios.get.mockResolvedValueOnce({
    data: {
      pricelist: {
        id: 1,
        valid_until: '2024-12-31',
        data: JSON.stringify({ legs: [] }),
      },
      companies: ['Company A'],
    },
  });

  // Trigger reservation creation
  fireEvent.click(screen.getByText(/Reserve/i));

  // Expect a success message
  expect(await screen.findByText(/Reservation made successfully!/i)).toBeInTheDocument();
});

test('fetches and displays pricelists correctly', async () => {
  const mockPricelist = {
    id: 1,
    valid_until: '2024-12-31',
    data: JSON.stringify({ legs: [] }),
  };

  axios.get.mockResolvedValueOnce({
    data: {
      pricelist: mockPricelist,
      companies: ['Company A', 'Company B'],
    },
  });

  render(<ReservationForm />);

  // Check if pricelists are fetched
  expect(await screen.findByText(/Select Origin and Destination/i)).toBeInTheDocument();

  // Verify that mock data (companies in this case) appears
  expect(await screen.findByText(/Company A/i)).toBeInTheDocument();
  expect(await screen.findByText(/Company B/i)).toBeInTheDocument();
});

test('removes reservations when pricelist expires', async () => {
  // Mock initial pricelist
  axios.get.mockResolvedValueOnce({
    data: {
      pricelist: { id: 1, valid_until: '2024-12-31' },
      companies: ['Company A'],
    },
  });

  // Mock the reservation deletion endpoint
  axios.delete.mockResolvedValueOnce({
    data: { message: 'Expired reservations deleted' },
  });

  render(<ReservationForm />);

  // Simulate the user action to delete expired reservations
  const deleteButton = screen.getByText(/Delete Expired Reservations/i);
  fireEvent.click(deleteButton);

  // Check if the success message for reservation deletion appears
  expect(await screen.findByText(/Expired reservations deleted/i)).toBeInTheDocument();
});
