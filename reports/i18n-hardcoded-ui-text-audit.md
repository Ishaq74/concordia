# I18n Hardcoded UI Text Audit — Doc Pages

> Audit date: 2026-03-03  
> Scope: `<li>`, `<p>`, `<span>` tags containing hardcoded **UI text** (best practices, accessibility guidelines, feature lists, sub-component descriptions)  
> Excluded: Demo/example content (names, prices, placeholder data, visual variant descriptions, emoji-only items)

Pattern: `const p = t.docs?.pages?.{pageName} ?? {};`  
Usage: `{p.keyName ?? "fallback"}` or `{d.keyName ?? "fallback"}`

---

## Summary Table

| File | UI `<li>` | UI `<p>` | Total UI items |
|------|-----------|----------|----------------|
| accordion.astro | 5 | 0 | **5** |
| avatar.astro | 9 | 2 | **11** |
| breadcrumb.astro | 10 | 7 | **17** |
| gallery.astro | 4 | 3 | **7** |
| pagination.astro | 13 | 3 | **16** |
| skeleton.astro | 2 | 1 | **3** |
| slider.astro | 21 | 2 | **23** |
| timeline.astro | 3 | 4 | **7** |
| alert.astro | 13 | 1 | **14** |
| badge.astro | 10 | 1 | **11** |
| button.astro | 12 | 0 | **12** |
| card.astro | 11 | 0 | **11** |
| code.astro | 4 | 1 | **5** |
| dialog.astro | 13 | 7 | **20** |
| dropdown.astro | 5 | 5 | **10** |
| form.astro | 28 | 0 | **28** |
| kbd.astro | 9 | 6 | **15** |
| link.astro | 3 | 2 | **5** |
| menudropdown.astro | 5 | 1 | **6** |
| sheet.astro | 12 | 1 | **13** |
| switch.astro | 7 | 1 | **8** |
| table.astro | 16 | 13 | **29** |
| tabs.astro | 18 | 1 | **19** |
| tooltip.astro | 11 | 4 | **15** |
| base.astro | 11 | 11 | **22** |
| doc.astro | 8 | 10 | **18** |
| footer.astro | 6 | 1 | **7** |
| header.astro | 14 | 7 | **21** |
| table-of-contents.astro | 19 | 3 | **22** |
| **TOTAL** | | | **~420** |

---

## Detailed File-by-File Audit

---

### 1. `components/accordion.astro` — 5 UI items

#### `<li>` Accessibility guidelines (L402–L406)

| Line | Text | Suggested key |
|------|------|---------------|
| 402 | `Native details/summary structure understandable by screen readers.` | `p.a11yNativeDetails` |
| 403 | `Visible focus on the header with accent outline.` | `p.a11yVisibleFocus` |
| 404 | `No JavaScript: open state is managed by the browser.` | `p.a11yNoJs` |
| 405 | `groupName is optional to share "single" mode (if supported).` | `p.a11yGroupName` |
| 406 | `aria-disabled attribute applied to the trigger when disabled.` | `p.a11yAriaDisabled` |

---

### 2. `components/avatar.astro` — 11 UI items

#### `<li>` Accessibility (L371–L374)

| Line | Text | Suggested key |
|------|------|---------------|
| 371 | `The alt attribute is required for images` | `p.a11yAltRequired` |
| 372 | `Initials are automatically generated from the fallback` | `p.a11yInitialsGenerated` |
| 373 | `Alternative text is readable by screen readers` | `p.a11yAltReadable` |
| 374 | `Color contrasts follow WCAG standards` | `p.a11yWcagContrast` |

#### `<li>` Best practices (L380–L384)

| Line | Text | Suggested key |
|------|------|---------------|
| 380 | `Always use a fallback for avatars without an image` | `p.bpUseFallback` |
| 381 | `Provide a descriptive alt for images` | `p.bpDescriptiveAlt` |
| 382 | `Use consistent sizes in the same context` | `p.bpConsistentSizes` |
| 383 | `Prefer square images to avoid distortion` | `p.bpSquareImages` |
| 384 | `Initials are limited to 2 characters maximum` | `p.bpInitialsLimit` |

#### `<p>` Component descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 125 | `Four sizes are available: sm, md (default), lg, and xl.` | `p.sizesDescription` |
| 198 | `Use AvatarGroup to display overlapping avatars (modern 2025 style).` | `p.avatarGroupDescription` |

---

### 3. `components/breadcrumb.astro` — 17 UI items

#### `<p>` Sub-component descriptions (L70–L145)

| Line | Text | Suggested key |
|------|------|---------------|
| 70 | `The root navigation component that contains all breadcrumb elements.` | `p.descBreadcrumbRoot` |
| 106 | `A container that displays an ordered list for breadcrumb items.` | `p.descBreadcrumbList` |
| 109 | `A component representing each item in the breadcrumb navigation.` | `p.descBreadcrumbItem` |
| 112 | `A component for clickable links that navigate to previous levels.` | `p.descBreadcrumbLink` |
| 139 | `Represents the current page in the breadcrumb (last element).` | `p.descBreadcrumbPage` |
| 142 | `Visual separator between breadcrumb items.` | `p.descBreadcrumbSeparator` |
| 145 | `Indicates truncated items, used when there are many levels.` | `p.descBreadcrumbEllipsis` |

#### `<li>` Accessibility (L581–L585)

| Line | Text | Suggested key |
|------|------|---------------|
| 581 | `Semantic navigation: Uses <nav aria-label="Breadcrumb">` | `p.a11ySemanticNav` |
| 582 | `Ordered list: <ol> for hierarchy` | `p.a11yOrderedList` |
| 583 | `Current page: aria-current="page" on BreadcrumbPage` | `p.a11yCurrentPage` |
| 584 | `Separators: role="presentation" and aria-hidden="true"` | `p.a11ySeparators` |
| 585 | `Keyboard: Standard Tab navigation` | `p.a11yKeyboard` |

#### `<li>` Best practices (L591–L595)

| Line | Text | Suggested key |
|------|------|---------------|
| 591 | `Consistency: Use the same variant as your design system` | `p.bpConsistency` |
| 592 | `Clear hierarchy: Show only relevant levels` | `p.bpClearHierarchy` |
| 593 | `Smart truncation: Use BreadcrumbEllipsis for long paths` | `p.bpSmartTruncation` |
| 594 | `Mobile: The breadcrumb automatically adapts with flex-wrap` | `p.bpMobile` |
| 595 | `Performance: Components are static (no JavaScript)` | `p.bpPerformance` |

---

