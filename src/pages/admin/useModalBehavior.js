import { useEffect } from 'react';

/**
 * Escape closes the modal and the page behind it stops scrolling while it is
 * mounted.
 * @param {function(): void} onClose
 */
// TODO(polish): trap focus inside the modal and give it back to the button
// that opened it.
export default function useModalBehavior(onClose) {
  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);
}
