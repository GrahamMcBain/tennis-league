<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase, type Match } from '$lib/supabase';
  import { players, getPlayer } from '$lib/players';
  import { computeStandings, type PlayerStats } from '$lib/stats';

  type SortKey = 'rank' | 'name' | 'wins' | 'losses' | 'winPct' | 'opponents';
  type SortDir = 'asc' | 'desc';

  let matches: Match[] = [];
  let loading = true;
  let error = '';
  let sortKey: SortKey = 'winPct';
  let sortDir: SortDir = 'desc';

  interface Row extends PlayerStats {
    name: string;
    rank: number;
  }

  let rows: Row[] = [];

  onMount(async () => {
    const { data, error: err } = await supabase
      .from('matches')
      .select('*')
      .order('played_at', { ascending: false });

    if (err) {
      error = err.message;
    } else {
      matches = data ?? [];
    }
    loading = false;
  });

  function buildRows(matches: Match[], key: SortKey, dir: SortDir): Row[] {
    const stats = computeStandings(matches);

    // Include all players, even those with no matches yet
    const allPlayerIds = new Set(players.map(p => p.id));
    for (const id of allPlayerIds) {
      if (!stats.find(s => s.playerId === id)) {
        stats.push({ playerId: id, wins: 0, losses: 0, winPct: 0, opponents: new Set(), playoffEligible: false });
      }
    }

    const withNames: Row[] = stats
      .filter(s => allPlayerIds.has(s.playerId))
      .map(s => ({ ...s, name: getPlayer(s.playerId)?.name ?? s.playerId, rank: 0 }));

    // Sort
    withNames.sort((a, b) => {
      let cmp = 0;
      if (key === 'name') cmp = a.name.localeCompare(b.name);
      else if (key === 'wins') cmp = a.wins - b.wins;
      else if (key === 'losses') cmp = a.losses - b.losses;
      else if (key === 'winPct') cmp = a.winPct - b.winPct || a.wins - b.wins;
      else if (key === 'opponents') cmp = a.opponents.size - b.opponents.size;
      else cmp = 0;

      return dir === 'desc' ? -cmp : cmp;
    });

    // Assign rank
    withNames.forEach((r, i) => (r.rank = i + 1));
    return withNames;
  }

  $: rows = buildRows(matches, sortKey, sortDir);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'desc' ? 'asc' : 'desc';
    } else {
      sortKey = key;
      sortDir = 'desc';
    }
  }

  function sortIcon(key: SortKey) {
    if (sortKey !== key) return '↕';
    return sortDir === 'desc' ? '↓' : '↑';
  }

  function fmtPct(n: number) {
    return (n * 100).toFixed(0) + '%';
  }
</script>

<svelte:head>
  <title>Standings — Tennis League</title>
</svelte:head>

<div class="mb-6">
  <h1 class="text-3xl font-bold text-tennis-dark">Standings</h1>
  <p class="text-gray-600 mt-1">Competitive2 Division — Summer 2026, ends Aug 9</p>
  <p class="text-sm text-gray-500 mt-1">
    Playoff eligibility requires <strong>3+ wins</strong> and <strong>6+ unique opponents</strong>.
  </p>
</div>

{#if loading}
  <div class="flex items-center justify-center py-16 text-tennis-secondary">
    <svg class="animate-spin h-8 w-8 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
    </svg>
    Loading standings…
  </div>
{:else if error}
  <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
    Error loading matches: {error}
  </div>
{:else}
  <div class="overflow-x-auto rounded-xl shadow-sm border border-gray-200 bg-white">
    <table class="w-full text-sm">
      <thead class="bg-tennis-primary text-white">
        <tr>
          <th class="px-4 py-3 text-left font-semibold w-12">
            <button on:click={() => toggleSort('rank')} class="hover:text-tennis-pale">
              # {sortIcon('rank')}
            </button>
          </th>
          <th class="px-4 py-3 text-left font-semibold">
            <button on:click={() => toggleSort('name')} class="hover:text-tennis-pale">
              Player {sortIcon('name')}
            </button>
          </th>
          <th class="px-4 py-3 text-center font-semibold">
            <button on:click={() => toggleSort('wins')} class="hover:text-tennis-pale">
              W {sortIcon('wins')}
            </button>
          </th>
          <th class="px-4 py-3 text-center font-semibold">
            <button on:click={() => toggleSort('losses')} class="hover:text-tennis-pale">
              L {sortIcon('losses')}
            </button>
          </th>
          <th class="px-4 py-3 text-center font-semibold">
            <button on:click={() => toggleSort('winPct')} class="hover:text-tennis-pale">
              Win% {sortIcon('winPct')}
            </button>
          </th>
          <th class="px-4 py-3 text-center font-semibold">
            <button on:click={() => toggleSort('opponents')} class="hover:text-tennis-pale">
              Opp {sortIcon('opponents')}
            </button>
          </th>
          <th class="px-4 py-3 text-center font-semibold">Playoff</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row, i}
          <tr class="{i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-tennis-pale transition-colors">
            <td class="px-4 py-3 text-gray-500 font-medium">{row.rank}</td>
            <td class="px-4 py-3">
              <a href="/players/{row.playerId}" class="font-semibold text-tennis-primary hover:text-tennis-dark hover:underline">
                {row.name}
              </a>
            </td>
            <td class="px-4 py-3 text-center font-bold text-tennis-secondary">{row.wins}</td>
            <td class="px-4 py-3 text-center text-gray-600">{row.losses}</td>
            <td class="px-4 py-3 text-center">
              {#if row.wins + row.losses > 0}
                <span class="font-medium">{fmtPct(row.winPct)}</span>
              {:else}
                <span class="text-gray-400">—</span>
              {/if}
            </td>
            <td class="px-4 py-3 text-center text-gray-600">{row.opponents.size}</td>
            <td class="px-4 py-3 text-center">
              {#if row.playoffEligible}
                <span class="inline-flex items-center gap-1 bg-tennis-pale text-tennis-dark text-xs font-bold px-2 py-1 rounded-full">
                  ✓ Eligible
                </span>
              {:else}
                <span class="text-gray-400 text-xs">—</span>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
  <p class="text-xs text-gray-400 mt-3">{matches.length} match{matches.length !== 1 ? 'es' : ''} recorded this season.</p>
{/if}