### 4. `components/gallery.astro` — 7 UI items

#### `<p>` Mode descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 91 | `Classic grid with equal columns and uniform aspect ratio.` | `p.descGridMode` |
| 115 | `Column layout with variable heights (like Pinterest).` | `p.descMasonryMode` |
| 158 | `Grid with hover overlay showing a zoom icon and caption.` | `p.descEnhancedMode` |

#### `<li>` CSS Architecture (L355–L358)

| Line | Text | Suggested key |
|------|------|---------------|
| 355 | `<input type="radio"> hidden to store state (active image)` | `p.cssRadioHidden` |
| 356 | `<label for="..."> on each thumbnail to change the radio` | `p.cssLabelThumbnail` |
| 357 | `CSS selector :checked to show the corresponding image` | `p.cssCheckedSelector` |
| 358 | `CSS transitions for smooth animations` | `p.cssTransitions` |

---

### 5. `components/pagination.astro` — 16 UI items

#### `<p>` Descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 128 | `Simple example with 10 pages, page 5 active:` | `p.basicExampleDesc` |
| 196 | `Colors apply to the active page:` | `p.colorsApply` |
| 308 | `The component automatically displays "..." when there are many pages:` | `p.smartEllipsisDesc` |

#### `<li>` Accessibility (L352–L357)

| Line | Text | Suggested key |
|------|------|---------------|
| 352 | `Semantic navigation: Uses <nav> with aria-label="Pagination"` | `p.a11ySemanticNav` |
| 353 | `Current state: aria-current="page" on the active page` | `p.a11yCurrentState` |
| 354 | `Disabling: aria-disabled and tabindex="-1" on disabled links` | `p.a11yDisabling` |
| 355 | `Clear labels: aria-label on all links (First page, Page 5, etc.)` | `p.a11yClearLabels` |
| 356 | `Keyboard: Full keyboard navigation with Tab` | `p.a11yKeyboard` |
| 357 | `Smart handling: Automatic disabling if totalPages = 0, 1, or if currentPage is invalid` | `p.a11ySmartHandling` |

#### `<li>` Smart logic (L363–L369)

| Line | Text | Suggested key |
|------|------|---------------|
| 363 | `0 pages: Nothing is displayed` | `p.logic0Pages` |
| 364 | `1 page: Only page 1 is shown (no navigation)` | `p.logic1Page` |
| 365 | `≤ 7 pages: All pages are shown` | `p.logicLte7Pages` |
| 366 | `> 7 pages: Uses "..." smartly` | `p.logicGt7Pages` |
| 367 | `Validation: currentPage is automatically normalized between 1 and totalPages` | `p.logicValidation` |
| 368 | `Previous button: Automatically disabled on page 1` | `p.logicPrevDisabled` |
| 369 | `Next button: Automatically disabled on the last page` | `p.logicNextDisabled` |

---

### 6. `components/skeleton.astro` — 3 UI items

#### `<li>` Accessibility (L339–L340, approx)

| Line | Text | Suggested key |
|------|------|---------------|
| ~339 | `aria-busy="true": indicates that content is loading` | `p.a11yAriaBusy` |
| ~342 | `aria-label="Loading...": provides a textual description` | `p.a11yAriaLabel` |

#### `<p>` Description

| Line | Text | Suggested key |
|------|------|---------------|
| ~348 | `Assistive technologies will announce that content is loading, helping users understand the state of the interface.` | `p.a11yAssistiveTech` |

---

### 7. `components/slider.astro` — 23 UI items

#### `<li>` Features list (L488–L500)

| Line | Text | Suggested key |
|------|------|---------------|
| 488 | `Left/right button navigation` | `p.featureButtonNav` |
| 489 | `Keyboard navigation (arrow keys)` | `p.featureKeyboardNav` |
| 490 | `Touch support (swipe)` | `p.featureTouchSupport` |
| 491 | `Mouse drag support` | `p.featureMouseDrag` |
| 492 | `Pagination indicators` | `p.featurePagination` |
| 493 | `Optional auto-scrolling` | `p.featureAutoScroll` |
| 494 | `Pause on hover` | `p.featurePauseHover` |
| 495 | `Snap-scroll for precise alignment` | `p.featureSnapScroll` |
| 496 | `Fully responsive` | `p.featureResponsive` |
| 497 | `Dark mode support` | `p.featureDarkMode` |
| 498 | `ARIA accessibility` | `p.featureAria` |
| 499 | `4 visual variants` | `p.feature4Variants` |
| 500 | `4 color options` | `p.feature4Colors` |

#### `<li>` Accessibility (L505–L508)

| Line | Text | Suggested key |
|------|------|---------------|
| 505 | `Full keyboard navigation` | `p.a11yKeyboardNav` |
| 506 | `ARIA labels on controls` | `p.a11yAriaLabels` |
| 507 | `Visible focus on interactive elements` | `p.a11yVisibleFocus` |
| 508 | `Screen reader support` | `p.a11yScreenReader` |

#### `<li>` Performance (L513–L516)

| Line | Text | Suggested key |
|------|------|---------------|
| 513 | `Native browser scrolling` | `p.perfNativeScroll` |
| 514 | `Optimized CSS animations` | `p.perfOptimizedCss` |
| 515 | `Lazy loading images recommended` | `p.perfLazyLoading` |
| 516 | `No external dependencies` | `p.perfNoDeps` |

#### `<p>` Descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 72 | `Simple slider with product cards.` | `p.basicUsageDesc` |
| 359 | `Slider without navigation buttons (touch navigation only).` | `p.noButtonsDesc` |

---

### 8. `components/timeline.astro` — 7 UI items

#### `<p>` Mode descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 86 | `Classic vertical timeline with line on the left.` | `p.descVertical` |
| 106 | `Horizontal timeline with scroll (perfect for mobile).` | `p.descHorizontal` |
| 126 | `Zigzag timeline with alternating left/right elements.` | `p.descAlternate` |
| ~343 | `The timeline automatically adapts on mobile:` | `p.responsiveIntro` |

#### `<li>` Responsive behavior (L346–L348)

| Line | Text | Suggested key |
|------|------|---------------|
| 346 | `Vertical: Stays vertical, reduced padding` | `p.respVertical` |
| 347 | `Horizontal: Horizontal scrolling with scroll-snap` | `p.respHorizontal` |
| 348 | `Alternate: Becomes vertical on mobile (line on the left)` | `p.respAlternate` |

---

### 9. `design/alert.astro` — 14 UI items

#### `<p>` Description

