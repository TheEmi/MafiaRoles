import { dealRoles } from './deal';
import { defaultRoleConfig, suggestedMafiaCount, validateRoles } from './roles';
import type {
  AppState,
  Assignment,
  CustomRole,
  PassPhase,
  Player,
  RoleConfig,
  Screen,
  ToggleKey,
} from './types';

const PLAYERS_KEY = 'mafia-deal-players';

type Listener = () => void;

function loadPlayers(): Player[] {
  try {
    const raw = localStorage.getItem(PLAYERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Player[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((p) => p && typeof p.name === 'string')
      .map((p) => ({
        id: typeof p.id === 'string' ? p.id : crypto.randomUUID(),
        name: p.name,
        phone: typeof p.phone === 'string' ? p.phone : '',
      }));
  } catch {
    return [];
  }
}

function savePlayers(players: Player[]): void {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

function createState(): AppState {
  const players = loadPlayers();
  return {
    screen: 'players',
    players,
    roles: defaultRoleConfig(players.length),
    assignments: [],
    passIndex: 0,
    passPhase: 'cover',
  };
}

let state = createState();
const listeners = new Set<Listener>();

export function getState(): AppState {
  return state;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  for (const listener of listeners) listener();
}

function setState(patch: Partial<AppState>): void {
  state = { ...state, ...patch };
  emit();
}

export function go(screen: Screen): void {
  setState({ screen });
}

export function addPlayer(name = '', phone = ''): void {
  const players = [
    ...state.players,
    { id: crypto.randomUUID(), name, phone },
  ];
  savePlayers(players);
  setState({
    players,
    roles: {
      ...state.roles,
      mafiaCount: suggestedMafiaCount(players.length),
    },
  });
}

export function updatePlayer(id: string, patch: Partial<Pick<Player, 'name' | 'phone'>>): void {
  const players = state.players.map((p) => (p.id === id ? { ...p, ...patch } : p));
  savePlayers(players);
  setState({ players });
}

export function removePlayer(id: string): void {
  const players = state.players.filter((p) => p.id !== id);
  savePlayers(players);
  setState({
    players,
    roles: {
      ...state.roles,
      mafiaCount: suggestedMafiaCount(players.length),
    },
  });
}

export function clearPlayers(): void {
  savePlayers([]);
  setState({
    players: [],
    roles: defaultRoleConfig(0),
    assignments: [],
  });
}

export function resetRolesToSuggested(): void {
  setState({ roles: defaultRoleConfig(state.players.length) });
}

export function setMafiaCount(count: number): void {
  const max = Math.max(1, state.players.length - 1);
  setState({
    roles: {
      ...state.roles,
      mafiaCount: Math.min(max, Math.max(0, Math.floor(count))),
    },
  });
}

export function setToggle(key: ToggleKey, enabled: boolean): void {
  setState({
    roles: {
      ...state.roles,
      toggles: { ...state.roles.toggles, [key]: enabled },
    },
  });
}

export function addCustomRole(role: CustomRole): void {
  setState({
    roles: { ...state.roles, custom: [...state.roles.custom, role] },
  });
}

export function updateCustomRole(id: string, patch: Partial<CustomRole>): void {
  setState({
    roles: {
      ...state.roles,
      custom: state.roles.custom.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    },
  });
}

export function removeCustomRole(id: string): void {
  setState({
    roles: {
      ...state.roles,
      custom: state.roles.custom.filter((c) => c.id !== id),
    },
  });
}

export function setRoles(roles: RoleConfig): void {
  setState({ roles });
}

export function deal(): { ok: boolean; message: string } {
  const result = validateRoles(state.roles, state.players);
  if (!result.ok) return { ok: false, message: result.message };
  const assignments = dealRoles(state.players, result.pool);
  setState({
    assignments,
    screen: 'overview',
    passIndex: 0,
    passPhase: 'cover',
  });
  return { ok: true, message: result.message };
}

export function redeal(): { ok: boolean; message: string } {
  return deal();
}

export function setPassIndex(index: number): void {
  setState({ passIndex: index, passPhase: 'cover' });
}

export function setPassPhase(phase: PassPhase): void {
  setState({ passPhase: phase });
}

export function nextPassPlayer(): void {
  const next = state.passIndex + 1;
  if (next >= state.assignments.length) {
    setState({ screen: 'overview', passIndex: 0, passPhase: 'cover' });
    return;
  }
  setState({ passIndex: next, passPhase: 'cover' });
}

export function getAssignment(playerId: string): Assignment | undefined {
  return state.assignments.find((a) => a.playerId === playerId);
}
