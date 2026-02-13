import { authClient } from "@lib/auth/auth-client";

type CardDataset = {
  email?: string;
  callback?: string;
  translations?: string;
  cooldown?: string;
};

type TranslationStrings = Record<string, string>;

const CARD_SELECTOR = '[data-verify-email-card="true"]';

const parseTranslations = (raw: string | undefined): TranslationStrings => {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const formatCooldown = (translations: TranslationStrings, seconds: number) =>
  (translations.cooldown ?? "Vous pourrez renvoyer un email dans {seconds}s.").replace("{seconds}", String(seconds));

const setButtonLabel = (label: HTMLElement | null, text: string) => {
  if (label) label.textContent = text;
};

const toggleSpinner = (spinner: HTMLElement | null, show: boolean) => {
  if (!spinner) return;
  spinner.classList.toggle("hidden", !show);
};

const setAlert = (alertBox: HTMLElement | null, variant: string, message: string) => {
  if (!alertBox) return;
  if (!message) {
    alertBox.style.display = "none";
    alertBox.textContent = "";
    return;
  }
  alertBox.style.display = "";
  alertBox.textContent = message;
  alertBox.setAttribute("variant", variant);
};

const readNextWindow = (key: string | null) => {
  if (!key) return 0;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? Number(raw) || 0 : 0;
  } catch {
    return 0;
  }
};

const writeNextWindow = (key: string | null, value: number) => {
  if (!key) return;
  try {
    window.localStorage.setItem(key, String(value));
  } catch {
    /* ignore quota errors */
  }
};

const initCard = (container: HTMLElement) => {
  const dataset = container.dataset as unknown as CardDataset;
  const email = dataset.email ?? "";
  const callbackURL = dataset.callback ?? "/";
  const translations = parseTranslations(dataset.translations);
  const cooldownMs = Number(dataset.cooldown ?? 30000) || 30000;
  const button = container.querySelector<HTMLButtonElement>('[data-role="resend-button"]');
  const alertBox = container.querySelector<HTMLElement>('[data-role="verify-alert"]');
  const cooldownText = container.querySelector<HTMLElement>('[data-role="cooldown-text"]');
  const spinner = container.querySelector<HTMLElement>('[data-role="resend-spinner"]');
  const label = container.querySelector<HTMLElement>('[data-role="resend-label"]');

  if (!button || !cooldownText) return;

  const cooldownKey = email ? `verify-email-cooldown:${email.toLowerCase()}` : null;
  let nextWindow = readNextWindow(cooldownKey);
  let isSending = false;
  const defaultLabel = translations.cta ?? "Renvoyer l'email de vérification";

  const updateCooldown = () => {
    if (!email) {
      button.disabled = true;
      if (!isSending) setButtonLabel(label, defaultLabel);
      cooldownText.textContent = translations.missingEmail ?? "";
      return;
    }
    const remaining = Math.max(0, Math.ceil((nextWindow - Date.now()) / 1000));
    if (remaining > 0) {
      button.disabled = true;
      if (!isSending) setButtonLabel(label, `${defaultLabel} (${remaining}s)`);
      cooldownText.textContent = formatCooldown(translations, remaining);
    } else {
      button.disabled = false;
      if (!isSending) setButtonLabel(label, defaultLabel);
      cooldownText.textContent = translations.ready ?? "";
    }
  };

  setButtonLabel(label, defaultLabel);
  updateCooldown();
  const interval = window.setInterval(updateCooldown, 500);

  button.addEventListener("click", async () => {
    if (!email || isSending) return;
    button.disabled = true;
    isSending = true;
    toggleSpinner(spinner, true);
    setButtonLabel(label, translations.sending ?? "Envoi...");
    setAlert(alertBox, "info", translations.sending ?? "Envoi...");
    try {
      await authClient.sendVerificationEmail({ email, callbackURL });
      nextWindow = Date.now() + cooldownMs;
      writeNextWindow(cooldownKey, nextWindow);
      setAlert(alertBox, "success", translations.success ?? "");
    } catch (error) {
      nextWindow = 0;
      writeNextWindow(cooldownKey, nextWindow);
      setAlert(alertBox, "error", translations.error ?? "");
    } finally {
      isSending = false;
      toggleSpinner(spinner, false);
      updateCooldown();
    }
  });

  const cleanup = () => window.clearInterval(interval);
  window.addEventListener("pagehide", cleanup, { once: true });
};

const initAllCards = () => {
  document.querySelectorAll<HTMLElement>(CARD_SELECTOR).forEach(initCard);
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initAllCards, { once: true });
} else {
  initAllCards();
}