| Line | Text | Suggested key |
|------|------|---------------|
| 254 | `Alerts can be closed by the user with the dismissible prop.` | `p.dismissibleDesc` |

#### `<li>` Accessibility (L365–L369)

| Line | Text | Suggested key |
|------|------|---------------|
| 365 | `The role="alert" attribute is automatically added` | `p.a11yRoleAlert` |
| 366 | `Screen readers announce important alerts` | `p.a11yScreenReaders` |
| 367 | `The close button has a "Close alert" label` | `p.a11yCloseLabel` |
| 368 | `Icons are decorative and do not affect readability` | `p.a11yDecorativeIcons` |
| 369 | `Colors respect WCAG contrast guidelines` | `p.a11yWcagContrast` |

#### `<li>` Best practices (L375–L382)

| Line | Text | Suggested key |
|------|------|---------------|
| 375 | `Use status="info" for general information` | `p.bpStatusInfo` |
| 376 | `Use status="success" to confirm a successful action` | `p.bpStatusSuccess` |
| 377 | `Use status="warning" for non-blocking warnings` | `p.bpStatusWarning` |
| 378 | `Use status="danger" for critical errors` | `p.bpStatusDanger` |
| 379 | `Add a title for important messages` | `p.bpAddTitle` |
| 380 | `Use dismissible for non-critical alerts` | `p.bpDismissible` |
| 381 | `Keep messages short and actionable` | `p.bpShortMessages` |
| 382 | `Avoid displaying too many alerts at once` | `p.bpLimitAlerts` |

---

### 10. `design/badge.astro` — 11 UI items

#### `<p>` Description

| Line | Text | Suggested key |
|------|------|---------------|
| 246 | `Badges can be closed by the user with the dismissible prop.` | `p.dismissibleDesc` |

#### `<li>` Accessibility (L374–L377)

| Line | Text | Suggested key |
|------|------|---------------|
| 374 | `Use ariaLabel for icon-only badges` | `p.a11yAriaLabel` |
| 375 | `The close button has a default label "Close"` | `p.a11yCloseLabel` |
| 376 | `Badges use semantic <span>` | `p.a11ySemanticSpan` |
| 377 | `Icons are decorative and do not affect readability` | `p.a11yDecorativeIcons` |

#### `<li>` Best practices (L383–L388)

| Line | Text | Suggested key |
|------|------|---------------|
| 383 | `Use badges for compact and non-critical information` | `p.bpCompactInfo` |
| 384 | `Limit the number of badges displayed at once to avoid visual overload` | `p.bpLimitBadges` |
| 385 | `Use consistent colors for statuses (e.g. primary for active, accent for warning)` | `p.bpConsistentColors` |
| 386 | `Prefer short text (1-3 words max)` | `p.bpShortText` |
| 387 | `Use dismissible for temporary notifications` | `p.bpDismissible` |
| 388 | `Combine with icons to reinforce visual meaning` | `p.bpCombineIcons` |

---

### 11. `design/button.astro` — 12 UI items

#### `<li>` Accessibility (L431–L435)

| Line | Text | Suggested key |
|------|------|---------------|
| 431 | `Type attribute: Specify the appropriate type (button/submit/reset)` | `p.a11yTypeAttribute` |
| 432 | `ariaLabel: Required for icon-only buttons` | `p.a11yAriaLabel` |
| 433 | `disabled: Disables the button and makes it inaccessible` | `p.a11yDisabled` |
| 434 | `Visible focus: Clear focus states on all variants` | `p.a11yVisibleFocus` |
| 435 | `Contrast: Meets WCAG AA ratios` | `p.a11yContrast` |

#### `<li>` Best practices (L449–L454)

| Line | Text | Suggested key |
|------|------|---------------|
| 449 | `Use type="submit" for form submission buttons` | `p.bpTypeSubmit` |
| 450 | `Always provide ariaLabel for buttons without text` | `p.bpAriaLabel` |
| 451 | `Use colors consistently (primary for main action, etc.)` | `p.bpConsistentColors` |
| 452 | `Avoid too many icons, use sparingly` | `p.bpSpareIcons` |
| 453 | `Keep the same variant throughout the interface` | `p.bpSameVariant` |
| 454 | `Disable buttons rather than hiding them during actions` | `p.bpDisableNotHide` |

Note: L466–L472 are CSS variable names (not translatable UI text — SKIP).

---

### 12. `design/card.astro` — 11 UI items

#### `<li>` Best practices (L628–L633)

| Line | Text | Suggested key |
|------|------|---------------|
| 628 | `Use CardImage with a descriptive alt for accessibility` | `p.bpCardImageAlt` |
| 629 | `Limit CardDescription content with truncate to keep a consistent design` | `p.bpTruncate` |
| 630 | `Use elevation to create visual hierarchy between cards` | `p.bpElevation` |
| 631 | `Enable interactive only for clickable cards` | `p.bpInteractive` |
| 632 | `Group metadata with CardMeta for better readability` | `p.bpCardMeta` |
| 633 | `Use CardFooter for main actions related to the card` | `p.bpCardFooter` |

#### `<li>` Accessibility (L639–L643)

| Line | Text | Suggested key |
|------|------|---------------|
| 639 | `The component uses the semantic <article> tag` | `p.a11yArticleTag` |
| 640 | `Images require an alt attribute` | `p.a11yAltRequired` |
| 641 | `Headers use <header> and footers use <footer>` | `p.a11yHeaderFooter` |
| 642 | `Interactive mode adds visible focus states` | `p.a11yFocusStates` |
| 643 | `Metadata is structured in a <ul> list` | `p.a11yMetadataList` |

---

### 13. `design/code.astro` — 5 UI items

#### `<p>` Description

| Line | Text | Suggested key |
|------|------|---------------|
| 69 | `The component is available directly from astro:components:` | `p.availableFrom` |

#### `<li>` External links (L206–L209)

| Line | Text | Suggested key |
|------|------|---------------|
| 206 | `Astro Code documentation` (link text) | `p.linkAstroDocs` |
| 207 | `Shiki documentation` (link text) | `p.linkShikiDocs` |
| 208 | `Shiki themes` (link text) | `p.linkShikiThemes` |
| 209 | `Supported languages` (link text) | `p.linkSupportedLangs` |

---

### 14. `design/dialog.astro` — 20 UI items

#### `<p>` Sub-component descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 407 | `Root component that contains all other dialog components.` | `p.descDialogRoot` |
| 415 | `Button that opens the dialog.` | `p.descDialogTrigger` |
| 423 | `Container for the dialog content.` | `p.descDialogContent` |
| 432 | `Containers for the dialog header and footer.` | `p.descDialogHeaderFooter` |
| 438 | `Dialog title and description.` | `p.descDialogTitleDesc` |
| 444 | `Button that closes the dialog.` | `p.descDialogClose` |

