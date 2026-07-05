import { useEffect, useState } from "react";

/**
 * Tracks the bottom inset caused by mobile virtual keyboards via the Visual Viewport API.
 * Apply to sticky chat footers so the input stays above the keyboard.
 */
export function useVisualViewportInset(): number {
  const [bottomInset, setBottomInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const updateInset = () => {
      const inset = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
      setBottomInset(inset);
    };

    updateInset();
    viewport.addEventListener("resize", updateInset);
    viewport.addEventListener("scroll", updateInset);

    return () => {
      viewport.removeEventListener("resize", updateInset);
      viewport.removeEventListener("scroll", updateInset);
    };
  }, []);

  return bottomInset;
}
