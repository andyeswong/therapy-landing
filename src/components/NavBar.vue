<template>
  <nav class="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0">
    <div class="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2">
      <span class="text-lg">📅</span>
      <span class="font-serif text-sm font-semibold text-ghost flex-1">Control de Citas para Ian</span>
      <button @click="$emit('logout')"
              class="font-mono text-[10px] text-ghost-faint hover:text-red-400 transition-colors px-2 py-1 rounded">
        salir
      </button>
    </div>
  </nav>
</template>

<script setup>
defineEmits(['logout'])
</script>
