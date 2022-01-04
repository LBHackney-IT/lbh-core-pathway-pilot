import {getFrontendLoginUrl} from "./SessionContext";

export const authenticatedFetch =
  (resource: Request | string, init: RequestInit): Promise<Response> =>
    fetch(resource, init)
      .then((res) => new Promise(resolve => {
        if (res.status !== 401) return resolve(res);

        const windowName = 'loginOpenWindow';

        if (!window[windowName]) {
          window[windowName] = window.open(
            getFrontendLoginUrl(`${window.location.protocol}//${window.location.host}/auth/sign-in`),
            'Login',
          );
        }

        const timer = setInterval(() => {
          if (window[windowName] !== undefined) {
            if (
              window[windowName].closed ||
              window[windowName]?.location.host === window.location.host
            ) {
              delete window[windowName]
              clearInterval(timer);
              fetch(resource, init).then(resolve);
            }
          } else {
            clearInterval(timer);
            fetch(resource, init).then(resolve);
          }
        }, 500);
      }))