#### `<li>` API prop descriptions (L409–L428)

| Line | Text | Suggested key |
|------|------|---------------|
| 409 | `variant: "initial" \| "retro" \| "modern" \| "futuristic" (default: "initial")` | `p.propVariant` |
| 410 | `id: Unique identifier for external triggers` | `p.propId` |
| 411 | `class: Additional CSS classes` | `p.propClass` |
| 417 | `asChild: Use the child as the trigger instead of a button` | `p.propAsChild` |
| 418 | `for: ID of the dialog to open (for external triggers)` | `p.propFor` |
| 425 | `variant: Visual style (initial, retro, modern, futuristic)` | `p.propContentVariant` |
| 426 | `size: Size (sm, md, lg, xl, full)` | `p.propSize` |
| 427 | `animationDuration: Animation duration in ms (default: 200)` | `p.propAnimDuration` |
| 446 | `asChild: Use the child as the close button` | `p.propCloseAsChild` |

#### `<li>` Accessibility features (L452–L456)

| Line | Text | Suggested key |
|------|------|---------------|
| 452 | `ESC: Automatically closes the dialog` | `p.a11yEsc` |
| 453 | `Backdrop: Clicking the backdrop closes the dialog` | `p.a11yBackdrop` |
| 454 | `Focus trap: Natively handled by the browser` | `p.a11yFocusTrap` |
| 455 | `Scroll lock: Body is automatically locked` | `p.a11yScrollLock` |
| 456 | `@starting-style: Modern native CSS animations` | `p.a11yStartingStyle` |

Note: L411, L419, L428, L434, L440, L447 are duplicate "Additional CSS classes" — use `d.propAdditionalCss`.

---

### 15. `design/dropdown.astro` — 10 UI items

#### `<p>` Descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 203 | `The dropdown can be positioned in 4 different ways relative to the trigger.` | `p.positionDesc` |
| 313 | `Items can have href attributes to create links.` | `p.hrefDesc` |
| 354 | `Long menus have automatic scrolling with a max height of 400px.` | `p.scrollDesc` |
| 434 | `The dropdown automatically handles:` | `p.autoHandlesIntro` |
| 447 | `Clear and logical HTML structure for a dropdown menu with submenus:` | `p.htmlStructureDesc` |

#### `<li>` Responsive behavior (L436–L440)

| Line | Text | Suggested key |
|------|------|---------------|
| 436 | `Screen overflow: On mobile, automatic centered position` | `p.respScreenOverflow` |
| 437 | `Max height: 400px desktop, 300px mobile with scroll` | `p.respMaxHeight` |
| 438 | `Adaptive width: max-width on mobile to avoid overflow` | `p.respAdaptiveWidth` |
| 439 | `Backdrop: Click outside closes the menu` | `p.respBackdrop` |
| 440 | `Custom scrollbar: Minimal style on webkit browsers` | `p.respCustomScrollbar` |

---

### 16. `design/form.astro` — 28 UI items

#### `<li>` Status descriptions (L306–L309)

| Line | Text | Suggested key |
|------|------|---------------|
| 306 | `error: Validation errors, submission failure` | `p.statusErrorDesc` |
| 307 | `success: Successful submission confirmation, account creation` | `p.statusSuccessDesc` |
| 308 | `warning: Warnings before important actions, missing optional fields` | `p.statusWarningDesc` |
| 309 | `info: Contextual information, filling tips` | `p.statusInfoDesc` |

#### `<li>` Input prop descriptions (L335–L340)

| Line | Text | Suggested key |
|------|------|---------------|
| 335 | `type: text \| email \| password \| number \| tel \| url \| search \| date \| time` | `p.propInputType` |
| 336 | `icon: MDI icon name` | `p.propInputIcon` |
| 337 | `iconPosition: left \| right (default: left)` | `p.propIconPosition` |
| 338 | `variant: initial \| retro \| modern \| futuristic` | `p.propInputVariant` |
| 339 | `error: Error message` | `p.propInputError` |
| 340 | `required, disabled, readonly` | `p.propInputStates` |

#### `<li>` Accessibility (L798–L804)

| Line | Text | Suggested key |
|------|------|---------------|
| 798 | `ARIA: aria-invalid, aria-describedby, aria-required attributes` | `p.a11yAria` |
| 799 | `Linked labels: All fields have a label associated via htmlFor and id` | `p.a11yLinkedLabels` |
| 800 | `Required indicators: Red asterisk (*) for required fields` | `p.a11yRequiredIndicators` |
| 801 | `Error messages: Announced to screen readers with role="alert"` | `p.a11yErrorMessages` |
| 802 | `Visible focus: Clear focus states on all interactive elements` | `p.a11yVisibleFocus` |
| 803 | `Keyboard navigation: All components are keyboard accessible` | `p.a11yKeyboardNav` |
| 804 | `Contrast: Meets WCAG AA ratios` | `p.a11yContrast` |

#### `<li>` Best practices (L875–L882)

| Line | Text | Suggested key |
|------|------|---------------|
| 875 | `Always use FormGroup: Wraps label + input for consistent spacing` | `p.bpFormGroup` |
| 876 | `Indicate required fields: Use required prop on Label and Input` | `p.bpIndicateRequired` |
| 877 | `Clear error messages: Explain why the error and how to fix it` | `p.bpClearErrors` |
| 878 | `Informative placeholders: Show examples of expected format` | `p.bpPlaceholders` |
| 879 | `Relevant icons: Help visually identify the field type` | `p.bpRelevantIcons` |
| 880 | `Consistent variants: Use the same variant throughout the form` | `p.bpConsistentVariants` |
| 881 | `Group radios: Use <fieldset> and <legend>` | `p.bpGroupRadios` |
| 882 | `Progressive validation: Validate in real time or on submit depending on context` | `p.bpProgressiveValidation` |

#### `<li>` Component summary (L888–L898)

| Line | Text | Suggested key |
|------|------|---------------|
| 888 | `FormCard: Form wrapper with Card` | `p.compFormCard` |
| 889 | `FormGroup: Label + field group` | `p.compFormGroup` |
| 890 | `Label: Label with required indicator` | `p.compLabel` |
| 891 | `Input: Text field with icons` | `p.compInput` |
| 892 | `PasswordInput: Password with visibility toggle` | `p.compPasswordInput` |
| 893 | `Textarea: Multi-line text area` | `p.compTextarea` |
| 894 | `Select: Dropdown menu` | `p.compSelect` |
| 895 | `Checkbox: Checkbox` | `p.compCheckbox` |
| 896 | `Radio: Radio button` | `p.compRadio` |
| 897 | `Switch: Toggle switch` | `p.compSwitch` |
| 898 | `DatePicker: Date picker` | `p.compDatePicker` |

