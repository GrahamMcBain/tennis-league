<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase, type Match } from '$lib/supabase';
  import { players, getPlayer } from '$lib/players';

  let matches: Match[] = [];
  let loading = true;
  let error = '';
  let selectedId = '';

  onMount(async () => {
    const { data, error: err } = await supabase.from('matches').select('*');
    if (err) error = err.message;
    else matches = data ?? [];
    loading = false;
  });

  interface Suggestion {
    player: typeof players[0];
    played: number;     // times already played
    youWon: number;
    youLost: number;
    priority: 'unplayed' | 'need-for-playoffs' | 'rematch';
    reason: string;
  }

  function getSuggestions(playerId: string, matches: Match[]): Suggestion[] {
    if (!playerId) return [];

    // Build head-to-head record
    const h2h = new Map<string, { wins: number; losses: number }>();
    for (const m of matches) {
      if (m.winner_id === playerId) {
        const r = h2h.get(m.loser_id) ?? { wins: 0, losses: 0 };
        r.wins++;
        h2h.set(m.loser_id, r);
      } else if (m.loser_id === playerId) {
        const r = h2h.get(m.winner_id) ?? { wins: 0, losses: 0 };
        r.losses++;
        h2h.set(m.winner_id, r);
      }
    }

    const uniqueOpponents = h2h.size;
    const totalWins = Array.from(h2h.values()).reduce((s, r) => s + r.wins, 0);
    const needOpponents = Math.max(0, 6 - uniqueOpponents); // need 6 unique for playoffs
    const needWins = Math.max(0, 3 - totalWins);

    const suggestions: Suggestion[] = [];

    for (const p of players) {
      if (p.id === playerId) continue;
      const record = h2h.get(p.id);
      const played = record ? record.wins + record.losses : 0;

      let priority: Suggestion['priority'];
      let reason: string;

      if (!record) {
        priority = 'unplayed';
        reason = needOpponents > 0
          ? `New opponent — need ${needOpponents} more for playoff eligibility`
          : 'New opponent — great for your record';
      } else if (needOpponents > 0 || needWins > 0) {
        priority = 'need-for-playoffs';
        const parts = [];
        if (needOpponents > 0) parts.push(`${needOpponents} more unique opponent${needOpponents > 1 ? 's' : ''} needed`);
        if (needWins > 0) parts.push(`${needWins} more win${needWins > 1 ? 's' : ''} needed`);
        reason = parts.join(' · ');
      } else {
        priority = 'rematch';
        const w = record!.wins, l = record!.losses;
        if (w > l) reason = `You lead ${w}–${l} — defend your edge`;
        else if (l > w) reason = `You trail ${l}–${w} — chance to even the score`;
        else reason = `All square ${w}–${l} — tiebreaker time`;
      }

      suggestions.push({
        player: p,
        played,
        youWon: record?.wins ?? 0,
        youLost: record?.losses ?? 0,
        priority,
        reason,
      });
    }

    // Sort: unplayed first, then need-for-playoffs, then rematches
    const order = { unplayed: 0, 'need-for-playoffs': 1, rematch: 2 };
    suggestions.sort((a, b) => order[a.priority] - order[b.priority]);

    return suggestions;
  }

  $: suggestions = getSuggestions(selectedId, matches);
  $: unplayed = suggestions.filter(s => s.priority === 'unplayed');
  $: needPlayoffs = suggestions.filter(s => s.priority === 'need-for-playoffs');
  $: rematches = suggestions.filter(s => s.priority === 'rematch');

  const priorityColors = {
    unplayed: 'bg-green-50 border-green-200',
    'need-for-playoffs': 'bg-yellow-50 border-yellow-200',
    rematch: 'bg-blue-50 border-blue-200',
  };

  const badgeColors = {
    unplayed: 'bg-green-100 text-green-800',
    'need-for-playoffs': 'bg-yellow-100 text-yellow-800',
    rematch: 'bg-blue-100 text-blue-800',
  };
</script>

<svelte:head>
  <title>Matchmaker — Tennis League</title>
</svelte:head>

<div class="mb-6">
  <h1 class="text-3xl font-bold text-tennis-dark">Matchmaker</h1>
  <p class="text-gray-600 mt-1">Pick yourself to see who you should reach out to next.</p>
</div>

