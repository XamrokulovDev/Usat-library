import { useEffect } from "react";

export const ClearTokenOnClose = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const clearTokenIfTabReallyCloses = () => {
      const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const isReload = nav && nav.type === "reload";

      if (!isReload) {
        localStorage.removeItem(`token`);
      }
    };

    window.addEventListener("pagehide", clearTokenIfTabReallyCloses);
    window.addEventListener("beforeunload", clearTokenIfTabReallyCloses);

    return () => {
      window.removeEventListener("pagehide", clearTokenIfTabReallyCloses);
      window.removeEventListener("beforeunload", clearTokenIfTabReallyCloses);
    };
  }, []);

  return <>{children}</>;
};