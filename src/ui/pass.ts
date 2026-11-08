import { finishPassToStoryteller, go, nextPassPlayer, setPassPhase } from '../state';
import type { AppState } from '../types';
import { el } from './helpers';

export function renderPass(state: AppState): HTMLElement {
  const screen = el('section', { className: 'screen pass-shell' });

  if (state.passPhase === 'done') {
    screen.append(
      el('div', { className: 'step-label', text: 'Pass-the-phone · done' }),
      el('div', {
        className: 'pass-cover',
        role: 'button',
        tabindex: '0',
        onClick: () => finishPassToStoryteller(),
        onKeydown: (e: KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            finishPassToStoryteller();
          }
        },
      },
        el('p', { className: 'hint', text: 'All roles delivered' }),
        el('h2', { text: 'Hand the phone back' }),
        el('p', { className: 'hint', text: 'Storyteller: tap to continue' }),
      ),
    );
    return screen;
  }

  const assignment = state.assignments[state.passIndex];
  const progress = `${state.passIndex + 1} / ${state.assignments.length}`;

  if (!assignment) {
    screen.append(
      el('p', { className: 'empty', text: 'No roles dealt yet.' }),
      el('button', {
        className: 'btn block',
        type: 'button',
        text: 'Back',
        onClick: () => go('overview'),
      }),
    );
    return screen;
  }

  screen.append(el('div', { className: 'step-label', text: `Pass-the-phone · ${progress}` }));

  if (state.passPhase === 'cover') {
    const cover = el('div', {
      className: 'pass-cover',
      role: 'button',
      tabindex: '0',
      onClick: () => setPassPhase('reveal'),
      onKeydown: (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setPassPhase('reveal');
        }
      },
    },
      el('p', { className: 'hint', text: 'Hand the phone to' }),
      el('h2', { text: assignment.playerName }),
      el('p', { className: 'hint', text: 'Tap to reveal · look away, storyteller' }),
    );
    screen.append(cover);
  } else {
    const reveal = el('div', {
      className: 'pass-reveal',
      role: 'button',
      tabindex: '0',
      onClick: () => nextPassPlayer(),
      onKeydown: (e: KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          nextPassPlayer();
        }
      },
    },
      el('p', { className: 'hint', text: assignment.playerName }),
      el('p', { className: `team-tag ${assignment.team}`, text: assignment.team }),
      el('h2', { className: 'role-name', text: assignment.roleName }),
      el('p', {
        className: 'hint',
        text:
          state.passIndex + 1 < state.assignments.length
            ? 'Memorize it, then tap to hide and pass on'
            : 'Memorize it, then tap to hide',
      }),
    );
    screen.append(reveal);
  }

  screen.append(
    el('button', {
      className: 'btn ghost',
      type: 'button',
      text: 'Cancel · back to overview',
      onClick: () => go('overview'),
    }),
  );

  return screen;
}