{#if loading}
  <div class="flex items-center justify-center py-16 text-tennis-secondary">
    <svg class="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
    Loading…
  </div>
{:else if error}
  <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">Error: {error}</div>
{:else}
  <div class="mb-8">
    <label for="player-select" class="block text-sm font-semibold text-gray-700 mb-2">Who are you?</label>
    <select
      id="player-select"
      bind:value={selectedId}
      class="w-full sm:w-72 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-tennis-primary bg-white"
    >
      <option value="">— Select your name —</option>
      {#each players as p}
        <option value={p.id}>{p.name}</option>
      {/each}
    </select>
  </div>

  {#if selectedId}
    {@const totalWins = suggestions.reduce((s, r) => s + r.youWon, 0)}
    {@const uniqueOpp = suggestions.filter(s => s.played > 0).length}

    <!-- Status bar -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
        <div class="text-3xl font-bold text-tennis-secondary">{totalWins}</div>
        <div class="text-xs text-gray-500 mt-1">Wins <span class="text-gray-400">(need 3)</span></div>
        {#if totalWins >= 3}<div class="text-xs text-green-600 font-semibold mt-1">✓ Done</div>{/if}
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
        <div class="text-3xl font-bold text-tennis-secondary">{uniqueOpp}</div>
        <div class="text-xs text-gray-500 mt-1">Unique opponents <span class="text-gray-400">(need 6)</span></div>
        {#if uniqueOpp >= 6}<div class="text-xs text-green-600 font-semibold mt-1">✓ Done</div>{/if}
      </div>
      <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
        <div class="text-3xl font-bold {totalWins >= 3 && uniqueOpp >= 6 ? 'text-green-600' : 'text-gray-400'}">
          {totalWins >= 3 && uniqueOpp >= 6 ? '✓' : '✗'}
        </div>
        <div class="text-xs text-gray-500 mt-1">Playoff eligible</div>
      </div>
    </div>

    <!-- Suggestion sections -->
    {#if unplayed.length}
      <h2 class="text-lg font-bold text-gray-800 mb-3">Haven't played yet ({unplayed.length})</h2>
      <div class="space-y-3 mb-8">
        {#each unplayed as s}
          <div class="rounded-xl border {priorityColors[s.priority]} p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-900">{s.player.name}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium {badgeColors[s.priority]}">New match</span>
              </div>
              <p class="text-sm text-gray-600 mt-0.5">{s.reason}</p>
            </div>
            <div class="flex gap-3 text-sm shrink-0">
              <a href="mailto:{s.player.email}" class="flex items-center gap-1.5 px-3 py-1.5 bg-tennis-primary text-white rounded-lg hover:bg-tennis-dark transition-colors font-medium">
                ✉ Email
              </a>
              <a href="tel:{s.player.phone}" class="flex items-center gap-1.5 px-3 py-1.5 border border-tennis-primary text-tennis-primary rounded-lg hover:bg-tennis-pale transition-colors font-medium">
                ☎ Call
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    {#if needPlayoffs.length}
      <h2 class="text-lg font-bold text-gray-800 mb-3">Needed for playoffs ({needPlayoffs.length})</h2>
      <div class="space-y-3 mb-8">
        {#each needPlayoffs as s}
          <div class="rounded-xl border {priorityColors[s.priority]} p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-900">{s.player.name}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium {badgeColors[s.priority]}">
                  {s.played} match{s.played !== 1 ? 'es' : ''} · {s.youWon}W {s.youLost}L
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-0.5">{s.reason}</p>
            </div>
            <div class="flex gap-3 text-sm shrink-0">
              <a href="mailto:{s.player.email}" class="flex items-center gap-1.5 px-3 py-1.5 bg-tennis-primary text-white rounded-lg hover:bg-tennis-dark transition-colors font-medium">
                ✉ Email
              </a>
              <a href="tel:{s.player.phone}" class="flex items-center gap-1.5 px-3 py-1.5 border border-tennis-primary text-tennis-primary rounded-lg hover:bg-tennis-pale transition-colors font-medium">
                ☎ Call
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}

    {#if rematches.length}
      <h2 class="text-lg font-bold text-gray-800 mb-3">Rematches ({rematches.length})</h2>
      <div class="space-y-3">
        {#each rematches as s}
          <div class="rounded-xl border {priorityColors[s.priority]} p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-gray-900">{s.player.name}</span>
                <span class="text-xs px-2 py-0.5 rounded-full font-medium {badgeColors[s.priority]}">
                  {s.youWon}W {s.youLost}L
                </span>
              </div>
              <p class="text-sm text-gray-600 mt-0.5">{s.reason}</p>
            </div>
            <div class="flex gap-3 text-sm shrink-0">
              <a href="mailto:{s.player.email}" class="flex items-center gap-1.5 px-3 py-1.5 bg-tennis-primary text-white rounded-lg hover:bg-tennis-dark transition-colors font-medium">
                ✉ Email
              </a>
              <a href="tel:{s.player.phone}" class="flex items-center gap-1.5 px-3 py-1.5 border border-tennis-primary text-tennis-primary rounded-lg hover:bg-tennis-pale transition-colors font-medium">
                ☎ Call
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  {/if}
{/if}
