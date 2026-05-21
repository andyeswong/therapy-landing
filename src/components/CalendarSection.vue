<template>
  <section id="calendario" class="px-3 py-4">
    <div class="flex items-center justify-between mb-3">
      <button @click="prevMonth" class="w-8 h-8 rounded-lg bg-surface-2 border border-rim flex items-center justify-center text-ghost-faint hover:text-teal transition-colors">
        ‹
      </button>
      <div class="text-center">
        <p class="font-mono text-[10px] text-ghost-faint uppercase tracking-widest">// {{ monthKey }}</p>
        <h2 class="font-sans text-sm font-semibold text-ghost">{{ monthName }} {{ currentYear }}</h2>
      </div>
      <button @click="nextMonth" class="w-8 h-8 rounded-lg bg-surface-2 border border-rim flex items-center justify-center text-ghost-faint hover:text-teal transition-colors">
        ›
      </button>
    </div>

    <!-- Day headers -->
    <div class="grid grid-cols-7 gap-0.5 mb-1">
      <div v-for="d in ['L','M','X','J','V','S','D']" :key="d"
           class="text-center font-mono text-[10px] text-ghost-faint py-1">{{ d }}</div>
    </div>

    <!-- Calendar grid -->
    <div class="grid grid-cols-7 gap-0.5">
      <div v-for="n in monthOffset" :key="'e'+n" class="aspect-square"></div>
      <div v-for="day in monthDays" :key="day"
           class="aspect-square rounded-md flex flex-col items-center justify-center transition-all duration-150"
           :class="[dayClass(day), dayEvents(day).length ? 'cursor-pointer' : 'cursor-default']"
           @click="handleDayClick(day)">
        <span class="font-mono text-[11px] leading-none" :class="dayTextClass(day)">{{ day }}</span>
        <div v-if="dayEvents(day).length" class="flex gap-px mt-0.5">
          <span v-for="(e, i) in dayEvents(day)" :key="i"
                class="w-1 h-1 rounded-full" :class="e.dotColor"></span>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex gap-4 mt-3 justify-center">
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
        <span class="font-mono text-[10px] text-ghost-faint">ALEM</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-teal-400"></div>
        <span class="font-mono text-[10px] text-ghost-faint">Neuropsic</span>
      </div>
      <div class="flex items-center gap-1.5">
        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
        <span class="font-mono text-[10px] text-ghost-faint">Estudio</span>
      </div>
    </div>
  </section>

  <!-- Day detail popup -->
  <Teleport to="body">
    <div v-if="selectedDay !== null" class="fixed inset-0 z-[55] flex items-end sm:items-center justify-center">
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="selectedDay = null"></div>
      <div class="relative w-full sm:max-w-md mx-0 sm:mx-4 bg-surface-2 border border-rim rounded-t-2xl sm:rounded-2xl p-4 pb-8 sm:pb-4 max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-3">
          <div>
            <p class="font-mono text-[10px] text-ghost-faint uppercase tracking-widest">{{ selectedDay }} {{ monthName }} {{ currentYear }}</p>
            <p class="font-sans text-sm font-semibold text-ghost">{{ selectedAppts.length }} cita{{ selectedAppts.length !== 1 ? 's' : '' }}</p>
          </div>
          <button @click="selectedDay = null" class="text-ghost-faint hover:text-ghost text-xl leading-none p-1">✕</button>
        </div>

        <div v-if="selectedAppts.length === 0" class="py-6 text-center">
          <p class="font-mono text-xs text-ghost-faint">Sin citas este día</p>
        </div>
        <div v-else class="grid gap-2 mb-4">
          <div v-for="appt in selectedAppts" :key="appt.id" class="popup-card p-3">
            <div class="flex items-start gap-3">
              <div class="appt-icon" :class="iconBg(appt.category)">{{ icon(appt.category) }}</div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="font-sans text-sm font-medium text-ghost leading-tight">{{ appt.title }}</p>
                  <span class="status-dot-sm" :class="statusClass(appt.status)"></span>
                </div>
                <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                  <span v-if="appt.time" class="font-mono text-xs text-teal">{{ appt.time }}</span>
                  <span v-if="appt.place" class="font-mono text-xs text-ghost-faint">📍 {{ appt.place }}</span>
                </div>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="font-mono text-[10px] px-1.5 py-0.5 rounded-full" :class="badgeClass(appt.category)">
                    {{ categoryLabel(appt.category) }}
                  </span>
                  <span class="font-mono text-[10px] px-1.5 py-0.5 rounded-full" :class="statusBadgeClass(appt.status)">
                    {{ statusLabel(appt.status) }}
                  </span>
                  <span class="font-mono text-xs text-ghost-muted ml-auto">{{ appt.price }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button @click="addFromDay" class="w-full py-2.5 rounded-xl border border-dashed border-teal/40 text-teal font-mono text-xs hover:bg-teal/10 active:bg-teal/15 transition-all flex items-center justify-center gap-2">
          <span class="text-base">+</span> Agregar cita este día
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAppointments } from '../composables/useAppointments.js'

