import {describe, test} from "@jest/globals";
import {authenticatedFetch} from "./fetch";
import {waitFor} from "@testing-library/react";

global.fetch = jest.fn();
(global.fetch as jest.Mock).mockResolvedValue({status: 200} as Response);

let windowClosed = false;
const windowClose = jest.fn().mockImplementation(() => {console.log('closing window function', windowClosed); windowClosed = true;});

window.open = jest.fn().mockImplementation(() => {
  const url = new URL('http://auth-server/auth');

  const location = Object.assign(url, {
    ancestorOrigins: "",
    assign: jest.fn(),
    reload: jest.fn(),
    replace: (newUrl) => {
      location.host = (new URL(newUrl)).host;
    }
  });

  const timeout = setTimeout(() => {
    location.replace('http://localhost/auth/sign-in');
    clearTimeout(timeout);
  });

  return {
    closed: windowClosed,
    location,
  };
});

describe('lib/fetch', () => {
  describe('when the user is authenticated', () => {
    beforeAll(async () => {
      (global.fetch as jest.Mock).mockClear();
      (window.open as jest.Mock).mockClear();
      (global.fetch as jest.Mock).mockResolvedValueOnce({status: 200} as Response);

      await authenticatedFetch('test', {});
    });

    test('calls fetch with given url', () => {
      expect(fetch).toHaveBeenCalledWith('test', {});
    });

    test('does not open a new tab', () => {
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('when the user is not authenticated', () => {
    describe('a single request', () => {
      beforeAll(async () => {
        (global.fetch as jest.Mock).mockClear();
        (window.open as jest.Mock).mockClear();
        (windowClose as jest.Mock).mockClear();
        windowClosed = false;
        (global.fetch as jest.Mock).mockResolvedValueOnce({status: 401} as Response);

        setTimeout(() => {windowClosed = true}, 100);
        await authenticatedFetch('test', {});
      });

      test('calls fetch with given url', () => {
        expect(fetch).toHaveBeenNthCalledWith(1, 'test', {});
      });

      test('calls fetch again with given url', () => {
        expect(fetch).toHaveBeenNthCalledWith(2, 'test', {});
      });

      test('opens a new tab with the login address', () => {
        expect(window.open).toHaveBeenCalledWith(
          'https://example.com/auth?redirect_uri=http://localhost/auth/sign-in',
          'Login'
        );
      });
    });
    describe('multiple requests', () => {
      beforeAll(async () => {
        (global.fetch as jest.Mock).mockClear();
        (window.open as jest.Mock).mockClear();
        (windowClose as jest.Mock).mockClear();
        windowClosed = false;
        (global.fetch as jest.Mock).mockResolvedValueOnce({status: 401} as Response);
        (global.fetch as jest.Mock).mockResolvedValueOnce({status: 401} as Response);

        setTimeout(() => {windowClosed = true}, 200);
        await waitFor(() => {
          authenticatedFetch('test1', {});
          authenticatedFetch('test2', {});
        })
      });

      test('calls fetch with given url', () => {
        expect(fetch).toHaveBeenCalledWith('test1', {});
        expect(fetch).toHaveBeenCalledWith('test2', {});
      });

      test('only opens a single new tab with the login address', () => {
        expect(window.open).toHaveBeenCalledWith(
          'https://example.com/auth?redirect_uri=http://localhost/auth/sign-in',
          'Login'
        );
        expect(window.open).toHaveBeenCalledTimes(1);
      });
    });
  });
});
