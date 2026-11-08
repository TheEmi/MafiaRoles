export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Record<string, unknown> = {},
  ...children: (Node | string | null | undefined | false)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  let pendingValue: string | undefined;

  for (const [key, value] of Object.entries(props)) {
    if (value == null || value === false) continue;
    if (key === 'className') {
      node.className = String(value);
    } else if (key === 'text') {
      node.textContent = String(value);
    } else if (key.startsWith('on') && typeof value === 'function') {
      const event = key.slice(2).toLowerCase();
      node.addEventListener(event, value as EventListener);
    } else if (key === 'htmlFor') {
      (node as HTMLLabelElement).htmlFor = String(value);
    } else if (key === 'checked' && node instanceof HTMLInputElement) {
      node.checked = Boolean(value);
    } else if (key === 'value' && (node instanceof HTMLInputElement || node instanceof HTMLSelectElement)) {
      pendingValue = String(value);
    } else if (key === 'disabled') {
      (node as HTMLButtonElement).disabled = Boolean(value);
    } else if (key === 'selected' && node instanceof HTMLOptionElement) {
      node.selected = Boolean(value);
    } else {
      node.setAttribute(key, String(value));
    }
  }

  for (const child of children) {
    if (child == null || child === false) continue;
    node.append(child instanceof Node ? child : document.createTextNode(child));
  }

  if (pendingValue !== undefined) {
    (node as HTMLInputElement | HTMLSelectElement).value = pendingValue;
  }

  return node;
}

export function clear(node: HTMLElement): void {
  node.replaceChildren();
}
