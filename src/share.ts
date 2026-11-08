import type { Assignment } from './types';

export function roleMessage(assignment: Assignment): string {
  return `Mafia: ${assignment.playerName}, your role is ${assignment.roleName}. Don't show anyone.`;
}

export function whatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/** Prefer query forms that work on both iOS and Android. */
export function smsUrl(text: string): string {
  return `sms:?&body=${encodeURIComponent(text)}`;
}

export async function nativeShare(text: string): Promise<'shared' | 'cancelled' | 'unavailable'> {
  if (typeof navigator === 'undefined' || typeof navigator.share !== 'function') {
    return 'unavailable';
  }
  try {
    await navigator.share({ text });
    return 'shared';
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled';
    return 'unavailable';
  }
}

export function openExternal(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer');
}
