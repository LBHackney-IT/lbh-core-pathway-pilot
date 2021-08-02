import { useRouter } from 'next/router';
import { useEffect } from 'react';

const useWarnUnsavedChanges = (unsavedChanges: boolean): void => {
  const message = 'You may have unsaved changes. Do you want to continue?';
  const router = useRouter();

  // adapted from: https://gist.github.com/Tymek/df2021b77fcea20cabaef46bbee8b001
  useEffect(() => {
    const handleBrowserClose = (e: BeforeUnloadEvent) => {
      if (!unsavedChanges) return;
      e.preventDefault();
      return (e.returnValue = message);
    };

    const handleClientRouteChange = () => {
      if (!unsavedChanges) return;
      if (window.confirm(message)) return;
      router?.events.emit('routeChangeError');
      throw 'routeChange aborted.';
    };

    window.addEventListener('beforeunload', handleBrowserClose);
    router?.events.on('routeChangeStart', handleClientRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBrowserClose);
      router?.events.off('routeChangeStart', handleClientRouteChange);
    };
  }, [unsavedChanges, router]);
};

export default useWarnUnsavedChanges;
