<template>
  <PinScreen v-if="!authenticated" />

  <div v-else class="min-h-screen relative">
    <NavBar @logout="logout" />
    <main class="relative z-10">
      <PostItsSection />
      <ScheduleSection ref="scheduleRef" />
      <CalendarSection @addAppointment="handleAddAppointment" />
    </main>
    <FooterSection />

    <!-- PWA Install banner -->
    <div v-if="showInstallBanner" class="fixed bottom-0 left-0 right-0 z-[70] p-3">
      <div class="max-w-md mx-auto glass-card rounded-xl p-3 flex items-center gap-3">
        <span class="text-xl">📲</span>
        <div class="flex-1 min-w-0">
          <p class="font-sans text-sm font-medium text-ghost">Instalar app</p>
          <p class="font-mono text-[10px] text-ghost-faint">Agregar a pantalla de inicio</p>
        </div>
        <button @click="installApp" class="btn-primary text-xs px-3 py-1.5 rounded-lg">Instalar</button>
        <button @click="showInstallBanner = false" class="text-ghost-faint hover:text-ghost text-sm p-1">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { authenticated, logout } from './composables/useAuth.js'
import NavBar          from './components/NavBar.vue'
import PinScreen       from './components/PinScreen.vue'
import PostItsSection  from './components/PostItsSection.vue'
import ScheduleSection from './components/ScheduleSection.vue'
import CalendarSection from './components/CalendarSection.vue'
import FooterSection   from './components/FooterSection.vue'

const scheduleRef      = ref(null)
const showInstallBanner = ref(false)
let deferredPrompt = null

const handleAddAppointment = (dateStr) => {
  if (scheduleRef.value) scheduleRef.value.openCreateModal(dateStr)
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

const handleAppInstalled = () => {
  showInstallBanner.value = false
  deferredPrompt = null
}

onMounted(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstall)
  window.addEventListener('appinstalled', handleAppInstalled)
})
onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
  window.removeEventListener('appinstalled', handleAppInstalled)
})
</script>
