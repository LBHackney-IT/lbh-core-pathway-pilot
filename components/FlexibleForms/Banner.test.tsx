import Banner from './Banner';
import { render, screen } from '@testing-library/react';

describe('Banner', () => {
  it('renders correctly', () => {
    render(<Banner title="My title">Content here</Banner>);

    expect(screen.getByRole('heading', { level: 3 }));
    expect(screen.getByText('My title'));
    expect(screen.getByText('Content here'));
  });
});
