import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

test('renders PDF Chatbot title', () => {
  render(<App />);
  const titleElement = screen.getByText(/PDF Chatbot/i);
  expect(titleElement).toBeInTheDocument();
});
