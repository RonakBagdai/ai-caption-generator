import { useEffect, useCallback } from "react";

const useKeyboardShortcuts = (shortcuts) => {
  const handleKeyDown = useCallback(
    (event) => {
      // Check if we're in an input field
      const isInputField =
        ["INPUT", "TEXTAREA", "SELECT"].includes(event.target.tagName) ||
        event.target.contentEditable === "true";

      // Don't trigger shortcuts when typing in input fields (unless specifically allowed)
      if (isInputField && !event.ctrlKey && !event.metaKey) {
        return;
      }

      const key = event.key.toLowerCase();
      const ctrlOrCmd = event.ctrlKey || event.metaKey;
      const shift = event.shiftKey;
      const alt = event.altKey;

      shortcuts.forEach(
        ({ keys, callback, preventDefault = true, allowInInput = false }) => {
          if (!allowInInput && isInputField && !ctrlOrCmd) return;

          const keyMatch = Array.isArray(keys)
            ? keys.includes(key)
            : keys === key;
          const modifiers = {
            ctrl: ctrlOrCmd,
            shift,
            alt,
          };

          if (keyMatch) {
            let shouldTrigger = true;

            // Check modifier requirements
            if (callback.modifiers) {
              Object.keys(callback.modifiers).forEach((mod) => {
                if (modifiers[mod] !== callback.modifiers[mod]) {
                  shouldTrigger = false;
                }
              });
            }

            if (shouldTrigger) {
              if (preventDefault) {
                event.preventDefault();
              }
              callback.action(event);
            }
          }
        }
      );
    },
    [shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
