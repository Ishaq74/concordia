/**
 * initMarkdownEditors — Initialize all EasyMDE instances on the page.
 * Call this once from DOMContentLoaded.
 *
 * Looks for [data-md-editor] wrappers and initializes EasyMDE on the textarea inside.
 * Supports image upload via /api/admin/blog/media (saves to public/uploads/blog/).
 * Returns a Map<string, EasyMDE> keyed by textarea id for programmatic access.
 */

import EasyMDE from "easymde";
import "easymde/dist/easymde.min.css";

// The toolbar type from EasyMDE Options
type ToolbarItem = "|" | EasyMDE.ToolbarIcon | EasyMDE.ToolbarDropdownIcon
  | "bold" | "italic" | "strikethrough" | "heading" | "code" | "quote"
  | "unordered-list" | "ordered-list" | "link" | "image" | "upload-image"
  | "table" | "horizontal-rule" | "preview" | "side-by-side" | "fullscreen"
  | "guide" | "undo" | "redo" | "clean-block"
  | "heading-bigger" | "heading-smaller" | "heading-1" | "heading-2" | "heading-3";

function makeImageButton(uploadFn: (editor: EasyMDE) => void): EasyMDE.ToolbarIcon {
  return {
    name: "upload-image",
    action: uploadFn,
    className: "upload-image",
    title: "Insérer une image (upload)",
  };
}

export function initMarkdownEditors(): Map<string, EasyMDE> {
  const editors = new Map<string, EasyMDE>();
  const wrappers = document.querySelectorAll<HTMLElement>("[data-md-editor]");

  wrappers.forEach((wrapper) => {
    const textareaId = wrapper.dataset.mdEditor!;
    const isMinimal = wrapper.dataset.mdMinimal === "true";
    const textarea = wrapper.querySelector<HTMLTextAreaElement>("textarea");
    if (!textarea) return;

    const imgBtn = makeImageButton(triggerImageUpload);

    const fullToolbar: ToolbarItem[] = [
      "bold",
      "italic",
      "strikethrough",
      "heading",
      "|",
      "quote",
      "unordered-list",
      "ordered-list",
      "horizontal-rule",
      "|",
      "link",
      imgBtn,
      "table",
      "code",
      "|",
      "preview",
      "side-by-side",
      "fullscreen",
      "|",
      "guide",
    ];

    const minimalToolbar: ToolbarItem[] = [
      "bold",
      "italic",
      "heading",
      "|",
      "unordered-list",
      "link",
      imgBtn,
      "|",
      "preview",
    ];

    const mde = new EasyMDE({
      element: textarea,
      toolbar: isMinimal ? minimalToolbar : fullToolbar,
      autoDownloadFontAwesome: false,
      spellChecker: false,
      autofocus: false,
      status: isMinimal ? false : ["lines", "words", "cursor"],
      placeholder: textarea.placeholder || "",
      minHeight: isMinimal ? "120px" : "300px",
      maxHeight: isMinimal ? "300px" : undefined,
      sideBySideFullscreen: false,
      renderingConfig: {
        singleLineBreaks: false,
        codeSyntaxHighlighting: false,
      },
      shortcuts: {
        drawImage: null,
      },
    });

    editors.set(textareaId, mde);
  });

  return editors;
}

/**
 * Get the markdown value from an editor instance.
 * Falls back to textarea value if editor not found.
 */
export function getEditorValue(
  editors: Map<string, EasyMDE>,
  id: string
): string {
  const editor = editors.get(id);
  if (editor) return editor.value();
  const el = document.getElementById(id) as HTMLTextAreaElement | null;
  return el?.value ?? "";
}

/**
 * Trigger media picker (if available) or fallback to file input,
 * then insert markdown image syntax at cursor.
 */
async function triggerImageUpload(editor: EasyMDE) {
  // Try the media picker modal first (available on pages that include MediaPickerModal)
  const pickerOverlay = document.getElementById("media-picker-overlay");
  if (pickerOverlay) {
    try {
      const { openMediaPicker } = await import("@lib/admin/media-picker");
      const result = await openMediaPicker();
      if (result) {
        const cm = editor.codemirror;
        const cursor = cm.getCursor();
        const md = `![image](${result.url})`;
        cm.replaceRange(md, cursor);
      }
      return;
    } catch {
      // Fall through to file input fallback
    }
  }

  // Fallback: direct file input upload
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml";
  input.style.display = "none";
  document.body.appendChild(input);

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) {
      input.remove();
      return;
    }

    // Insert placeholder while uploading
    const cm = editor.codemirror;
    const cursor = cm.getCursor();
    const placeholder = `![Uploading ${file.name}…]()`;
    cm.replaceRange(placeholder, cursor);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/blog/media", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();

      if (data.ok && data.url) {
        const content = editor.value();
        const replacement = `![${file.name}](${data.url})`;
        editor.value(content.replace(placeholder, replacement));
      } else {
        editor.value(editor.value().replace(placeholder, ""));
        alert(`Erreur upload : ${data.error || "Inconnue"}`);
      }
    } catch {
      editor.value(editor.value().replace(placeholder, ""));
      alert("Erreur réseau lors de l'upload de l'image.");
    }

    input.remove();
  });

  input.click();
}
