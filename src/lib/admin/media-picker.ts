/**
 * media-picker.ts — Client-side logic for the MediaPickerModal.
 *
 * Usage:
 *   import { openMediaPicker } from "@lib/admin/media-picker";
 *   const result = await openMediaPicker();
 *   if (result) { console.log(result.id, result.url); }
 */

export interface MediaPickerResult {
  id: string;
  url: string;
}

interface MediaItem {
  id: string;
  url: string;
  type: string;
  encodingFormat: string | null;
  createdAt: string;
}

interface MediaListResponse {
  media: MediaItem[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

let currentResolve: ((value: MediaPickerResult | null) => void) | null = null;
let currentPage = 1;
let currentSearch = "";
let selectedItem: MediaItem | null = null;
let pendingFile: File | null = null; // File waiting to be uploaded (after user fills metadata)
let isInitialized = false;
let currentApiBase = "/api/admin/blog/media"; // default, overridable per-call

function getEl<T extends HTMLElement>(id: string): T | null {
  return document.getElementById(id) as T | null;
}

export interface MediaPickerOptions {
  /** Which tab to show initially: "library" (default) or "upload" */
  initialTab?: "library" | "upload";
  /** A file to show metadata form for before uploading (e.g. from drag & drop or file input) */
  file?: File;
  /** Base API endpoint for media. Default: "/api/admin/blog/media". Use "/api/admin/services/media" for services. */
  apiBase?: string;
}

/**
 * Open the media picker modal. Returns a Promise that resolves with { id, url } or null.
 */
export function openMediaPicker(options?: MediaPickerOptions): Promise<MediaPickerResult | null> {
  return new Promise((resolve) => {
    currentResolve = resolve;
    selectedItem = null;
    currentPage = 1;
    currentSearch = "";

    const { initialTab = "library", file, apiBase = "/api/admin/blog/media" } = options || {};
    currentApiBase = apiBase;

    const overlay = getEl<HTMLDivElement>("media-picker-overlay");
    if (!overlay) {
      console.error("[media-picker] Modal overlay not found. Did you include <MediaPickerModal />?");
      resolve(null);
      return;
    }

    // Reset state
    const searchInput = getEl<HTMLInputElement>("mp-search");
    if (searchInput) searchInput.value = "";

    const selectBtn = getEl<HTMLButtonElement>("mp-btn-select");
    if (selectBtn) selectBtn.disabled = true;

    // Show requested tab
    switchTab(file ? "upload" : initialTab);

    // Show overlay
    overlay.style.display = "flex";
    document.body.style.overflow = "hidden";

    // Initialize event listeners once
    if (!isInitialized) {
      initListeners();
      isInitialized = true;
    }

    // Load library content
    loadLibrary();

    // If a file was provided, show metadata form (upload happens later on confirm)
    if (file) {
      setTimeout(() => showMetaFormForFile(file), 100);
    }
  });
}

function closeModal(result: MediaPickerResult | null = null) {
  const overlay = getEl<HTMLDivElement>("media-picker-overlay");
  if (overlay) overlay.style.display = "none";
  document.body.style.overflow = "";
  selectedItem = null;

  if (currentResolve) {
    currentResolve(result);
    currentResolve = null;
  }
}

function switchTab(tabName: string) {
  const tabs = document.querySelectorAll<HTMLElement>(".mp-tab");
  const panels = document.querySelectorAll<HTMLElement>(".mp-panel");

  tabs.forEach((t) => {
    const isActive = t.dataset.mpTab === tabName;
    t.classList.toggle("active", isActive);
    t.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  panels.forEach((p) => {
    p.classList.toggle("active", p.id === `mp-panel-${tabName}`);
  });
}

function initListeners() {
  // Close buttons
  getEl("mp-close")?.addEventListener("click", () => closeModal(null));
  getEl("mp-btn-cancel")?.addEventListener("click", () => closeModal(null));

  // Close on overlay click
  getEl("media-picker-overlay")?.addEventListener("click", (e) => {
    if ((e.target as HTMLElement).id === "media-picker-overlay") closeModal(null);
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && getEl("media-picker-overlay")?.style.display === "flex") {
      closeModal(null);
    }
  });

  // Tabs
  document.querySelectorAll<HTMLElement>(".mp-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.dataset.mpTab;
      if (tabName) switchTab(tabName);
    });
  });

