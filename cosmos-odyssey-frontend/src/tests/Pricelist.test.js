import { render, screen } from '@testing-library/react';
import axios from 'axios';
import ReservationForm from '../components/ReservationForm';

jest.mock('axios');

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

  // Wait for the "Select Origin and Destination" text to appear
  expect(await screen.findByText(/Select Origin and Destination/i)).toBeInTheDocument();

  // Verify the mock data (companies in this case) appear
  expect(await screen.findByText(/Company A/i)).toBeInTheDocument();
  expect(await screen.findByText(/Company B/i)).toBeInTheDocument();
});
