import './styles.css';
import { getState, subscribe } from './state';
import type { AppState } from './types';
import { clear } from './ui/helpers';
import { renderOverview } from './ui/overview';
import { renderPass } from './ui/pass';
import { renderPlayers } from './ui/players';
import { renderRoles } from './ui/roles';
import { renderShare } from './ui/share';

const root = document.querySelector<HTMLDivElement>('#app');
if (!root) throw new Error('#app missing');
const app: HTMLDivElement = root;

function renderScreen(state: AppState): HTMLElement {
  switch (state.screen) {
    case 'players':
      return renderPlayers(state);
    case 'roles':
      return renderRoles(state);
    case 'overview':
      return renderOverview(state);
    case 'share':
      return renderShare(state);
    case 'pass':
      return renderPass(state);
    default:
      return renderPlayers(state);
  }
}

function render(): void {
  const active = document.activeElement as HTMLElement | null;
  const focusKey = active?.getAttribute('data-focus');
  const selection =
    active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement
      ? { start: active.selectionStart, end: active.selectionEnd }
      : null;

  clear(app);
  app.append(renderScreen(getState()));

  if (focusKey) {
    const next = app.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      `[data-focus="${CSS.escape(focusKey)}"]`,
    );
    if (next) {
      next.focus();
      if (
        selection &&
        selection.start != null &&
        selection.end != null &&
        'setSelectionRange' in next
      ) {
        next.setSelectionRange(selection.start, selection.end);
      }
    }
  }
}

subscribe(render);
render();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* optional PWA */
    });
  });
}
