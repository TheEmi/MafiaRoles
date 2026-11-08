import {
  addCustomRole,
  deal,
  go,
  removeCustomRole,
  resetRolesToSuggested,
  setMafiaCount,
  setToggle,
  updateCustomRole,
} from '../state';
import {
  TOGGLE_ROLES,
  buildRolePool,
  newCustomRole,
  summarizePool,
  validateRoles,
} from '../roles';
import type { AppState, Team, ToggleKey } from '../types';
import { el } from './helpers';

export function renderRoles(state: AppState): HTMLElement {
  const screen = el('section', { className: 'screen' });
  const validation = validateRoles(state.roles, state.players);
  const pool = validation.ok
    ? validation.pool
    : buildRolePool(state.roles, state.players.length);
  const summary = summarizePool(pool);

  screen.append(
    el('header', { className: 'brand' },
      el('div', { className: 'step-label', text: 'Step 2' }),
      el('h1', { text: 'Roles' }),
      el('p', {
        className: 'lede',
        text: `${state.players.length} players. Classic Mafia + Townsperson by default. Flip toggles or add custom roles.`,
      }),
    ),
  );

  const mafiaBlock = el('div', { className: 'stack' },
    el('h2', { className: 'section-title', text: 'Mafia' }),
    el('div', { className: 'count-control' },
      el('button', {
        className: 'btn secondary small',
        type: 'button',
        text: '−',
        onClick: () => setMafiaCount(state.roles.mafiaCount - 1),
      }),
      el('strong', { text: String(state.roles.mafiaCount) }),
      el('button', {
        className: 'btn secondary small',
        type: 'button',
        text: '+',
        onClick: () => setMafiaCount(state.roles.mafiaCount + 1),
      }),
      el('button', {
        className: 'btn ghost small',
        type: 'button',
        text: 'Reset defaults',
        onClick: () => resetRolesToSuggested(),
      }),
    ),
  );

  const toggleList = el('div', { className: 'toggle-list' });
  for (const key of Object.keys(TOGGLE_ROLES) as ToggleKey[]) {
    const def = TOGGLE_ROLES[key];
    const enabled = state.roles.toggles[key];
    toggleList.append(
      el('label', { className: 'toggle' },
        el('span', { className: 'name', text: def.name }),
        el('input', {
          type: 'checkbox',
          checked: enabled,
          onChange: (e: Event) => {
            setToggle(key, (e.target as HTMLInputElement).checked);
          },
        }),
        el('span', { className: 'blurb', text: def.blurb }),
      ),
    );
  }

  const customBlock = el('div', { className: 'stack' },
    el('div', { className: 'row spread' },
      el('h2', { className: 'section-title', text: 'Custom' }),
      el('button', {
        className: 'btn secondary small',
        type: 'button',
        text: 'Add role',
        onClick: () => addCustomRole(newCustomRole()),
      }),
    ),
  );

  if (state.roles.custom.length === 0) {
    customBlock.append(
      el('p', { className: 'empty', text: 'No custom roles. Add one if your house rules need it.' }),
    );
  }

  for (const custom of state.roles.custom) {
    const item = el('div', { className: 'custom-item' });
    item.append(
      el('div', { className: 'row player-row' },
        el('div', { className: 'field' },
          el('label', { text: 'Role name' }),
          el('input', {
            type: 'text',
            value: custom.name,
            placeholder: 'e.g. Bodyguard',
            'data-focus': `custom-name-${custom.id}`,
            onInput: (e: Event) => {
              updateCustomRole(custom.id, { name: (e.target as HTMLInputElement).value });
            },
            onChange: (e: Event) => {
              updateCustomRole(
                custom.id,
                { name: (e.target as HTMLInputElement).value },
                { render: true },
              );
            },
          }),
        ),
        el('button', {
          className: 'icon-btn',
          type: 'button',
          text: '✕',
          title: 'Remove',
          onClick: () => removeCustomRole(custom.id),
        }),
      ),
      el('div', { className: 'row' },
        el('div', { className: 'field' },
          el('label', { text: 'Count' }),
          el('input', {
            type: 'number',
            min: '1',
            max: String(Math.max(1, state.players.length - 1)),
            value: String(custom.count),
            'data-focus': `custom-count-${custom.id}`,
            onChange: (e: Event) => {
              updateCustomRole(
                custom.id,
                { count: Number((e.target as HTMLInputElement).value) || 0 },
                { render: true },
              );
            },
          }),
        ),
        el('div', { className: 'field' },
          el('label', { text: 'Team' }),
          el('select', {
            value: custom.team,
            onChange: (e: Event) => {
              updateCustomRole(
                custom.id,
                { team: (e.target as HTMLSelectElement).value as Team },
                { render: true },
              );
            },
          },
            el('option', { value: 'town', text: 'Town' }),
            el('option', { value: 'mafia', text: 'Mafia' }),
            el('option', { value: 'neutral', text: 'Neutral' }),
          ),
        ),
      ),
    );
    customBlock.append(item);
  }

  const pills = el('div', { className: 'pill-row' });
  for (const item of summary) {
    pills.append(
      el('span', { className: `pill ${item.team}` },
        el('span', { className: 'dot' }),
        `${item.count}× ${item.name}`,
      ),
    );
  }

  screen.append(
    mafiaBlock,
    el('div', { className: 'stack' },
      el('h2', { className: 'section-title', text: 'Town specials' }),
      toggleList,
    ),
    customBlock,
    el('div', { className: 'stack' },
      el('h2', { className: 'section-title', text: 'Deal pool' }),
      pills,
      el('div', {
        className: `status ${validation.ok ? 'ok' : 'bad'}`,
        text: validation.message,
      }),
    ),
    el('div', { className: 'actions' },
      el('button', {
        className: 'btn secondary block',
        type: 'button',
        text: 'Back to players',
        onClick: () => go('players'),
      }),
      el('button', {
        className: 'btn block',
        type: 'button',
        text: 'Deal roles',
        disabled: !validation.ok,
        onClick: () => {
          const result = deal();
          if (!result.ok) alert(result.message);
        },
      }),
    ),
  );

  return screen;
}
