import {
  addPlayer,
  clearPlayers,
  go,
  removePlayer,
  updatePlayer,
} from '../state';
import type { AppState } from '../types';
import { el } from './helpers';

export function renderPlayers(state: AppState): HTMLElement {
  const screen = el('section', { className: 'screen' });

  screen.append(
    el('header', { className: 'brand' },
      el('div', { className: 'step-label', text: 'Step 1' }),
      el('h1', { text: 'Mafia Deal' }),
      el('p', {
        text: 'Add everyone at the table. Phone numbers are optional — used only to open WhatsApp or SMS with the role prefilled.',
      }),
    ),
  );

  const list = el('div', { className: 'player-list' });

  if (state.players.length === 0) {
    list.append(el('p', { className: 'empty', text: 'No players yet. Add the first name below.' }));
  }

  for (const player of state.players) {
    const item = el('div', { className: 'player-item' });

    const nameField = el('div', { className: 'field' },
      el('label', { text: 'Name' }),
      el('input', {
        type: 'text',
        value: player.name,
        placeholder: 'Player name',
        autocomplete: 'name',
        'data-focus': `name-${player.id}`,
        onInput: (e: Event) => {
          updatePlayer(player.id, { name: (e.target as HTMLInputElement).value });
        },
      }),
    );

    const phoneField = el('div', { className: 'field' },
      el('label', { text: 'Phone (optional)' }),
      el('input', {
        type: 'tel',
        value: player.phone,
        placeholder: '+1 555…',
        autocomplete: 'tel',
        'data-focus': `phone-${player.id}`,
        onInput: (e: Event) => {
          updatePlayer(player.id, { phone: (e.target as HTMLInputElement).value });
        },
      }),
    );

    item.append(
      el('div', { className: 'row' },
        nameField,
        el('button', {
          className: 'icon-btn',
          type: 'button',
          title: 'Remove player',
          text: '✕',
          onClick: () => removePlayer(player.id),
        }),
      ),
      phoneField,
    );

    list.append(item);
  }

  screen.append(list);

  screen.append(
    el('div', { className: 'actions' },
      el('button', {
        className: 'btn secondary block',
        type: 'button',
        text: 'Add player',
        onClick: () => addPlayer(),
      }),
      state.players.length > 0
        ? el('button', {
            className: 'btn ghost',
            type: 'button',
            text: 'Clear all',
            onClick: () => {
              if (confirm('Remove all players?')) clearPlayers();
            },
          })
        : null,
      el('button', {
        className: 'btn block',
        type: 'button',
        text: 'Next: roles',
        disabled: state.players.length < 3,
        onClick: () => go('roles'),
      }),
    ),
  );

  if (state.players.length > 0 && state.players.length < 3) {
    screen.append(
      el('p', { className: 'status bad', text: 'Add at least 3 players to continue.' }),
    );
  }

  return screen;
}
