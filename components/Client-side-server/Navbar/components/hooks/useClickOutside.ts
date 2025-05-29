import { useEffect, RefObject } from 'react';

/**
 * Custom hook to detect clicks outside a specified element.
 *
 * @param ref A React ref object pointing to the DOM element to monitor.
 * @param handler A callback function to be executed when a click outside the ref occurs.
 * @param listenCondition A boolean condition. The listener will only be active when this is true.
 */
export const useClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent) => void,
  listenCondition: boolean = true
) => {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    if (listenCondition) {
      document.addEventListener('mousedown', listener);
      // document.addEventListener('touchstart', listener); // Consider for touch devices
    }

    return () => {
      document.removeEventListener('mousedown', listener);
      // document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler, listenCondition]); // Re-run if ref, handler, or listenCondition changes
};