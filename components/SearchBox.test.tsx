import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import SearchBox from './SearchBox';

describe('SearchBox', () => {
  it('correctly renders for an empty search', () => {
    render(<SearchBox searchQuery={''} setSearchQuery={jest.fn()} />);
    expect(screen.queryAllByRole('button').length).toBe(0);
    expect(screen.queryAllByText('Clear search').length).toBe(0);
  });

  it('correctly renders the current value and clear button', () => {
    render(<SearchBox searchQuery={'foo'} setSearchQuery={jest.fn()} />);
    expect(screen.getByDisplayValue('foo'));
    expect(screen.getByRole('button'));
    expect(screen.getByText('Clear search'));
  });

  it('correctly fires the change handler', () => {
    const mockHandler = jest.fn();
    render(<SearchBox searchQuery={'foo'} setSearchQuery={mockHandler} />);
    fireEvent.change(screen.getByRole('searchbox'), {
      value: 'bar',
    });
    waitFor(() => {
      expect(mockHandler).toBeCalled();
      expect(mockHandler).toBeCalledWith('bar');
    });
  });
});
