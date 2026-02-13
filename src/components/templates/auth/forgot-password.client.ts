type CardDataset = {
  translations?: string;
  cooldown?: string;
  lastEmail?: string;
};

type TranslationStrings = Record<string, string>;

const CARD_SELECTOR = '[data-forgot-password-card="true"]';

const parseTranslations = (raw?: string): TranslationStrings => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const formatCooldown = (template: string | undefined, seconds: number) => {
  const base = template ?? "Vous pourrez redemander un email dans {seconds}s.";
  return base.replace("{seconds}", String(seconds));
};

const getKey = (email: string) => `forgot-password:${email || "global"}`;

const readNextWindow = (key: string) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
};

const writeNextWindow = (key: string, value: number) => {
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* ignore quota errors */
  }
};

const setButtonLabel = (label: HTMLElement | null, text: string) => {
  if (label) label.textContent = text;
};

const toggleSpinner = (spinner: HTMLElement | null, show: boolean) => {
  if (!spinner) return;
  spinner.classList.toggle("hidden", !show);
};

const initCard = (container: HTMLElement) => {
  const dataset = container.dataset as unknown as CardDataset;
  const translations = parseTranslations(dataset.translations);
  const cooldownMs = Number(dataset.cooldown ?? "30000") || 30000;
  const form = container.querySelector<HTMLFormElement>('form[data-role="forgot-form"]');
  const button = container.querySelector<HTMLButtonElement>('[data-role="submit-button"]');
  const spinner = container.querySelector<HTMLElement>('[data-role="submit-spinner"]');
  const label = container.querySelector<HTMLElement>('[data-role="submit-label"]');
  const cooldownText = container.querySelector<HTMLElement>('[data-role="cooldown-text"]');
  const emailInput = form?.querySelector<HTMLInputElement>('input[name="email"]');

  if (!form || !button || !label || !cooldownText || !emailInput) {
    return;
  }

  const defaultLabel = translations.cta ?? label.textContent ?? "Envoyer";
  const readyMessage = translations.ready ?? "";
  let isSubmitting = false;

  const computeKey = () => {
    const email = emailInput.value.trim().toLowerCase();
    return getKey(email);
  };

  const updateCooldown = () => {
    const key = computeKey();
    const remainingSeconds = Math.max(0, Math.ceil((readNextWindow(key) - Date.now()) / 1000));

    if (remainingSeconds > 0) {
      button.disabled = true;
      if (!isSubmitting) {
        setButtonLabel(label, `${defaultLabel} (${remainingSeconds}s)`);
      }
      cooldownText.textContent = formatCooldown(translations.cooldown, remainingSeconds);
    } else {
      button.disabled = false;
      if (!isSubmitting) {
        setButtonLabel(label, defaultLabel);
      }
      cooldownText.textContent = readyMessage;
    }
  };

  const handleInput = () => {
    isSubmitting = false;
    toggleSpinner(spinner, false);
    updateCooldown();
  };

  const handleSubmit = () => {
    const key = computeKey();
    writeNextWindow(key, Date.now() + cooldownMs);
    isSubmitting = true;
    button.disabled = true;
    toggleSpinner(spinner, true);
    setButtonLabel(label, translations.sending ?? "Envoi...");
  };

  emailInput.addEventListener("input", handleInput);
  form.addEventListener("submit", handleSubmit);

  updateCooldown();
  const interval = window.setInterval(updateCooldown, 500);
  window.addEventListener(
    "pagehide",
    () => {
      window.clearInterval(interval);
    },
    { once: true }
  );
};

const initAll = () => {
  document.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach(initCard);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAll, { once: true });
} else {
  initAll();
}
