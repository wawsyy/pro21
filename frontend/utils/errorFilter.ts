/**
 * Filter out expected errors that don't affect functionality
 * These are mainly RainbowKit Analytics SDK errors caused by COEP headers
 */

// Store original console methods
const originalError = console.error;
const originalWarn = console.warn;

// Patterns to filter out
const FILTERED_ERROR_PATTERNS = [
  /Analytics SDK/i,
  /Failed to fetch.*coinbase/i,
  /ERR_BLOCKED_BY_RESPONSE.*NotSameOriginAfterDefaultedToSameOriginByCoep/i,
  /cca-lite\.coinbase\.com/i,
  /coinbase.*analytics/i,
  /AnalyticsSDKApiError/i,
  // FHEVM mock mode event parsing errors (these are expected in mock mode)
  /Parse event.*backward order/i,
  /could not coalesce error/i,
];

const FILTERED_WARN_PATTERNS = [
  /Analytics SDK/i,
];

/**
 * Check if an error message should be filtered
 */
function shouldFilterError(...args: unknown[]): boolean {
  const message = args
    .map((arg) => {
      if (typeof arg === "string") return arg;
      if (arg instanceof Error) return arg.message;
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");

  return FILTERED_ERROR_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Check if a warning message should be filtered
 */
function shouldFilterWarn(...args: unknown[]): boolean {
  const message = args
    .map((arg) => {
      if (typeof arg === "string") return arg;
      if (arg instanceof Error) return arg.message;
      if (typeof arg === "object" && arg !== null) {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(" ");

  return FILTERED_WARN_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Filter console.error to suppress expected errors
 */
export function filterConsoleErrors() {
  console.error = (...args: unknown[]) => {
    if (!shouldFilterError(...args)) {
      originalError.apply(console, args);
    }
  };
}

/**
 * Filter console.warn to suppress expected warnings
 */
export function filterConsoleWarnings() {
  console.warn = (...args: unknown[]) => {
    if (!shouldFilterWarn(...args)) {
      originalWarn.apply(console, args);
    }
  };
}

/**
 * Initialize error filtering
 */
export function initErrorFiltering() {
  if (typeof window !== "undefined") {
    filterConsoleErrors();
    filterConsoleWarnings();

    // Also filter unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      const message = event.reason?.message || String(event.reason || "");
      if (shouldFilterError(message)) {
        event.preventDefault();
        return;
      }
    });

    // Filter error events
    window.addEventListener("error", (event) => {
      const message = event.message || "";
      const filename = event.filename || "";
      const combinedMessage = `${message} ${filename}`;
      if (shouldFilterError(combinedMessage)) {
        event.preventDefault();
        return;
      }
    }, true); // Use capture phase to catch errors early

    // Filter network errors in console
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        return await originalFetch.apply(window, args);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Handle different types of fetch first argument: string | Request | URL
        let url = "";
        if (typeof args[0] === "string") {
          url = args[0];
        } else if (args[0] instanceof Request) {
          url = args[0].url;
        } else if (args[0] instanceof URL) {
          url = args[0].toString();
        } else if (args[0] && typeof args[0] === "object" && "url" in args[0]) {
          url = String((args[0] as { url?: string }).url || "");
        }
        if (shouldFilterError(`${errorMessage} ${url}`)) {
          // Silently ignore filtered errors
          throw new Error("Filtered network error");
        }
        throw error;
      }
    };
  }
}

