import React from 'react';
import { render, screen } from '@testing-library/react';
import TeamRankings from './TeamRankings';

describe('TeamRankings', () => {
  it('renders rankings title and team cards', () => {
    const mockRankings = {
      title: 'Test Rankings',
      updated: '2025-05-16',
      data: [
        { RANK: 1, COLLEGE: 'Oklahoma', RECORD: '50-2', POINTS: 1000 },
        { RANK: 2, COLLEGE: 'UCLA', RECORD: '48-4', POINTS: 950 }
      ]
    };
    render(<TeamRankings rankings={mockRankings} />);
    expect(screen.getByText(/Test Rankings/i)).toBeInTheDocument();
    expect(screen.getByText(/Oklahoma/i)).toBeInTheDocument();
    expect(screen.getByText(/UCLA/i)).toBeInTheDocument();
  });
});