---

### 17. `design/kbd.astro` — 15 UI items

#### `<p>` Descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 70 | `Simply display a keyboard key:` | `p.simpleKeyDesc` |
| 94 | `3 sizes available: sm, md (default), lg` | `p.sizesDesc` |
| 113 | `Combine several keys to display shortcuts:` | `p.combineKeysDesc` |
| 169 | `Use Unicode symbols for special keys:` | `p.unicodeDesc` |
| 232 | `The Kbd component supports the 4 design system variants:` | `p.variantsDesc` |
| 268 | `The Kbd component supports 4 colors: default, primary, secondary, accent` | `p.colorsDesc` |

#### `<li>` Best practices (L438–L442)

| Line | Text | Suggested key |
|------|------|---------------|
| 438 | `Clear symbols: Use the appropriate Unicode symbols (⌘ for Mac, Ctrl for Windows)` | `p.bpClearSymbols` |
| 439 | `Separator +: Use the + symbol between keys for combinations` | `p.bpSeparator` |
| 440 | `OS context: Adapt shortcuts to the user's operating system` | `p.bpOsContext` |
| 441 | `Consistency: Always use the same Kbd size in the same context` | `p.bpConsistency` |
| 442 | `Readability: Avoid combinations that are too long (max 3-4 keys)` | `p.bpReadability` |

#### `<li>` Accessibility (L448–L451)

| Line | Text | Suggested key |
|------|------|---------------|
| 448 | `Uses the semantic <kbd> HTML5 tag` | `p.a11ySemanticKbd` |
| 449 | `Text content is readable by screen readers` | `p.a11yScreenReaders` |
| 450 | `Sufficient contrast for good readability` | `p.a11yContrast` |
| 451 | `Visual effect on :active for tactile feedback` | `p.a11yActiveFeedback` |

---

### 18. `design/link.astro` — 5 UI items

#### `<p>` Descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 319 | `Use the external prop for links that open in a new tab.` | `p.externalDesc` |
| 416 | `The Link component follows accessibility best practices:` | `p.a11yIntro` |

#### `<li>` Accessibility (L423–L425)

| Line | Text | Suggested key |
|------|------|---------------|
| 423 | `Color contrast meets WCAG standards` | `p.a11yContrast` |
| 424 | `Hover and focus states are clearly visible` | `p.a11yHoverFocus` |
| 425 | `Use ariaLabel for links without visible text` | `p.a11yAriaLabel` |

---

### 19. `design/menudropdown.astro` — 6 UI items

#### `<p>` Description

| Line | Text | Suggested key |
|------|------|---------------|
| 237 | `The menu can open automatically on hover:` | `p.hoverDesc` |

#### `<li>` Accessibility (L320–L324)

| Line | Text | Suggested key |
|------|------|---------------|
| 322 | `Focusable items and visible focus styles.` | `p.a11yFocusStyles` |
| 323 | `Touch-optimized support (min-height 44px).` | `p.a11yTouchOptimized` |
| 324 | `Responsive: stacks submenus vertically on mobile.` | `p.a11yResponsive` |

#### `<li>` Technical notes (L335–L336)

| Line | Text | Suggested key |
|------|------|---------------|
| 335 | `Dark mode: Automatic dark theme support.` | `p.noteDarkMode` |
| 336 | `Touch-friendly: Minimum 44px touch targets.` | `p.noteTouchFriendly` |

---

### 20. `design/sheet.astro` — 13 UI items (French text!)

#### `<p>` Description

| Line | Text | Suggested key |
|------|------|---------------|
| 514 | `Le Sheet Panel utilise une technique CSS pure ingénieuse :` | `p.cssTechniqueIntro` |

#### `<li>` Technical architecture (L504–L510, L516–L520) — **ALL IN FRENCH**

| Line | Text | Suggested key |
|------|------|---------------|
| 504 | `Pure CSS : Aucun JavaScript requis, fonctionne même si JS est désactivé` | `p.techPureCss` |
| 505 | `Checkbox pattern : Utilise un input checkbox caché + label pour l'état` | `p.techCheckboxPattern` |
| 506 | `Pseudo-classe :has() : CSS moderne pour détecter l'état checked` | `p.techHasPseudo` |
| 507 | `Attributs ARIA : role="dialog", aria-modal="true"` | `p.techAriaAttrs` |
| 508 | `Fermeture par overlay : Cliquer sur l'overlay ferme automatiquement le sheet` | `p.techOverlayClose` |
| 509 | `Support des lecteurs d'écran : Étiquetage approprié avec SheetTitle et SheetDescription` | `p.techScreenReader` |
| 510 | `Navigation au clavier : Tab et Shift+Tab pour naviguer, Space/Enter pour activer` | `p.techKeyboardNav` |
| 516 | `Un checkbox caché (display: none) stocke l'état ouvert/fermé` | `p.howCheckboxHidden` |
| 517 | `Le SheetTrigger est un <label> qui coche le checkbox` | `p.howSheetTrigger` |
| 518 | `La pseudo-classe :has(.sheet-toggle:checked) détecte l'état` | `p.howHasChecked` |
| 519 | `Le CSS applique les transformations (translateX/Y) selon l'état` | `p.howCssTransforms` |
| 520 | `Le SheetClose et l'overlay sont des labels qui décochent le checkbox` | `p.howSheetClose` |

---

### 21. `design/switch.astro` — 8 UI items

#### `<p>` Description

| Line | Text | Suggested key |
|------|------|---------------|
| ~305 | `The Switch component follows accessibility best practices:` | `p.a11yIntro` |

#### `<li>` Accessibility (approx L310–L325)

| Line | Text | Suggested key |
|------|------|---------------|
| ~310 | `role="switch": Indicates it is a toggle button` | `p.a11yRoleSwitch` |
| ~313 | `aria-checked: Communicates checked/unchecked state` | `p.a11yAriaChecked` |
| ~316 | `aria-invalid: Indicates if the field has an error` | `p.a11yAriaInvalid` |
| ~319 | `aria-describedby: Links the error message to the switch` | `p.a11yAriaDescribedby` |
| ~322 | `The label is properly linked via the for attribute` | `p.a11yLabelLinked` |
| ~325 | `Keyboard navigation: Space or Enter to toggle` | `p.a11yKeyboard` |
| ~328 | `Visible focus for keyboard navigation` | `p.a11yVisibleFocus` |

