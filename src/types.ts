export type Team = 'mafia' | 'town' | 'neutral';

export type Player = {
  id: string;
  name: string;
  phone: string;
};

export type ToggleKey = 'detective' | 'doctor' | 'jester';

export type CustomRole = {
  id: string;
  name: string;
  count: number;
  team: Team;
};

export type RoleConfig = {
  mafiaCount: number;
  toggles: Record<ToggleKey, boolean>;
  custom: CustomRole[];
};

export type RoleSlot = {
  name: string;
  team: Team;
};

export type Assignment = {
  playerId: string;
  playerName: string;
  phone: string;
  roleName: string;
  team: Team;
};

export type Screen = 'players' | 'roles' | 'overview' | 'share' | 'pass';

export type PassPhase = 'cover' | 'reveal';

export type AppState = {
  screen: Screen;
  players: Player[];
  roles: RoleConfig;
  assignments: Assignment[];
  passIndex: number;
  passPhase: PassPhase;
};
