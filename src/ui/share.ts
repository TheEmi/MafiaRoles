import { go } from '../state';
import {
  nativeShare,
  openExternal,
  roleMessage,
  smsUrl,
  whatsappUrl,
} from '../share';
import type { AppState, Assignment } from '../types';
import { el } from './helpers';

async function shareNative(assignment: Assignment): Promise<void> {
  const text = roleMessage(assignment);
  const result = await nativeShare(text);
  if (result === 'unavailable') {
    openExternal(whatsappUrl(assignment.phone, text));
  }
}

export function renderShare(state: AppState): HTMLElement {
  const screen = el('section', { className: 'screen' });
  const canNative = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  screen.append(
    el('header', { className: 'brand' },
      el('div', { className: 'step-label', text: 'Deliver' }),
      el('h1', { text: 'Share' }),
      el('p', {
        text: 'Opens WhatsApp, Messages, or your share sheet with the role text ready. Nothing is sent from this app.',
      }),
    ),
  );

  const list = el('div', { className: 'share-list' });

  for (const a of state.assignments) {
    const text = roleMessage(a);
    const item = el('div', { className: 'share-item' },
      el('div', { className: 'row spread' },
        el('strong', { text: a.playerName }),
        el('span', { className: `team-tag ${a.team}`, text: a.roleName }),
      ),
      el('div', { className: 'share-actions' },
        canNative
          ? el('button', {
              className: 'btn small',
              type: 'button',
              text: 'Share…',
              onClick: () => {
                void shareNative(a);
              },
            })
          : null,
        el('button', {
          className: 'btn secondary small',
          type: 'button',
          text: 'WhatsApp',
          onClick: () => openExternal(whatsappUrl(a.phone, text)),
        }),
        el('button', {
          className: 'btn secondary small',
          type: 'button',
          text: 'SMS',
          onClick: () => {
            window.location.href = smsUrl(a.phone, text);
          },
        }),
      ),
    );
    list.append(item);
  }

  screen.append(
    list,
    el('div', { className: 'actions' },
      el('button', {
        className: 'btn secondary block',
        type: 'button',
        text: 'Back to overview',
        onClick: () => go('overview'),
      }),
      el('button', {
        className: 'btn ghost',
        type: 'button',
        text: 'Pass the phone instead',
        onClick: () => go('pass'),
      }),
    ),
  );

  return screen;
}
