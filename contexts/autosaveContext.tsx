import React, {
  useContext,
  createContext,
  useState,
  useCallback,
  useEffect,
} from 'react';
import { useFormikContext } from 'formik';
import debounce from 'lodash/throttle';
import s from './Autosave.module.scss';
import useWarnUnsavedChanges from '../hooks/useWarnUnsavedChanges';

interface ContextType {
  saved: boolean;
  setSaved: (newVal: boolean) => void;
  saving: boolean;
  setSaving: (newVal: boolean) => void;
}

const AutosaveContext = createContext<ContextType>({
  saved: true,
  saving: true,
  setSaved: () => null,
  setSaving: () => null,
});

export const AutosaveProvider = ({
  children,
}: {
  children: React.ReactChild;
}): React.ReactElement => {
  const [saved, setSaved] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(true);

  return (
    <AutosaveContext.Provider value={{ saved, setSaved, saving, setSaving }}>
      {children}
    </AutosaveContext.Provider>
  );
};

export const useAutosave = (): ContextType => useContext(AutosaveContext);

export const AutosaveTrigger = ({ delay = 1000 }: { delay?: number }): null => {
  const { saved, setSaved, setSaving } = useContext(AutosaveContext);

  const { submitForm, validateForm, values, isSubmitting } = useFormikContext();

  const [runCount, setRunCount] = useState(0);

  // keep context in sync with submit status
  useEffect(() => {
    setSaving(!!isSubmitting);
  }, [isSubmitting, setSaving]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSubmit = useCallback(
    debounce(() => {
      return submitForm().then(() => setSaved(true));
    }, delay),
    [submitForm, delay]
  );

  useWarnUnsavedChanges(!saved);

  useEffect(() => {
    // skip first autosave because it's just the form mounting
    if (runCount > 0) {
      setSaved(false);
      validateForm().then((errors) => {
        if (Object.keys(errors).length === 0) {
          debouncedSubmit();
        }
      });
    }
    setRunCount(runCount + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSubmit, values]);

  return null;
};

export const AutosaveIndicator = (): React.ReactElement => {
  const { saved, saving } = useContext(AutosaveContext);

  return (
    <div className={s.outer} role="status" aria-live="polite">
      {saving && (
        <img
          src="/spinner.svg"
          alt=""
          aria-hidden="true"
          className={s.spinner}
        />
      )}
      <p className={`lbh-body-s ${s.text}`}>
        {saved && !saving && 'Changes saved'}
        {!saved && saving && 'Saving changes...'}
        {!saved && !saving && 'Unsaved changes'}
      </p>
    </div>
  );
};

export default AutosaveContext;
