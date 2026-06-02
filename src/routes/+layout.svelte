<script lang="ts">
  import '../app.css';
</script>

<div class="min-h-screen flex flex-col">
  <header class="bg-tennis-primary shadow-md">
    <div class="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
      <a href="/" class="flex items-center gap-2 text-white font-bold text-xl tracking-tight hover:text-tennis-pale transition-colors">
        <span class="text-2xl">🎾</span>
        Tennis League
      </a>
      <nav class="flex gap-2">
        <a
          href="/"
          class="px-4 py-2 rounded-lg text-white font-medium hover:bg-tennis-dark transition-colors text-sm"
        >
          Standings
        </a>
        <a
          href="/matchmaker"
          class="px-4 py-2 rounded-lg text-white font-medium hover:bg-tennis-dark transition-colors text-sm"
        >
          Matchmaker
        </a>
        <a
          href="/submit"
          class="px-4 py-2 rounded-lg bg-white text-tennis-primary font-semibold hover:bg-tennis-pale transition-colors text-sm"
        >
          Submit Score
        </a>
      </nav>
    </div>
  </header>

  <main class="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
    <slot />
  </main>

  <footer class="bg-tennis-dark text-tennis-light text-center text-sm py-4 mt-8">
    Competitive2 Division — Summer 2026
  </footer>
</div>
