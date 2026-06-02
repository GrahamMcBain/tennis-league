<script lang="ts">
  import { supabase } from '$lib/supabase';
  import { players } from '$lib/players';

  let winnerId = '';
  let loserId = '';
  let score = '';
  let playedAt = new Date().toISOString().split('T')[0];

  let submitting = false;
  let success = false;
  let errorMsg = '';

  function validate(): string | null {
    if (!winnerId) return 'Please select a winner.';
    if (!loserId) return 'Please select a loser.';
    if (winnerId === loserId) return 'Winner and loser must be different players.';
    if (!score.trim()) return 'Please enter a score (e.g. "6-4, 7-5").';
    if (!playedAt) return 'Please select a date.';
    return null;
  }

  async function handleSubmit() {
    errorMsg = '';
    const validationError = validate();
    if (validationError) {
      errorMsg = validationError;
      return;
    }

    submitting = true;
    const { error } = await supabase.from('matches').insert({
      winner_id: winnerId,
      loser_id: loserId,
      score: score.trim(),
      played_at: new Date(playedAt).toISOString(),
    });

    submitting = false;

    if (error) {
      errorMsg = error.message;
    } else {
      success = true;
    }
  }

  function reset() {
    winnerId = '';
    loserId = '';
    score = '';
    playedAt = new Date().toISOString().split('T')[0];
    success = false;
    errorMsg = '';
  }
</script>

<svelte:head>
  <title>Submit Score — Tennis League</title>
</svelte:head>

<div class="max-w-lg mx-auto">
  <h1 class="text-3xl font-bold text-tennis-dark mb-2">Submit Match Score</h1>
  <p class="text-gray-500 mb-8">Record a completed match result.</p>

  {#if success}
    <div class="bg-tennis-pale border border-tennis-light rounded-xl p-6 text-center">
      <div class="text-4xl mb-3">🎾</div>
      <h2 class="text-xl font-bold text-tennis-dark mb-2">Score Submitted!</h2>
      <p class="text-tennis-primary mb-5">The match result has been recorded successfully.</p>
      <div class="flex gap-3 justify-center flex-wrap">
        <a
          href="/"
          class="px-5 py-2 bg-tennis-primary text-white rounded-lg font-semibold hover:bg-tennis-dark transition-colors"
        >
          View Standings
        </a>
        <button
          on:click={reset}
          class="px-5 py-2 border border-tennis-primary text-tennis-primary rounded-lg font-semibold hover:bg-tennis-pale transition-colors"
        >
          Submit Another
        </button>
      </div>
    </div>
  {:else}
    <form on:submit|preventDefault={handleSubmit} class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-5">

      {#if errorMsg}
        <div class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {errorMsg}
        </div>
      {/if}

      <div>
        <label for="winner" class="block text-sm font-semibold text-gray-700 mb-1">Winner</label>
        <select
          id="winner"
          bind:value={winnerId}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tennis-secondary focus:border-transparent"
        >
          <option value="">Select winner…</option>
          {#each players as player}
            <option value={player.id} disabled={player.id === loserId}>{player.name}</option>
          {/each}
        </select>
      </div>

      <div>
        <label for="loser" class="block text-sm font-semibold text-gray-700 mb-1">Loser</label>
        <select
          id="loser"
          bind:value={loserId}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tennis-secondary focus:border-transparent"
        >
          <option value="">Select loser…</option>
          {#each players as player}
            <option value={player.id} disabled={player.id === winnerId}>{player.name}</option>
          {/each}
        </select>
      </div>

      <div>
        <label for="score" class="block text-sm font-semibold text-gray-700 mb-1">Score</label>
        <input
          id="score"
          type="text"
          bind:value={score}
          placeholder="e.g. 6-4, 7-5"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tennis-secondary focus:border-transparent"
        />
        <p class="text-xs text-gray-400 mt-1">Enter the set scores, e.g. "6-4, 7-5" or "6-3, 4-6, 10-7"</p>
      </div>

      <div>
        <label for="played-at" class="block text-sm font-semibold text-gray-700 mb-1">Date Played</label>
        <input
          id="played-at"
          type="date"
          bind:value={playedAt}
          class="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-tennis-secondary focus:border-transparent"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        class="w-full py-3 bg-tennis-primary text-white font-bold rounded-lg hover:bg-tennis-dark transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {submitting ? 'Submitting…' : 'Submit Score'}
      </button>
    </form>
  {/if}
</div>