  // Search (debounced)
  let searchTimer: ReturnType<typeof setTimeout>;
  getEl<HTMLInputElement>("mp-search")?.addEventListener("input", (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentSearch = (e.target as HTMLInputElement).value.trim();
      currentPage = 1;
      loadLibrary();
    }, 300);
  });

  // Select button
  getEl("mp-btn-select")?.addEventListener("click", () => {
    if (selectedItem) {
      closeModal({ id: selectedItem.id, url: selectedItem.url });
    }
  });

  // Upload zone interactions
  const uploadZone = getEl("mp-upload-zone");
  uploadZone?.addEventListener("dragover", (e) => { e.preventDefault(); uploadZone.classList.add("dragover"); });
  uploadZone?.addEventListener("dragleave", () => uploadZone.classList.remove("dragover"));
  uploadZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");
    const file = (e as DragEvent).dataTransfer?.files[0];
    if (file) showMetaFormForFile(file);
  });

  getEl<HTMLInputElement>("mp-file-input")?.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) showMetaFormForFile(file);
  });

  // Pre-upload metadata: skip (upload with original filename, no metadata)
  getEl("mp-btn-skip-meta")?.addEventListener("click", async () => {
    if (pendingFile) {
      await doUpload(pendingFile, null, null, null, null);
    }
  });

  // Pre-upload metadata: save & upload with metadata
  getEl("mp-btn-save-meta")?.addEventListener("click", async () => {
    if (!pendingFile) return;
    const customName = getEl<HTMLInputElement>("mp-meta-filename")?.value.trim() || null;
    const alt = getEl<HTMLInputElement>("mp-meta-alt")?.value.trim() || null;
    const caption = getEl<HTMLInputElement>("mp-meta-caption")?.value.trim() || null;
    const description = getEl<HTMLTextAreaElement>("mp-meta-description")?.value.trim() || null;

    await doUpload(pendingFile, customName, alt, caption, description);
  });
}

async function loadLibrary() {
  const grid = getEl("mp-grid");
  if (!grid) return;

  grid.innerHTML = '<div class="mp-loading">Chargement…</div>';

  try {
    const params = new URLSearchParams({
      page: String(currentPage),
      perPage: "24",
      type: "image",
    });
    if (currentSearch) params.set("q", currentSearch);

    const res = await fetch(`${currentApiBase}?${params}`);
    const data: MediaListResponse = await res.json();

    if (data.media.length === 0) {
      grid.innerHTML = '<div class="mp-empty">Aucun média trouvé.</div>';
      renderPagination(data);
      return;
    }

    grid.innerHTML = "";
    data.media.forEach((item) => {
      const div = document.createElement("div");
      div.className = "mp-grid-item";
      div.dataset.mediaId = item.id;
      div.dataset.mediaUrl = item.url;

      const filename = item.url.split("/").pop() || item.id;

      div.innerHTML = `
        <img src="${item.url}" alt="${filename}" loading="lazy" />
        <span class="mp-check">✓</span>
        <span class="mp-item-name">${filename}</span>
      `;

      div.addEventListener("click", () => selectGridItem(div, item));
      grid.appendChild(div);
    });

    renderPagination(data);
  } catch {
    grid.innerHTML = '<div class="mp-empty">Erreur de chargement.</div>';
  }
}

function selectGridItem(div: HTMLElement, item: MediaItem) {
  // Deselect previous
  document.querySelectorAll(".mp-grid-item.selected").forEach((el) => el.classList.remove("selected"));

  // Select this one
  div.classList.add("selected");
  selectedItem = item;

  const selectBtn = getEl<HTMLButtonElement>("mp-btn-select");
  if (selectBtn) selectBtn.disabled = false;
}

function renderPagination(data: MediaListResponse) {
  const container = getEl("mp-pagination");
  if (!container) return;

  if (data.totalPages <= 1) {
    container.innerHTML = `<span class="mp-page-info">${data.total} média${data.total > 1 ? "s" : ""}</span>`;
    return;
  }

  let html = "";

  // Prev button
  html += `<button class="mp-page-btn" data-page="${data.page - 1}" ${data.page <= 1 ? "disabled" : ""}>‹</button>`;

  // Page buttons (show max 5 around current)
  const start = Math.max(1, data.page - 2);
  const end = Math.min(data.totalPages, data.page + 2);
  for (let i = start; i <= end; i++) {
    html += `<button class="mp-page-btn ${i === data.page ? "active" : ""}" data-page="${i}">${i}</button>`;
  }

  // Next button
  html += `<button class="mp-page-btn" data-page="${data.page + 1}" ${data.page >= data.totalPages ? "disabled" : ""}>›</button>`;

  html += `<span class="mp-page-info">${data.total} média${data.total > 1 ? "s" : ""}</span>`;

  container.innerHTML = html;

  // Attach page click handlers
  container.querySelectorAll<HTMLButtonElement>(".mp-page-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const page = parseInt(btn.dataset.page || "1");
      if (page >= 1 && page <= data.totalPages) {
        currentPage = page;
        selectedItem = null;
        const selectBtn = getEl<HTMLButtonElement>("mp-btn-select");
        if (selectBtn) selectBtn.disabled = true;
        loadLibrary();
      }
    });
  });
}

