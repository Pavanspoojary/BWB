import { describe, expect, it } from 'vitest';
import {
  clampHp,
  nextStreak,
  pickCullVictims,
  rankForXp,
  sortAlive,
  todayKey,
  yesterdayKey,
} from '../src/state/store.ts';
import type { Tool } from '../src/types.ts';

function tool(name: string, hp: number, dead = false): Tool {
  return { id: name, name, category: 'DEVTOOL', blurb: 'test tool', hp, dead };
}

describe('rankForXp', () => {
  it('starts at LURKER and climbs the ladder', () => {
    expect(rankForXp(0)).toBe('LURKER');
    expect(rankForXp(59)).toBe('LURKER');
    expect(rankForXp(60)).toBe('PUNTER');
    expect(rankForXp(160)).toBe('EXECUTIONER');
    expect(rankForXp(380)).toBe('WARDEN');
    expect(rankForXp(800)).toBe('ARCHITECT OF CHAOS');
    expect(rankForXp(1500)).toBe('VOID LORD');
    expect(rankForXp(9999)).toBe('VOID LORD');
  });
});

describe('clampHp', () => {
  it('keeps HP inside [0, 100]', () => {
    expect(clampHp(85)).toBe(85);
    expect(clampHp(140)).toBe(100);
    expect(clampHp(-20)).toBe(0);
    expect(clampHp(0)).toBe(0);
  });
});

describe('nextStreak', () => {
  const today = '2026-09-06';
  const yesterday = '2026-09-05';
  it('extends the chain on consecutive days', () => {
    expect(nextStreak(yesterday, 2, today, yesterday)).toEqual({ streak: 3, lastVoteDay: today });
  });
  it('holds the streak when voting twice in one day', () => {
    expect(nextStreak(today, 3, today, yesterday)).toEqual({ streak: 3, lastVoteDay: today });
  });
  it('resets after a missed day', () => {
    expect(nextStreak('2026-09-01', 5, today, yesterday)).toEqual({ streak: 1, lastVoteDay: today });
  });
  it('starts at 1 for first-time voters', () => {
    expect(nextStreak(null, 1, today, yesterday)).toEqual({ streak: 1, lastVoteDay: today });
  });
});

describe('pickCullVictims', () => {
  it('executes the bottom 3 by HP, skipping the dead', () => {
    const tools = [
      tool('A', 90),
      tool('B', 10),
      tool('C', 50),
      tool('D', 5, true),
      tool('E', 30),
      tool('F', 20),
    ];
    expect(pickCullVictims(tools, 3).map((t) => t.name)).toEqual(['B', 'F', 'E']);
  });
  it('handles arenas smaller than 3', () => {
    expect(pickCullVictims([tool('A', 42)], 3).map((t) => t.name)).toEqual(['A']);
    expect(pickCullVictims([], 3)).toEqual([]);
  });
});

describe('sortAlive', () => {
  it('orders best-first with dead filtered out', () => {
    const tools = [tool('LOW', 10), tool('HIGH', 99), tool('GHOST', 100, true), tool('MID', 50)];
    expect(sortAlive(tools).map((t) => t.name)).toEqual(['HIGH', 'MID', 'LOW']);
  });
});

describe('date keys', () => {
  it('today and yesterday differ by one day', () => {
    const t = new Date(2026, 8, 6, 12);
    expect(todayKey(t)).toBe('2026-09-06');
    expect(yesterdayKey(t)).toBe('2026-09-05');
  });
});
