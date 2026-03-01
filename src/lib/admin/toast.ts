/**
 * toast.ts — Global toast notification system for admin pages.
 * Generates markup that matches the Alert component (Alert.astro)
 * and reuses its design-system tokens (--alert-*, etc.).
 *
 * Usage:
 *   import { showToast } from "@lib/admin/toast";
 *   showToast("Article enregistré avec succès !", "success");
 *   showToast("Erreur serveur", "error");
 *   showToast("Attention, champ manquant", "warning");
 *   showToast("3 fichiers importés", "info");
 *
 * Options:
 *   showToast(message, type, { title, duration, onClose })
 */

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  /** Optional title displayed in bold above the message */
  title?: string;
  /** Duration in ms before auto-dismiss (default: 4000, 0 = manual close only) */
  duration?: number;
  /** Callback when toast is dismissed */
  onClose?: () => void;
}

/**
 * SVG icons matching the Alert component's mdi icons:
 * success → mdi:check-circle, error → mdi:alert-circle,
 * warning → mdi:alert, info → mdi:information
 */
const ICONS: Record<ToastType, string> = {
  success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2m-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9Z"/></svg>`,
  error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2m1 15h-2v-2h2v2m0-4h-2V7h2v6Z"/></svg>`,
  warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2L1 21Z"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10 10 10 0 0 0 10-10A10 10 0 0 0 12 2Z"/></svg>`,
};

/** Map toast types to Alert component data-status values */
const STATUS_MAP: Record<ToastType, string> = {
  success: "success",
  error: "error",
  warning: "warning",
  info: "info",
};

const DEFAULT_DURATIONS: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  warning: 5000,
  info: 4000,
};

/**
 * Show a toast notification using the Alert component's markup and tokens.
 */
export function showToast(
  message: string,
  type: ToastType = "info",
  options: ToastOptions = {}
): void {
  const container = document.getElementById("admin-toast-container");
  if (!container) {
    // Fallback: native alert for error, console for others
    if (type === "error") alert(message);
    else console.info(`[toast:${type}] ${message}`);
    return;
  }

  const {
    title,
    duration = DEFAULT_DURATIONS[type],
    onClose,
  } = options;

  const status = STATUS_MAP[type];

  // Build Alert-compatible markup: <div class="alert {status}" data-status="{status}" role="alert">
  const toast = document.createElement("div");
  toast.className = `alert ${status}`;
  toast.dataset.status = status;
  toast.setAttribute("role", "alert");
  toast.style.position = "relative";
  toast.style.overflow = "hidden";

  const titleHtml = title ? `<strong>${escapeHTML(title)}</strong> ` : "";

  toast.innerHTML = `
    ${ICONS[type]}
    <div>${titleHtml}${escapeHTML(message)}</div>
    <button type="button" class="alert-close" aria-label="Fermer l'alerte">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41Z"/></svg>
    </button>
    ${duration > 0 ? `<div class="alert-progress" style="animation-duration: ${duration}ms;"></div>` : ""}
  `;

  // Close button
  const closeBtn = toast.querySelector<HTMLButtonElement>(".alert-close")!;
  const dismiss = () => {
    toast.classList.add("toast-exiting");
    toast.addEventListener("animationend", () => {
      toast.remove();
      onClose?.();
    });
  };
  closeBtn.addEventListener("click", dismiss);

  // Auto-dismiss
  if (duration > 0) {
    setTimeout(dismiss, duration);
  }

  container.appendChild(toast);
}

/**
 * Convenience helpers
 */
export function toastSuccess(message: string, options?: ToastOptions) {
  showToast(message, "success", options);
}

export function toastError(message: string, options?: ToastOptions) {
  showToast(message, "error", options);
}

export function toastWarning(message: string, options?: ToastOptions) {
  showToast(message, "warning", options);
}

export function toastInfo(message: string, options?: ToastOptions) {
  showToast(message, "info", options);
}

function escapeHTML(str: string): string {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