---

### 22. `design/table.astro` — 29 UI items

#### `<p>` Sub-component descriptions (L520–L578)

| Line | Text | Suggested key |
|------|------|---------------|
| 100 | `Simple table with headers and data:` | `p.basicTableDesc` |
| 158 | `Use TableCaption to add a table description:` | `p.captionDesc` |
| 192 | `Use TableFoot to add totals or summaries:` | `p.footDesc` |
| 269 | `Add the striped prop to enable alternate row coloring for better readability:` | `p.stripedDesc` |
| 333 | `Wide tables automatically scroll horizontally on small screens:` | `p.responsiveDesc` |
| 520 | `Root component that contains the table in a scrollable container.` | `p.descTableRoot` |
| 555 | `Wraps <thead> for column headers.` | `p.descTableHeader` |
| 558 | `Wraps <tbody> for data rows.` | `p.descTableBody` |
| 561 | `Wraps <tfoot> for totals/summaries.` | `p.descTableFoot` |
| 564 | `Wraps <tr> for each row.` | `p.descTableRow` |
| 567 | `Wraps <th> for header cells.` | `p.descTableHead` |
| 570 | `Wraps <td> for data cells.` | `p.descTableCell` |
| 578 | `Wraps <caption> for the table description.` | `p.descTableCaption` |

#### `<li>` Accessibility (L583–L588)

| Line | Text | Suggested key |
|------|------|---------------|
| 583 | `HTML semantics: Uses native <table>, <thead>, <tbody>, <tfoot>, <th>, <td>` | `p.a11ySemantics` |
| 584 | `Caption: Always add a TableCaption to describe the table` | `p.a11yCaption` |
| 585 | `Scope: <th> cells automatically have scope="col"` | `p.a11yScope` |
| 586 | `Responsive: Horizontal scroll preserved with keyboard focus` | `p.a11yResponsive` |
| 587 | `Contrast: Colors meet WCAG AA requirements` | `p.a11yContrast` |
| 588 | `Hover: Clear hover states for navigation` | `p.a11yHover` |

#### `<li>` Best practices (L666–L673)

| Line | Text | Suggested key |
|------|------|---------------|
| 666 | `Caption required: Always add a TableCaption for accessibility` | `p.bpCaptionRequired` |
| 667 | `Clear headers: Use descriptive labels in TableHead` | `p.bpClearHeaders` |
| 668 | `Consistent data: Align data types (numbers right, text left)` | `p.bpConsistentData` |
| 669 | `Striped for lists: Use striped for tables with many rows` | `p.bpStriped` |
| 670 | `Limit columns: Maximum 8-10 columns for readability` | `p.bpLimitColumns` |
| 671 | `Responsive: Test on mobile - horizontal scroll must work` | `p.bpResponsive` |
| 672 | `Inline actions: Place action buttons in the last column` | `p.bpInlineActions` |
| 673 | `Footer for totals: Use TableFoot for summaries` | `p.bpFooterTotals` |

#### `<li>` Prop descriptions (L573–L574)

| Line | Text | Suggested key |
|------|------|---------------|
| 573 | `colspan: Number of columns to span` | `p.propColspan` |
| 574 | `rowspan: Number of rows to span` | `p.propRowspan` |

---

### 23. `design/tabs.astro` — 19 UI items

#### `<li>` Feature overview (L45–L49)

| Line | Text | Suggested key |
|------|------|---------------|
| 45 | `Intuitive and elegant interface` | `p.featureIntuitive` |
| 46 | `4 variants available (Initial, Retro, Modern, Futuristic)` | `p.feature4Variants` |
| 47 | `Zero JavaScript — CSS-only with radio inputs` | `p.featureZeroJs` |
| 48 | `Accessible (native keyboard, screen reader, visible focus)` | `p.featureAccessible` |
| 49 | `Responsive: vertical stack on mobile, tabs on desktop` | `p.featureResponsive` |

#### `<li>` Technical features (L72–L76)

| Line | Text | Suggested key |
|------|------|---------------|
| 72 | `4 variants: Initial, Retro, Modern, Futuristic` | `p.tech4Variants` |
| 73 | `Icons: native astro-icon integration` | `p.techIcons` |
| 74 | `Zero JS: radio inputs + CSS :checked` | `p.techZeroJs` |
| 75 | `Responsive: mobile stack → desktop tabs` | `p.techResponsive` |
| 76 | `Accessible: native keyboard (arrows), visible focus` | `p.techAccessible` |

#### `<li>` CSS Architecture (L416–L421)

| Line | Text | Suggested key |
|------|------|---------------|
| 416 | `Hidden <input type="radio">: manage :checked state natively` | `p.cssHiddenRadio` |
| 417 | `Clickable <label>: linked to radios via for/id` | `p.cssClickableLabel` |
| 418 | `Native keyboard navigation: left/right arrows to navigate within the radio group` | `p.cssNativeKeyboard` |
| 419 | `Icons: marked aria-hidden="true", do not pollute screen readers` | `p.cssIconsAria` |
| 420 | `Visible focus: 3px outline on keyboard navigation via :focus-visible` | `p.cssVisibleFocus` |
| 421 | `WCAG 2.2 AA: minimum 44px target size, contrast enforced via design tokens` | `p.cssWcag` |

#### `<li>` Best practices (L427–L433)

| Line | Text | Suggested key |
|------|------|---------------|
| 427 | `Always set open on one tab to avoid an empty display` | `p.bpSetOpen` |
| 428 | `Same name on all <Tab> within the same group` | `p.bpSameName` |
| 429 | `Short labels: 1 to 2 words per tab maximum` | `p.bpShortLabels` |
| 430 | `5 to 7 tabs max to avoid cognitive overload` | `p.bpMaxTabs` |
| 431 | `Relevant icons: improve visual recognition, but label remains required` | `p.bpRelevantIcons` |
| 432 | `Consistent variant: use the same variant as the rest of the interface` | `p.bpConsistentVariant` |
| 433 | `Distinct content: each tab should bring clearly differentiated value` | `p.bpDistinctContent` |

Note: L83–L86, L133–L135, L141–L144, L154–L156 are DEMO tab content — SKIP.

---

### 24. `design/tooltip.astro` — 15 UI items