/**
 * Show the metadata form BEFORE uploading.
 * Creates a local preview via URL.createObjectURL and pre-fills the filename.
 */
function showMetaFormForFile(file: File) {
  pendingFile = file;

  const uploadZone = getEl("mp-upload-zone");
  const progress = getEl("mp-upload-progress");
  const metaForm = getEl("mp-upload-meta");
  const previewImg = getEl<HTMLImageElement>("mp-meta-preview-img");
  const filenameInput = getEl<HTMLInputElement>("mp-meta-filename");
  const extSpan = getEl("mp-meta-ext");

  if (uploadZone) uploadZone.style.display = "none";
  if (progress) progress.style.display = "none";
  if (metaForm) metaForm.style.display = "flex";

  // Local preview (no upload yet)
  if (previewImg) {
    previewImg.src = URL.createObjectURL(file);
  }

  // Split filename into name and extension
  const parts = file.name.split(".");
  const ext = parts.length > 1 ? parts.pop()! : "";
  const nameWithoutExt = parts.join(".");
  // Slugify the original filename for a clean default
  const slugified = nameWithoutExt
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (filenameInput) filenameInput.value = slugified;
  if (extSpan) extSpan.textContent = `.${ext}`;

  // Clear other fields
  const altInput = getEl<HTMLInputElement>("mp-meta-alt");
  const captionInput = getEl<HTMLInputElement>("mp-meta-caption");
  const descInput = getEl<HTMLTextAreaElement>("mp-meta-description");
  if (altInput) altInput.value = "";
  if (captionInput) captionInput.value = "";
  if (descInput) descInput.value = "";

  // Focus filename field
  setTimeout(() => filenameInput?.focus(), 100);
}

/**
 * Actually upload the file with optional metadata + custom filename.
 */
async function doUpload(
  file: File,
  customName: string | null,
  alt: string | null,
  caption: string | null,
  description: string | null
) {
  const metaForm = getEl("mp-upload-meta");
  const progress = getEl("mp-upload-progress");
  const progressFill = getEl("mp-progress-fill");
  const progressText = getEl("mp-progress-text");
  const saveBtn = getEl<HTMLButtonElement>("mp-btn-save-meta");
  const skipBtn = getEl<HTMLButtonElement>("mp-btn-skip-meta");

  // Disable buttons during upload
  if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = "Upload en cours…"; }
  if (skipBtn) skipBtn.disabled = true;

  // Show progress
  if (metaForm) metaForm.style.display = "none";
  if (progress) progress.style.display = "flex";
  if (progressFill) progressFill.style.width = "30%";
  if (progressText) progressText.textContent = "Upload en cours…";

  try {
    const fd = new FormData();
    fd.append("file", file);
    if (customName) fd.append("customName", customName);
    if (alt) fd.append("alt", alt);
    if (caption) fd.append("caption", caption);
    if (description) fd.append("description", description);

    if (progressFill) progressFill.style.width = "60%";

    const res = await fetch(currentApiBase, { method: "POST", body: fd });
    const data = await res.json();

    if (progressFill) progressFill.style.width = "100%";

    if (data.ok && data.url) {
      if (progressText) progressText.textContent = "Upload réussi !";
      pendingFile = null;

      setTimeout(() => {
        resetButtons();
        hideMetaForm();
        resetUploadUI();
        closeModal({ id: data.id, url: data.url });
      }, 400);
    } else {
      if (progressText) progressText.textContent = `Erreur : ${data.error || "Inconnue"}`;
      setTimeout(() => {
        resetButtons();
        // Go back to meta form so user can retry
        if (progress) progress.style.display = "none";
        if (metaForm) metaForm.style.display = "flex";
      }, 2000);
    }
  } catch {
    if (progressText) progressText.textContent = "Erreur réseau.";
    setTimeout(() => {
      resetButtons();
      if (progress) progress.style.display = "none";
      if (metaForm) metaForm.style.display = "flex";
    }, 2000);
  }
}

function resetButtons() {
  const saveBtn = getEl<HTMLButtonElement>("mp-btn-save-meta");
  const skipBtn = getEl<HTMLButtonElement>("mp-btn-skip-meta");
  if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = "Uploader & sélectionner"; }
  if (skipBtn) skipBtn.disabled = false;
}

function hideMetaForm() {
  const metaForm = getEl("mp-upload-meta");
  if (metaForm) metaForm.style.display = "none";
}

function resetUploadUI() {
  const progress = getEl("mp-upload-progress");
  const progressFill = getEl("mp-progress-fill");
  const uploadZone = getEl("mp-upload-zone");
  const fileInput = getEl<HTMLInputElement>("mp-file-input");

  if (progress) progress.style.display = "none";
  if (progressFill) progressFill.style.width = "0%";
  if (uploadZone) uploadZone.style.display = "flex";
  if (fileInput) fileInput.value = "";
  pendingFile = null;
}
