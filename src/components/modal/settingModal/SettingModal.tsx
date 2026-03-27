import { useEffect, useState } from 'react';
import { SETTING_MODAL } from '../../../constants/storage';
import App from '../../../App';
import './SettingModal.css';

export default function SettingModal() {
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    chrome.storage.onChanged.addListener(changes => {
      for (const key in changes) {
        const storageChange = changes[key];
        if (SETTING_MODAL === key) {
          setOpen(storageChange.newValue);
        }
      }
    });

    chrome.storage.local.get([SETTING_MODAL], res => {
      if (res[SETTING_MODAL]) {
        setOpen(res[SETTING_MODAL]);
      }
    });
  }, []);

  return (
    <>
      {open && (
        <div className="czp-setting-modal">
          <button
            className="czp-setting-modal-close-btn button_only_icon__kahz5 button_large__oOJou popup_close_button__Gwi1s"
            onClick={() => {
              chrome.storage.local.set({
                [SETTING_MODAL]: false,
              });
            }}
          >
            X
          </button>
          <App />
        </div>
      )}
    </>
  );
}
