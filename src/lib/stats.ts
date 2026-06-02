import type { Match } from './supabase';

export interface PlayerStats {
  playerId: string;
  wins: number;
  losses: number;
  winPct: number;
  opponents: Set<string>;
  playoffEligible: boolean;
}

export function computeStandings(matches: Match[]): PlayerStats[] {
  const statsMap = new Map<string, { wins: number; losses: number; opponents: Set<string> }>();

  function ensure(id: string) {
    if (!statsMap.has(id)) {
      statsMap.set(id, { wins: 0, losses: 0, opponents: new Set() });
    }
    return statsMap.get(id)!;
  }

  for (const match of matches) {
    const winner = ensure(match.winner_id);
    const loser = ensure(match.loser_id);
    winner.wins += 1;
    winner.opponents.add(match.loser_id);
    loser.losses += 1;
    loser.opponents.add(match.winner_id);
  }

  return Array.from(statsMap.entries()).map(([playerId, s]) => {
    const total = s.wins + s.losses;
    const winPct = total > 0 ? s.wins / total : 0;
    // Playoff eligibility: 3+ wins AND 6+ unique opponents
    const playoffEligible = s.wins >= 3 && s.opponents.size >= 6;
    return { playerId, wins: s.wins, losses: s.losses, winPct, opponents: s.opponents, playoffEligible };
  });
}

export interface HeadToHead {
  opponentId: string;
  wins: number;
  losses: number;
}

export function computeHeadToHead(playerId: string, matches: Match[]): HeadToHead[] {
  const h2h = new Map<string, { wins: number; losses: number }>();

  function ensure(id: string) {
    if (!h2h.has(id)) h2h.set(id, { wins: 0, losses: 0 });
    return h2h.get(id)!;
  }

  for (const match of matches) {
    if (match.winner_id === playerId) {
      ensure(match.loser_id).wins += 1;
    } else if (match.loser_id === playerId) {
      ensure(match.winner_id).losses += 1;
    }
  }

  return Array.from(h2h.entries())
    .map(([opponentId, record]) => ({ opponentId, ...record }))
    .sort((a, b) => b.wins - a.wins || a.losses - b.losses);
}
