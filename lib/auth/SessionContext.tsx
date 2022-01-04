import {createContext, FunctionComponent, useEffect, useState} from "react";
import {useRouter} from "next/router";
import FullPageSpinner from "../../components/FullPageSpinner";
import {UserSession} from "./types";

export const SessionContext = createContext<UserSession>(null);

export const getFrontendLoginUrl = (url: string = null): string =>
  `${process.env.NEXT_PUBLIC_HACKNEY_AUTH_SERVER_URL}?redirect_uri=${url ? url : window.location.toString()}`;

export const Session: FunctionComponent = ({children}) => {
  const router = useRouter();
  const [session, setSession] = useState();

  useEffect(
    () => {
      fetch('/api/auth/session')
        .then(r => r.status === 200 ? r.json() : router.replace(getFrontendLoginUrl()))
        .then(r => setSession(r?.session))
        .catch((e) => console.error(e))
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return session ? (
    <SessionContext.Provider value={session}>
      {children}
    </SessionContext.Provider>
  ) : (<FullPageSpinner />)
}