#### `<p>` Descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 100 | `Wrap any content in a Tooltip to display a tooltip on hover:` | `p.basicUsageDesc` |
| 131 | `The tooltip can be positioned at the top, bottom, left, or right of the element:` | `p.positionsDesc` |
| 223 | `Tooltips can have different colors to indicate the type of information:` | `p.colorsDesc` |
| 266 | `The Tooltip works with all components of the design system:` | `p.compatibilityDesc` |

#### `<li>` Accessibility (L302–L307)

| Line | Text | Suggested key |
|------|------|---------------|
| 302 | `ARIA Role: The tooltip uses role="tooltip"` | `p.a11yAriaRole` |
| 303 | `Keyboard: Shows on focus (Tab) and hides on blur` | `p.a11yKeyboard` |
| 304 | `Hover & Focus: Works with mouse and keyboard` | `p.a11yHoverFocus` |
| 305 | `Cursor: Help cursor to indicate information is available` | `p.a11yCursor` |
| 306 | `High z-index: Displays above all other content (z-index: 9999)` | `p.a11yZindex` |
| 307 | `Pointer-events: Tooltip does not interfere with interactions` | `p.a11yPointerEvents` |

#### `<li>` Best practices (L313–L317)

| Line | Text | Suggested key |
|------|------|---------------|
| 313 | `Short text: Limit the text to one or two sentences` | `p.bpShortText` |
| 314 | `Supplementary info: Do not put critical information only in a tooltip` | `p.bpSupplementary` |
| 315 | `Smart position: Choose the position to avoid going off-screen` | `p.bpSmartPosition` |
| 316 | `Consistency: Use the same variant as your other components` | `p.bpConsistency` |
| 317 | `Mobile: On mobile, prefer alternative solutions (hover tooltips do not work well)` | `p.bpMobile` |

---

### 25. `layouts/base.astro` — 22 UI items (French text!)

#### `<p>` Feature descriptions (L174–L219) — **ALL IN FRENCH**

| Line | Text | Suggested key |
|------|------|---------------|
| 174 | `Switch automatique light/dark avec persistence localStorage et détection des préférences système.` | `p.featureThemeSwitch` |
| 183 | `Support natif de 4 langues (FR, EN, ES, AR) avec direction RTL automatique pour l'arabe.` | `p.featureI18n` |
| 192 | `Métadonnées complètes, Open Graph, Twitter Cards, canonical URLs et structured data.` | `p.featureSeo` |
| 201 | `Préchargement DNS, prefetch de ressources, fonts optimisées avec AstroFont.` | `p.featurePerformance` |
| 210 | `HTML sémantique, attributs ARIA, skip links, et navigation au clavier.` | `p.featureAccessibility` |
| 219 | `Design entièrement responsive avec viewport optimisé et touch-friendly.` | `p.featureResponsive` |
| 254 | `Le BaseLayout génère automatiquement :` | `p.autoGeneratesIntro` |
| 275 | `Le thème est géré via un script inline exécuté immédiatement pour éviter le flash :` | `p.themeManagement` |
| 285 | `L'attribut data-theme sur <html> permet de cibler les styles :` | `p.dataThemeAttr` |
| 302 | `Le BaseLayout génère la structure suivante :` | `p.generatesStructure` |
| 330 | `Le layout charge automatiquement 2 familles de polices via AstroFont :` | `p.fontLoading` |

#### `<li>` Features list (L257–L265) — **ALL IN FRENCH**

| Line | Text | Suggested key |
|------|------|---------------|
| 257 | `Balises meta essentielles (charset, viewport, description, keywords)` | `p.featureMetaTags` |
| 258 | `Open Graph pour Facebook et LinkedIn` | `p.featureOpenGraph` |
| 259 | `Twitter Cards` | `p.featureTwitterCards` |
| 260 | `Canonical URL` | `p.featureCanonicalUrl` |
| 261 | `Directives robots` | `p.featureRobots` |
| 262 | `Langue et direction du texte` | `p.featureLangDir` |
| 263 | `Favicons multiples (ico, png 16x16, 32x32)` | `p.featureFavicons` |
| 264 | `Apple Touch Icon` | `p.featureAppleTouchIcon` |
| 265 | `Manifest PWA` | `p.featureManifest` |

#### `<li>` Fonts (L333–L334)

| Line | Text | Suggested key |
|------|------|---------------|
| 333 | `Bowlby One SC - Pour les titres (font-display: swap)` | `p.fontBowlby` |
| 334 | `Palanquin Dark - Pour le corps de texte (weights: 400, 500, 600, 700)` | `p.fontPalanquin` |

---

### 26. `layouts/doc.astro` — 18 UI items

#### `<p>` Feature descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 110 | `Contextual navigation with page hierarchy, active state and search.` | `p.descSidebar` |
| 119 | `TOC generated automatically from the page's H2 and H3 headings.` | `p.descToc` |
| 128 | `Full support for the 4 visual variants (initial, retro, modern, futuristic).` | `p.descVariants` |
| 137 | `Collapsible sidebar on mobile with hamburger menu.` | `p.descResponsive` |
| 146 | `Optimal content width (max-width), line-height and readable typography.` | `p.descTypography` |
| 155 | `Automatic highlight of the active page and scroll spy for the TOC.` | `p.descActiveHighlight` |
| 198 | `The sidebar is generated automatically from the configuration file:` | `p.sidebarGeneration` |
| 212 | `The DocLayout automatically generates a table of contents from the headings:` | `p.tocGeneration` |
| 259 | `The DocLayout uses CSS Grid for a flexible layout:` | `p.cssGridDesc` |
| 269 | `The DocLayout supports the 4 variants:` | `p.variantsDesc` |

#### `<li>` TOC features (L215–L219)

| Line | Text | Suggested key |
|------|------|---------------|
| 215 | `Automatically detects H2 and H3 with IDs` | `p.tocDetectsHeadings` |
| 216 | `Generates anchor links` | `p.tocGeneratesAnchors` |
| 217 | `Visual indentation for hierarchy` | `p.tocIndentation` |
| 218 | `Scroll spy for highlighting the active section` | `p.tocScrollSpy` |
| 219 | `Smooth scroll on click` | `p.tocSmoothScroll` |

#### `<li>` Responsive grid (L262–L264)

| Line | Text | Suggested key |
|------|------|---------------|
| 262 | `Desktop (> 1200px): Sidebar (250px) \| Content (1fr) \| TOC (250px)` | `p.gridDesktop` |
| 263 | `Tablet (768-1200px): Sidebar (200px) \| Content (1fr)` | `p.gridTablet` |
| 264 | `Mobile (< 768px): Full-width content + hamburger menu` | `p.gridMobile` |

