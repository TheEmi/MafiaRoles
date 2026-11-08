import { go, redeal } from '../state';
import type { AppState } from '../types';
import { el } from './helpers';

export function renderOverview(state: AppState): HTMLElement {
  const screen = el('section', { className: 'screen deal-pulse' });

  screen.append(
    el('header', { className: 'brand' },
      el('div', { className: 'step-label', text: 'Storyteller only' }),
      el('h1', { text: 'Dealt' }),
      el('p', {
        text: 'Keep this list private. Share roles one by one, or pass the phone around the table.',
      }),
    ),
  );

  const list = el('div', { className: 'assignment-list' });
  for (const a of state.assignments) {
    list.append(
      el('div', { className: 'assignment-item' },
        el('div', { className: 'row spread' },
          el('strong', { text: a.playerName }),
          el('span', { className: `team-tag ${a.team}`, text: a.team }),
        ),
        el('div', { text: a.roleName }),
      ),
    );
  }

  screen.append(
    list,
    el('div', { className: 'actions' },
      el('button', {
        className: 'btn block',
        type: 'button',
        text: 'Share via WhatsApp / SMS',
        onClick: () => go('share'),
      }),
      el('button', {
        className: 'btn secondary block',
        type: 'button',
        text: 'Pass the phone',
        onClick: () => go('pass'),
      }),
      el('div', { className: 'actions horizontal' },
        el('button', {
          className: 'btn ghost',
          type: 'button',
          text: 'Redeal',
          onClick: () => {
            if (confirm('Shuffle roles again?')) redeal();
          },
        }),
        el('button', {
          className: 'btn ghost',
          type: 'button',
          text: 'Edit roles',
          onClick: () => go('roles'),
        }),
        el('button', {
          className: 'btn ghost',
          type: 'button',
          text: 'Players',
          onClick: () => go('players'),
        }),
      ),
    ),
  );

  return screen;
}
