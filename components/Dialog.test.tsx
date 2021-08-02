import Dialog from './Dialog';
import { render, screen, fireEvent } from '@testing-library/react';

const mockHandler = jest.fn();

describe('Layout', () => {
  it('renders correctly when open', () => {
    render(
      <Dialog onDismiss={jest.fn()} isOpen={true} title="Example title">
        Foo
      </Dialog>
    );
    expect(screen.getByText('Example title'));
    expect(screen.getByText('Foo'));
  });

  it('calls the correct handler when dismissed', () => {
    render(
      <Dialog onDismiss={mockHandler} isOpen={true} title="Example title">
        Foo
      </Dialog>
    );
    fireEvent.click(screen.getByText('Close'));
    expect(mockHandler).toBeCalled();
  });
});