---

### 27. `templates/footer.astro` — 7 UI items (French text!)

#### `<p>` Description

| Line | Text | Suggested key |
|------|------|---------------|
| 74 | `Pour personnaliser le footer, modifiez les traductions dans les fichiers i18n :` | `p.customizationDesc` |

#### `<li>` Features list (L39–L44) — **ALL IN FRENCH**

| Line | Text | Suggested key |
|------|------|---------------|
| 39 | `Informations entreprise (nom, description, SIRET)` | `p.featureCompanyInfo` |
| 40 | `Coordonnées de contact (email, téléphone, adresse)` | `p.featureContactInfo` |
| 41 | `Liens légaux (mentions légales, politique de confidentialité, CGU)` | `p.featureLegalLinks` |
| 42 | `Liens réseaux sociaux` | `p.featureSocialLinks` |
| 43 | `Copyright automatique avec année` | `p.featureAutoCopyright` |
| 44 | `Multilingue avec traductions i18n` | `p.featureMultilingual` |

---

### 28. `templates/header.astro` — 21 UI items (French text!)

#### `<p>` Descriptions — **MOSTLY IN FRENCH**

| Line | Text | Suggested key |
|------|------|---------------|
| 42 | `Le Header est composé de plusieurs sous-composants :` | `p.subComponentsIntro` |
| 102 | `Le Header supporte les 4 variants visuels :` | `p.variantsIntro` |
| 112 | `Design épuré avec background subtle et border légère.` | `p.descInitialVariant` |
| 115 | `Style rétro avec bordures épaisses et ombres portées.` | `p.descRetroVariant` |
| 118 | `Design moderne avec glassmorphism et backdrop blur.` | `p.descModernVariant` |
| 121 | `Style futuriste avec gradients néon et effets lumineux.` | `p.descFuturisticVariant` |
| 125 | `Le Header s'adapte automatiquement aux différentes tailles d'écran :` | `p.responsiveIntro` |

#### `<li>` Sub-component descriptions (L45–L48) — **FRENCH**

| Line | Text | Suggested key |
|------|------|---------------|
| 45 | `Brand - Logo et nom du site avec lien vers l'accueil` | `p.compBrand` |
| 46 | `Navigation - Menu principal avec liens actifs` | `p.compNavigation` |
| 47 | `ThemeSwitch - Bouton pour changer entre light/dark mode` | `p.compThemeSwitch` |
| 48 | `LangChooser - Dropdown pour changer de langue (FR/EN/ES/AR)` | `p.compLangChooser` |

#### `<li>` Responsive (L128–L130) — **FRENCH**

| Line | Text | Suggested key |
|------|------|---------------|
| 128 | `Desktop : Navigation horizontale complète` | `p.respDesktop` |
| 129 | `Tablet : Navigation compacte avec icônes` | `p.respTablet` |
| 130 | `Mobile : Menu hamburger avec drawer` | `p.respMobile` |

#### `<li>` Features list (L157–L163) — **FRENCH**

| Line | Text | Suggested key |
|------|------|---------------|
| 157 | `Navigation avec active state automatique` | `p.featureActiveNav` |
| 158 | `Switch thème light/dark avec persistence` | `p.featureThemeSwitch` |
| 159 | `Sélecteur de langue 4 locales (FR, EN, ES, AR)` | `p.featureLangSelector` |
| 160 | `Responsive avec menu mobile` | `p.featureResponsive` |
| 161 | `Sticky header optionnel` | `p.featureStickyHeader` |
| 162 | `Accessibilité complète (ARIA, keyboard nav)` | `p.featureA11y` |
| 163 | `Support 4 variants visuels` | `p.feature4Variants` |

---

### 29. `templates/table-of-contents.astro` — 22 UI items

#### `<p>` Variant descriptions

| Line | Text | Suggested key |
|------|------|---------------|
| 129 | `Retro style with thick borders and monospace typography.` | `p.descRetroVariant` |
| 140 | `Modern design with gradients and glassmorphism effects.` | `p.descModernVariant` |
| 151 | `Futuristic design with neon lights and animated effects.` | `p.descFuturisticVariant` |

#### `<li>` Accessibility (L210–L214)

| Line | Text | Suggested key |
|------|------|---------------|
| 210 | `Uses semantic <nav> element` | `p.a11ySemanticNav` |
| 211 | `aria-label attribute for screen readers` | `p.a11yAriaLabel` |
| 212 | `Visible focus on all links` | `p.a11yVisibleFocus` |
| 213 | `Full keyboard navigation` | `p.a11yKeyboardNav` |
| 214 | `Sufficient contrast for all variants` | `p.a11yContrast` |

#### `<li>` Key features (L220–L228)

| Line | Text | Suggested key |
|------|------|---------------|
| 220 | `Semantic navigation with <nav>` | `p.featureSemanticNav` |
| 221 | `Decorative icon with emoji` | `p.featureDecorativeIcon` |
| 222 | `Hover states with smooth transitions` | `p.featureHoverStates` |
| 223 | `Accessible focus states` | `p.featureFocusStates` |
| 224 | `Responsive adaptive design` | `p.featureResponsive` |
| 225 | `Dark mode support` | `p.featureDarkMode` |
| 226 | `4 unique visual variants` | `p.feature4Variants` |
| 227 | `Custom animations per variant` | `p.featureCustomAnimations` |
| 228 | `Flexible structure for any content` | `p.featureFlexibleStructure` |

#### `<li>` Best practices (L236–L240)

| Line | Text | Suggested key |
|------|------|---------------|
| 236 | `Place the table of contents at the beginning of content` | `p.bpPlacement` |
| 237 | `Use short and descriptive labels` | `p.bpShortLabels` |
| 238 | `Ensure anchors exist in the page` | `p.bpAnchorsExist` |
| 239 | `Limit to 8-10 items for better readability` | `p.bpLimitItems` |
| 240 | `Use the same variant as the documentation page` | `p.bpSameVariant` |

---

## Grand Total: ~420 hardcoded UI strings across 29 files

### Priority breakdown:
- **HIGH priority** (best practices + accessibility `<li>` lists): ~210 items
- **MEDIUM priority** (sub-component `<p>` descriptions): ~95 items
- **MEDIUM priority** (feature capability lists): ~70 items
- **LOW priority** (section intro `<p>` text): ~45 items

### Language note:
- Files `sheet.astro`, `base.astro`, `footer.astro`, `header.astro` contain **French** hardcoded text (already needs translation to English as well as i18n)
- All other files have **English** hardcoded text
