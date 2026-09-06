export type VoteKind = 'save' | 'kill';

export interface Tool {
  id: string;
  name: string;
  category: string;
  blurb: string;
  hp: number;
  dead: boolean;
  fresh?: boolean;
}

export interface DeadEntry {
  n: string;
  c: string;
  by: string;
  day: number;
  ep: string;
}

export interface FlowMap {
  [toolId: string]: [number, number];
}

export interface LocalPlayer {
  date: string;
  ammo: number;
  xp: number;
  user: string;
  streak: number;
  muted: boolean;
  lastVoteDay: string | null;
  lastSeen: number | null;
  deadCache: string[];
}
