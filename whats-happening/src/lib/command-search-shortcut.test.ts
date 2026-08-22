import { describe, expect, it } from "vitest";
import { isEditableShortcutTarget, shouldOpenCommandSearch } from "./command-search-shortcut";

function keyboardEvent(overrides: Partial<Parameters<typeof shouldOpenCommandSearch>[0]> = {}) {
  return {
    altKey: false,
    ctrlKey: false,
    key: "k",
    metaKey: false,
    repeat: false,
    shiftKey: false,
    target: null,
    ...overrides,
  };
}

describe("command search shortcut", () => {
  it("opens for Cmd+K and Ctrl+K from non-editable page states", () => {
    expect(shouldOpenCommandSearch(keyboardEvent({ metaKey: true }))).toBe(true);
    expect(shouldOpenCommandSearch(keyboardEvent({ ctrlKey: true, key: "K" }))).toBe(true);
  });

  it("leaves modified and repeated shortcuts to the browser", () => {
    expect(shouldOpenCommandSearch(keyboardEvent({ metaKey: true, shiftKey: true }))).toBe(false);
    expect(shouldOpenCommandSearch(keyboardEvent({ ctrlKey: true, altKey: true }))).toBe(false);
    expect(shouldOpenCommandSearch(keyboardEvent({ ctrlKey: true, repeat: true }))).toBe(false);
    expect(shouldOpenCommandSearch(keyboardEvent({ key: "k" }))).toBe(false);
  });

  it("does not intercept inputs, textareas, selects, or contenteditable descendants", () => {
    for (const tagName of ["INPUT", "textarea", "Select"]) {
      const target = { tagName } as unknown as EventTarget;
      expect(isEditableShortcutTarget(target)).toBe(true);
      expect(shouldOpenCommandSearch(keyboardEvent({ ctrlKey: true, target }))).toBe(false);
    }

    const editable = { isContentEditable: true } as unknown as EventTarget;
    const editableDescendant = { closest: () => ({}) } as unknown as EventTarget;
    expect(isEditableShortcutTarget(editable)).toBe(true);
    expect(isEditableShortcutTarget(editableDescendant)).toBe(true);
  });
});
