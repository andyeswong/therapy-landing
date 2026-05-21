<template>
  <section class="relative min-h-[85vh] flex flex-col justify-center max-w-5xl mx-auto px-6 pt-28 pb-16">
    <div class="float-shape w-72 h-72 bg-teal/5 -left-24 top-20" style="animation-delay:0s;"></div>
    <div class="float-shape w-48 h-48 bg-teal/4 right-0 top-48" style="animation-delay:2s;"></div>
    <div class="float-shape w-32 h-32 bg-accent/6 left-1/3 bottom-24" style="animation-delay:4s;"></div>

    <div class="relative z-10 max-w-3xl">
      <p class="font-mono text-xs font-medium uppercase tracking-[0.25em] text-teal mb-8"
         style="animation: slide-up 0.5s ease both;">
        // neuropsicologia_infantil
      </p>

      <h1 class="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight mb-8">
        <span
          v-for="(word, i) in headlineWords"
          :key="i"
          class="word-animate"
          :style="{ animationDelay: (i * 0.08 + 0.2) + 's' }"
        >{{ word }}&nbsp;</span>
      </h1>

      <p class="text-base text-ghost-muted leading-relaxed max-w-xl mb-10 font-mono"
         style="animation: slide-up 0.6s 0.7s ease both; opacity: 0; animation-fill-mode: forwards;">
        Programa de terapias para tu hijo. Sesiones programadas en nuestra clínica de neuropsicología en Tijuana, B.C.
      </p>

      <div class="flex flex-wrap items-center gap-4"
           style="animation: slide-up 0.6s 0.9s ease both; opacity: 0; animation-fill-mode: forwards;">
        <a href="#horario" class="btn-primary">
          ver_horario
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
        <a href="#ubicacion" class="btn-outline">
          cómo_llegar
        </a>
      </div>
    </div>

    <div class="absolute bottom-12 left-6 right-6 flex items-center gap-4 text-ghost-faint"
         style="animation: slide-up 0.5s 1.1s ease both; opacity: 0; animation-fill-mode: forwards;">
      <div class="flex-1 border-t border-rim"></div>
      <span class="font-mono text-xs tracking-[0.2em]">TIJUANA · B.C. · 2026</span>
      <div class="flex-1 border-t border-rim"></div>
    </div>
  </section>
</template>

<script setup>
const headlineWords = ['Terapias', 'para', 'tu', 'hijo']
</script>

<style scoped>
.word-animate { display: inline-block; opacity: 0; animation: word-appear 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
.float-shape { position: absolute; border-radius: 50%; pointer-events: none; animation: float 6s ease-in-out infinite; }
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.07; }
  50%       { transform: translateY(-18px) rotate(3deg); opacity: 0.13; }
}
@keyframes word-appear {
  0%   { opacity: 0; transform: translateY(12px) scale(0.97); filter: blur(4px); }
  100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
#mouse-gradient {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 0;
  background: radial-gradient(600px circle at var(--mx, 50%) var(--my, 30%), rgba(20,184,166,0.07) 0%, transparent 70%);
  transition: background 0.1s ease;
}
</style>