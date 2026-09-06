import { describe, expect, it } from 'vitest';
import { formatVoteMessage } from '../src/api/arena.ts';

describe('formatVoteMessage', () => {
  it('formats saves with a + sign', () => {
    expect(formatVoteMessage('ANON-123', 'save', 'VITE', 15)).toBe('ANON-123 SAVED VITE +15');
  });
  it('formats kills with the raw negative delta', () => {
    expect(formatVoteMessage('VOID-1', 'kill', 'POSTMAN', -15)).toBe('VOID-1 HIT POSTMAN -15');
  });
});
