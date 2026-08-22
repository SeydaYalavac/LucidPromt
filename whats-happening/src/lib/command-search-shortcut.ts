type KeyboardShortcutEvent = Pick<
  KeyboardEvent,
  "altKey" | "ctrlKey" | "key" | "metaKey" | "repeat" | "shiftKey" | "target"
>;

type EditableShortcutTarget = EventTarget & {
  closest?: (selector: string) => Element | null;
  isContentEditable?: boolean;
  tagName?: string;
};

export function isEditableShortcutTarget(target: EventTarget | null) {
  if (!target || typeof target !== "object") return false;

  const element = target as EditableShortcutTarget;
  const tagName = element.tagName?.toLocaleLowerCase();
  if (tagName === "input" || tagName === "textarea" || tagName === "select") return true;
  if (element.isContentEditable) return true;

  return Boolean(
    element.closest?.(
      '[contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"], [role="textbox"]',
    ),
  );
}

export function shouldOpenCommandSearch(event: KeyboardShortcutEvent) {
  return (
    !event.repeat &&
    !event.altKey &&
    !event.shiftKey &&
    (event.metaKey || event.ctrlKey) &&
    event.key.toLocaleLowerCase() === "k" &&
    !isEditableShortcutTarget(event.target)
  );
}
