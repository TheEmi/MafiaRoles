import type { Assignment, Player, RoleSlot } from './types';

export function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function dealRoles(players: Player[], pool: RoleSlot[]): Assignment[] {
  const roles = shuffle(pool);
  const order = shuffle(players);
  return order.map((player, index) => ({
    playerId: player.id,
    playerName: player.name.trim(),
    roleName: roles[index].name,
    team: roles[index].team,
  }));
}
