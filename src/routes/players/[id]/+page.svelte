<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { supabase, type Match } from '$lib/supabase';
  import { getPlayer, players } from '$lib/players';
  import { computeHeadToHead } from '$lib/stats';

  $: playerId = $page.params.id;
  $: player = getPlayer(playerId);

  let matches: Match[] = [];
  let loading = true;
  let errorMsg = '';

  onMount(async () => {
    await loadMatches();
  });

  async function loadMatches() {
    loading = true;
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`winner_id.eq.${playerId},loser_id.eq.${playerId}`)
      .order('played_at', { ascending: false });

    if (error) {
      errorMsg = error.message;
    } else {
      matches = data ?? [];
    }
    loading = false;
  }

  $: wins = matches.filter(m => m.winner_id === playerId).length;
  $: losses = matches.filter(m => m.loser_id === playerId).length;
  $: total = wins + losses;
  $: winPct = total > 0 ? ((wins / total) * 100).toFixed(0) + '%' : '—';
  $: recentMatches = matches.slice(0, 10);
  $: h2h = computeHeadToHead(playerId, matches);
  $: opponents = new Set(matches.map(m => m.winner_id === playerId ? m.loser_id : m.winner_id));
  $: playoffEligible = wins >= 3 && opponents.size >= 6;

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function getPlayerName(id: string) {
    return getPlayer(id)?.name ?? id;
  }
</script>

<svelte:head>
  <title>{player?.name ?? 'Player'} — Tennis League</title>
</svelte:head>

{#if !player}
  <div class="text-center py-16">
    <p class="text-gray-500 text-lg">Player not found.</p>
    <a href="/" class="text-tennis-primary hover:underline mt-2 inline-block">← Back to standings</a>
  </div>
{:else}
  <div class="mb-2">
    <a href="/" class="text-tennis-secondary hover:text-tennis-dark text-sm hover:underline">← Standings</a>
  </div>

  <!-- Player header -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-tennis-dark">{player.name}</h1>
        <div class="mt-2 space-y-1 text-sm text-gray-600">
          <p>📧 <a href="mailto:{player.email}" class="text-tennis-primary hover:underline">{player.email}</a></p>
          <p>📞 <a href="tel:{player.phone}" class="hover:underline">{player.phone}</a></p>
        </div>
      </div>
      {#if playoffEligible}
        <span class="self-start sm:self-auto inline-flex items-center gap-1.5 bg-tennis-pale text-tennis-dark font-bold px-3 py-1.5 rounded-full text-sm">
          ✓ Playoff Eligible
        </span>
      {:else}
        <span class="self-start sm:self-auto inline-flex items-center bg-gray-100 text-gray-500 font-medium px-3 py-1.5 rounded-full text-sm">
          Not yet eligible
        </span>
      {/if}
    </div>
  </div>

  <!-- Stats row -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
    <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
      <div class="text-3xl font-bold text-tennis-secondary">{wins}</div>
      <div class="text-xs text-gray-500 mt-1 uppercase tracking-wide">Wins</div>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
      <div class="text-3xl font-bold text-gray-600">{losses}</div>
      <div class="text-xs text-gray-500 mt-1 uppercase tracking-wide">Losses</div>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
      <div class="text-3xl font-bold text-tennis-primary">{winPct}</div>
      <div class="text-xs text-gray-500 mt-1 uppercase tracking-wide">Win %</div>
    </div>
    <div class="bg-white rounded-xl border border-gray-200 p-4 text-center shadow-sm">
      <div class="text-3xl font-bold text-tennis-primary">{opponents.size}</div>
      <div class="text-xs text-gray-500 mt-1 uppercase tracking-wide">Opponents</div>
    </div>
  </div>

  {#if loading}
    <div class="flex items-center justify-center py-12 text-tennis-secondary">
      <svg class="animate-spin h-7 w-7 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
      </svg>
      Loading match history…
    </div>
  {:else if errorMsg}
    <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">{errorMsg}</div>
  {:else}
    <div class="grid md:grid-cols-2 gap-6">

      <!-- Recent matches -->
      <div>
        <h2 class="text-lg font-bold text-tennis-dark mb-3">Recent Matches</h2>
        {#if recentMatches.length === 0}
          <div class="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
            No matches recorded yet.
          </div>
        {:else}
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {#each recentMatches as match, i}
              {@const won = match.winner_id === playerId}
              {@const opponent = won ? match.loser_id : match.winner_id}
              <div class="{i > 0 ? 'border-t border-gray-100' : ''} px-4 py-3 flex items-center justify-between gap-3">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="flex-shrink-0 w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center {won ? 'bg-tennis-pale text-tennis-dark' : 'bg-red-50 text-red-600'}">
                    {won ? 'W' : 'L'}
                  </span>
                  <div class="min-w-0">
                    <a href="/players/{opponent}" class="font-medium text-tennis-primary hover:underline truncate block">
                      {getPlayerName(opponent)}
                    </a>
                    <span class="text-xs text-gray-400">{formatDate(match.played_at)}</span>
                  </div>
                </div>
                <span class="text-sm font-mono text-gray-600 flex-shrink-0">{match.score}</span>
              </div>
            {/each}
          </div>
        {/if}
      </div>

      <!-- Head-to-head -->
      <div>
        <h2 class="text-lg font-bold text-tennis-dark mb-3">Head-to-Head</h2>
        {#if h2h.length === 0}
          <div class="bg-white rounded-xl border border-gray-200 p-6 text-center text-gray-400">
            No opponents yet.
          </div>
        {:else}
          <div class="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {#each h2h as record, i}
              {@const isWinning = record.wins > record.losses}
              {@const isTied = record.wins === record.losses}
              <div class="{i > 0 ? 'border-t border-gray-100' : ''} px-4 py-3 flex items-center justify-between gap-3">
                <a href="/players/{record.opponentId}" class="font-medium text-tennis-primary hover:underline min-w-0 truncate">
                  {getPlayerName(record.opponentId)}
                </a>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <span class="font-bold tabular-nums {isWinning ? 'text-tennis-secondary' : isTied ? 'text-gray-500' : 'text-red-500'}">
                    {record.wins}–{record.losses}
                  </span>
                  <span class="text-xs px-1.5 py-0.5 rounded font-medium {isWinning ? 'bg-tennis-pale text-tennis-dark' : isTied ? 'bg-gray-100 text-gray-500' : 'bg-red-50 text-red-600'}">
                    {isWinning ? 'Lead' : isTied ? 'Even' : 'Trail'}
                  </span>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
{/if}
