import type { CustomRole, Player, RoleConfig, RoleSlot, ToggleKey } from './types';

export const TOGGLE_ROLES: Record<
  ToggleKey,
  { name: string; team: RoleSlot['team']; blurb: string }
> = {
  detective: {
    name: 'Detective',
    team: 'town',
    blurb: 'Investigate one player each night',
  },
  doctor: {
    name: 'Doctor',
    team: 'town',
    blurb: 'Protect one player each night',
  },
  jester: {
    name: 'Jester',
    team: 'neutral',
    blurb: 'Wins if eliminated by vote',
  },
};

export function suggestedMafiaCount(playerCount: number): number {
  if (playerCount <= 0) return 0;
  if (playerCount <= 5) return 1;
  if (playerCount <= 8) return 2;
  if (playerCount <= 12) return 3;
  return Math.max(1, Math.floor(playerCount / 4));
}

export function defaultRoleConfig(playerCount: number): RoleConfig {
  return {
    mafiaCount: suggestedMafiaCount(playerCount),
    toggles: {
      detective: false,
      doctor: false,
      jester: false,
    },
    custom: [],
  };
}

export function buildRolePool(config: RoleConfig, playerCount: number): RoleSlot[] {
  const pool: RoleSlot[] = [];

  for (let i = 0; i < config.mafiaCount; i += 1) {
    pool.push({ name: 'Mafia', team: 'mafia' });
  }

  for (const key of Object.keys(config.toggles) as ToggleKey[]) {
    if (config.toggles[key]) {
      const def = TOGGLE_ROLES[key];
      pool.push({ name: def.name, team: def.team });
    }
  }

  for (const custom of config.custom) {
    const count = Math.max(0, Math.floor(custom.count));
    for (let i = 0; i < count; i += 1) {
      pool.push({ name: custom.name.trim() || 'Custom', team: custom.team });
    }
  }

  const remaining = playerCount - pool.length;
  for (let i = 0; i < remaining; i += 1) {
    pool.push({ name: 'Townsperson', team: 'town' });
  }

  return pool;
}

export function validateRoles(
  config: RoleConfig,
  players: Player[],
): { ok: boolean; message: string; pool: RoleSlot[] } {
  const playerCount = players.length;
  if (playerCount < 3) {
    return { ok: false, message: 'Need at least 3 players.', pool: [] };
  }

  const named = players.every((p) => p.name.trim().length > 0);
  if (!named) {
    return { ok: false, message: 'Every player needs a name.', pool: [] };
  }

  if (config.mafiaCount < 1) {
    return { ok: false, message: 'Need at least 1 Mafia.', pool: [] };
  }

  const specialCount =
    Object.values(config.toggles).filter(Boolean).length +
    config.custom.reduce((sum, c) => sum + Math.max(0, Math.floor(c.count)), 0);

  const reserved = config.mafiaCount + specialCount;
  if (reserved > playerCount) {
    return {
      ok: false,
      message: `Too many roles (${reserved}) for ${playerCount} players.`,
      pool: [],
    };
  }

  if (reserved === playerCount) {
    return {
      ok: false,
      message: 'Leave at least one Townsperson slot.',
      pool: [],
    };
  }

  for (const custom of config.custom) {
    if (!custom.name.trim()) {
      return { ok: false, message: 'Custom roles need a name.', pool: [] };
    }
  }

  const pool = buildRolePool(config, playerCount);
  if (pool.length !== playerCount) {
    return {
      ok: false,
      message: `Role count (${pool.length}) must equal players (${playerCount}).`,
      pool,
    };
  }

  return { ok: true, message: 'Ready to deal.', pool };
}

export function summarizePool(pool: RoleSlot[]): { name: string; count: number; team: RoleSlot['team'] }[] {
  const map = new Map<string, { name: string; count: number; team: RoleSlot['team'] }>();
  for (const slot of pool) {
    const key = `${slot.team}:${slot.name}`;
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { name: slot.name, count: 1, team: slot.team });
  }
  return [...map.values()];
}

export function newCustomRole(): CustomRole {
  return {
    id: crypto.randomUUID(),
    name: '',
    count: 1,
    team: 'town',
  };
}
