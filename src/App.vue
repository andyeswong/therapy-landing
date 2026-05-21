<template>
  <PinScreen v-if="!authenticated" />

  <div v-else class="flex flex-col h-screen bg-void overflow-hidden">

    <!-- Top bar -->
    <header class="shrink-0 glass-card border-t-0 border-x-0 z-50">
      <div class="px-4 py-3 flex items-center gap-3">
        <div class="flex items-center gap-2 flex-1">
          <span class="text-xl">🫶</span>
          <div>
            <p class="font-serif text-sm font-semibold text-ghost leading-none">Ian</p>
            <p class="font-mono text-[9px] text-ghost-faint uppercase tracking-widest leading-none mt-0.5">agenda compartida</p>
          </div>
        </div>
        <button @click="logout"
                class="font-mono text-[10px] text-ghost-faint hover:text-red-400 transition-colors px-2 py-1 rounded">
          salir
        </button>
      </div>
    </header>

    <!-- Tab content -->
    <main class="flex-1 overflow-y-auto overscroll-none" style="-webkit-overflow-scrolling: touch;">
      <ScheduleSection v-if="tab === 'agenda'" ref="scheduleRef" />
      <CalendarSection v-if="tab === 'calendario'" @addAppointment="handleAddAppointment" />
      <PostItsSection  v-if="tab === 'notas'" />
    </main>

    <!-- Bottom tab nav -->
    <nav class="shrink-0 glass-card border-b-0 border-x-0 z-50 pb-safe">
      <div class="grid grid-cols-3">
        <button v-for="t in tabs" :key="t.key"
                @click="tab = t.key"
                class="flex flex-col items-center gap-0.5 py-3 transition-all"
                :class="tab === t.key ? 'text-teal' : 'text-ghost-faint hover:text-ghost-muted'">
          <span class="text-xl leading-none">{{ t.icon }}</span>
          <span class="font-mono text-[9px] uppercase tracking-widest">{{ t.label }}</span>
          <span v-if="tab === t.key" class="w-4 h-0.5 rounded-full bg-teal mt-0.5"></span>
        </button>
      </div>
    </nav>

    <!-- PWA Install banner -->
    <div v-if="showInstallBanner" class="fixed bottom-20 left-0 right-0 z-[70] px-3">
      <div class="max-w-md mx-auto glass-card rounded-xl p-3 flex items-center gap-3">
        <span class="text-xl">📲</span>
        <div class="flex-1 min-w-0">
          <p class="font-sans text-sm font-medium text-ghost">Instalar app</p>
          <p class="font-mono text-[10px] text-ghost-faint">Agregar a pantalla de inicio</p>
        </div>
        <button @click="installApp" class="btn-primary text-xs px-3 py-1.5 rounded-lg">Instalar</button>
        <button @click="showInstallBanner = false" class="text-ghost-faint text-sm p-1">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { authenticated, logout } from './composables/useAuth.js'
import PinScreen       from './components/PinScreen.vue'
import PostItsSection  from './components/PostItsSection.vue'
import ScheduleSection from './components/ScheduleSection.vue'
import CalendarSection from './components/CalendarSection.vue'

const tab = ref('agenda')
const tabs = [
  { key: 'agenda',     icon: '📋', label: 'Citas'      },
  { key: 'calendario', icon: '📅', label: 'Calendario' },
  { key: 'notas',      icon: '📝', label: 'Notas'      },
]

const scheduleRef = ref(null)
const showInstallBanner = ref(false)
let deferredPrompt = null

const handleAddAppointment = (dateStr) => {
  tab.value = 'agenda'
  setTimeout(() => scheduleRef.value?.openCreateModal(dateStr), 50)
}

const handleBeforeInstall = (e) => {
  e.preventDefault()
  deferredPrompt = e
  showInstallBanner.value = true
}

const installApp = async () => {
  if (!deferredPrompt) { showInstallBanner.value = false; return }
  deferredPrompt.prompt()
  await deferredPrompt.userChoice
  deferredPrompt = null
  showInstallBanner.value = false
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstall)
  window.addEventListener('appinstalled', () => { showInstallBanner.value = false; deferredPrompt = null })
})
onUnmounted(() => window.removeEventListener('beforeinstallprompt', handleBeforeInstall))
</script>
