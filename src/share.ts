import type { Assignment } from './types';

export function roleMessage(assignment: Assignment): string {
  return `Mafia: ${assignment.playerName}, your role is ${assignment.roleName}. Don't show anyone.`;
}

export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function whatsappUrl(phone: string, text: string): string {
  const digits = digitsOnly(phone);
  const base = digits ? `https://wa.me/${digits}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(text)}`;
}

/** Prefer query forms that work on both iOS and Android. */
export function smsUrl(phone: string, text: string): string {
  const body = encodeURIComponent(text);
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned) return `sms:${cleaned}?&body=${body}`;
  return `sms:?&body=${body}`;
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
