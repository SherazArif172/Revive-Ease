/**
 * Defer ResizeObserver callbacks to the next animation frame to prevent
 * "ResizeObserver loop completed with undelivered notifications" when e.g.
 * the filter datepicker calendar opens downward and user clicks prev/next month.
 * Must be imported before any component that uses ResizeObserver.
 */
const NativeResizeObserver = typeof window !== "undefined" && window.ResizeObserver;
if (NativeResizeObserver) {
  window.ResizeObserver = class ResizeObserver extends NativeResizeObserver {
    constructor(callback) {
      super((entries, observer) => {
        requestAnimationFrame(() => {
          callback(entries, observer);
        });
      });
    }
  };
}