const { appointmentsWithPrice } = useAppointments()
const emit = defineEmits(['addAppointment'])

const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

const now = new Date()
const currentMonth = ref(now.getMonth()) // 0-based
const currentYear = ref(now.getFullYear())

const monthName = computed(() => months[currentMonth.value])
const monthKey = computed(() => `${monthName.value.toLowerCase()}_${currentYear.value}`)

const monthDays = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())

const monthOffset = computed(() => {
  const firstDay = new Date(currentYear.value, currentMonth.value, 1).getDay()
  // Convert Sunday=0 to Monday-based (Mon=0, Sun=6)
  return firstDay === 0 ? 6 : firstDay - 1
})

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentMonth.value = 11
    currentYear.value--
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentMonth.value = 0
    currentYear.value++
  } else {
    currentMonth.value++
  }
}

const dotColorMap = { alem: 'bg-yellow-500', neuropsic: 'bg-teal-400', study: 'bg-blue-500' }

const monthDayMap = computed(() => {
  const map = {}
  appointmentsWithPrice.value.forEach(a => {
    const parts = a.date.split(' ')
    const monthStr = parts[1]
    const dayNum = parseInt(parts[0])

    // Find which month index this maps to
    const mIndex = monthsShort.indexOf(monthStr)
    if (mIndex === -1) return

    // For the year: if we're showing a month and the appointment month is in the future
    // Assume current year, or next year if month has passed
    let apptYear = currentYear.value
    if (mIndex !== currentMonth.value) return // only show appointments for the current displayed month

    if (!map[dayNum]) map[dayNum] = []
    map[dayNum].push({ ...a, dotColor: dotColorMap[a.category] || 'bg-gray-500' })
  })
  return map
})

const dayEvents = (day) => monthDayMap.value[day] || []

const selectedDay = ref(null)
const selectedAppts = computed(() => monthDayMap.value[selectedDay.value] || [])

const handleDayClick = (day) => {
  selectedDay.value = day
}

const addFromDay = () => {
  const day = selectedDay.value
  const monthStr = monthsShort[currentMonth.value]
  selectedDay.value = null
  emit('addAppointment', `${day} ${monthStr}`)
}

const isToday = (day) => {
  return now.getMonth() === currentMonth.value && now.getFullYear() === currentYear.value && now.getDate() === day
}

const dayClass = (day) => {
  if (isToday(day)) return 'bg-teal-500/20 border border-teal-500/40'
  if (dayEvents(day).length > 0) return 'bg-surface-2 hover:border hover:border-rim active:bg-teal-500/10'
  return 'hover:bg-surface-2/50'
}

const dayTextClass = (day) => isToday(day) ? 'text-teal-bright font-semibold' : 'text-ghost-muted'

const icon = (cat) => ({ alem: '🏠', neuropsic: '🧠', study: '🩻' }[cat] || '📋')
const iconBg = (cat) => ({ alem: 'bg-yellow-muted', neuropsic: 'bg-teal-muted', study: 'bg-blue-muted' }[cat] || 'bg-surface-3')
const badgeClass = (cat) => ({ alem: 'bg-yellow-muted text-yellow-bright', neuropsic: 'bg-teal-muted text-teal-bright', study: 'bg-blue-muted text-blue-bright' }[cat] || '')
const categoryLabel = (cat) => ({ alem: 'ALEM', neuropsic: 'Neuropsic', study: 'Estudio' }[cat] || cat)

const statusLabel = (s) => ({ pendiente: 'Pendiente', completada: 'Completada', cancelada: 'Cancelada', movida: 'Movida' }[s] || s)
const statusClass = (s) => ({ pendiente: 'bg-yellow-400', completada: 'bg-green-400', cancelada: 'bg-red-400', movida: 'bg-blue-400' }[s] || 'bg-gray-400')
const statusBadgeClass = (s) => ({ pendiente: 'bg-yellow-500/15 text-yellow-bright', completada: 'bg-green-500/15 text-green-400', cancelada: 'bg-red-500/15 text-red-400', movida: 'bg-blue-500/15 text-blue-bright' }[s] || '')
</script>

<style scoped>
.aspect-square { aspect-ratio: 1; }
.bg-surface-2 { background: rgba(21, 22, 40, 0.75); }
.bg-surface-3 { background: rgba(29, 30, 50, 0.75); }
.border-rim { border-color: rgba(61, 61, 96, 0.6); }
.text-teal-bright { color: #14b8a6; }
.bg-yellow-muted  { background: rgba(234,179,8,0.15); }
.bg-teal-muted   { background: rgba(20,184,166,0.15); }
.bg-blue-muted   { background: rgba(59,130,246,0.15); }
.text-yellow-bright { color: #f59e0b; }
.text-blue-bright   { color: #60a5fa; }
.popup-card {
  background: rgba(29, 30, 50, 0.9);
  border: 1px solid rgba(61, 61, 96, 0.6);
  border-radius: 10px;
}
.appt-icon {
  width: 32px; height: 32px;
  border-radius: 7px;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}
.status-dot-sm {
  display: inline-block;
  width: 5px; height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
