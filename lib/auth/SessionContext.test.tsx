import {describe, test} from '@jest/globals';
import {act, render, screen, waitFor} from "@testing-library/react";
import {Session, SessionContext} from "./SessionContext";
import {FunctionComponent} from "react";
import {useContext} from "react";
import {mockSession} from "../../fixtures/session";
import {useRouter} from "next/router";

jest.mock("next/router");

const replace = jest.fn();
;(useRouter as jest.Mock).mockReturnValue({replace});

global.fetch = jest.fn();

const TestComponent: FunctionComponent = () => {
  const session = useContext(SessionContext);

  return (
    <div>{JSON.stringify(session)}</div>
  );
};

describe('a user not logged in', () => {
  beforeEach(async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 401,
      json: async () => ({error: "User not logged in"}),
    });

    await waitFor(async () =>
      await render(<Session><TestComponent/></Session>))
  });

  test('the session api is called', () => {
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/session");
  });

  test('the user is redirected', () => {
    expect(replace).toHaveBeenCalledWith('https://example.com/auth?redirect_uri=http://localhost/');
  });
});

describe('a logged in user', () => {
  beforeEach(async () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      status: 200,
      json: async () => ({session: mockSession}),
    });

    await act(async () =>
      await render(<Session><TestComponent/></Session>))
  });

  test('the session api is called', () => {
    expect(global.fetch).toHaveBeenCalledWith("/api/auth/session");
  });

  test('the session data is available', () => {
    expect(screen.getByText(JSON.stringify(mockSession))).toBeVisible();
  });
});
