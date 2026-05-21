<template>
  <section id="horario" class="px-3 pt-14 pb-4">
    <!-- Sticky total bar -->
    <div class="sticky top-12 z-40 glass-card rounded-xl px-4 py-2.5 mb-3 flex items-center justify-between">
      <div>
        <p class="font-mono text-[10px] text-ghost-faint uppercase tracking-widest">// agenda_clinica</p>
        <p class="font-sans text-sm font-semibold text-ghost">Próximas Citas</p>
      </div>
      <div class="text-right">
        <p class="font-mono text-[10px] text-ghost-faint">total estimado</p>
        <p class="font-mono text-base font-semibold text-teal-light">${{ totalSum.toLocaleString() }}</p>
        <p class="font-mono text-[10px] text-ghost-muted">parcialidades</p>
      </div>
    </div>

    <!-- Save status -->
    <div v-if="saveStatus" class="mb-3 px-3 py-1.5 rounded-lg text-xs font-mono"
         :class="saveStatus === 'saved' ? 'bg-teal-500/20 text-teal-bright' : 'bg-yellow-500/20 text-yellow-bright'">
      {{ saveStatus === 'saved' ? '✓ Cambios guardados' : 'Guardando...' }}
    </div>

    <!-- Status filter -->
    <div class="flex gap-1.5 mb-3 overflow-x-auto pb-1">
      <button v-for="f in statusFilters" :key="f.value"
        @click="activeFilter = f.value"
        class="font-mono text-[10px] px-2.5 py-1 rounded-full whitespace-nowrap transition-all"
        :class="activeFilter === f.value ? 'bg-teal/20 text-teal-bright border border-teal/40' : 'bg-surface-2 text-ghost-faint border border-rim'">
        {{ f.label }}
      </button>
    </div>

    <div class="grid gap-2">
      <div
        v-for="item in filtered"
        :key="item.id"
        class="app-card p-3"
        :class="{ 'opacity-50': item.status === 'cancelada' }"
      >
        <!-- Edit mode -->
        <template v-if="editingId === item.id">
          <div class="space-y-2">
            <!-- Row 1: date + time -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="field-label">Fecha</label>
                <input v-model="editForm.date" class="edit-input" placeholder="15 May" />
              </div>
              <div>
                <label class="field-label">Hora</label>
                <input v-model="editForm.time" class="edit-input" placeholder="5:00 PM" />
              </div>
            </div>
            <!-- Row 2: title -->
            <div>
              <label class="field-label">Título</label>
              <input v-model="editForm.title" class="edit-input" placeholder="Título" />
            </div>
            <!-- Row 3: category + status -->
            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="field-label">Categoría</label>
                <select v-model="editForm.category" class="edit-input">
                  <option value="neuropsic">Neuropsic</option>
                  <option value="alem">ALEM</option>
                  <option value="study">Estudio</option>
                </select>
              </div>
              <div>
                <label class="field-label">Estado</label>
                <select v-model="editForm.status" class="edit-input">
                  <option value="pendiente">Pendiente</option>
                  <option value="completada">Completada</option>
                  <option value="cancelada">Cancelada</option>
                  <option value="movida">Movida</option>
                </select>
              </div>
            </div>
            <!-- Row 4: place -->
            <div>
              <label class="field-label">Lugar</label>
              <select v-model="editForm.place" class="edit-input">
                <option value="">Sin lugar</option>
                <option value="Hospital Ángeles">Hospital Ángeles</option>
                <option value="Consultorio">Consultorio</option>
                <option value="Clínica">Clínica</option>
                <option value="En línea">En línea</option>
                <option value="No definido">No definido</option>
              </select>
            </div>
            <!-- Row 5: cost -->
            <div>
              <label class="field-label">Costo $</label>
              <input v-model.number="editForm.cost" type="number" class="edit-input" placeholder="0" min="0" />
            </div>
          </div>
          <div class="flex gap-2 mt-3">
            <button @click="saveEdit(item.id)" class="btn-primary text-xs px-3 py-1.5 flex-1 justify-center">Guardar</button>
            <button @click="cancelEdit" class="btn-outline text-xs px-3 py-1.5 flex-1 justify-center">Cancelar</button>
          </div>
        </template>

        <!-- View mode -->
        <template v-else>
          <div class="flex items-start gap-3">
            <div class="app-icon mt-0.5" :class="iconBg(item.category)">
              {{ icon(item.category) }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="font-sans text-sm font-medium text-ghost leading-tight">{{ item.title }}</p>
                <span class="status-dot" :class="statusClass(item.status)"></span>
              </div>
              <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                <span class="font-mono text-xs text-ghost-faint">{{ item.date }}</span>
                <span v-if="item.time" class="font-mono text-xs text-teal">{{ item.time }}</span>
                <span v-if="item.place" class="font-mono text-xs text-ghost-faint">📍 {{ item.place }}</span>
              </div>
              <div class="flex items-center gap-1.5 mt-1">
                <span class="font-mono text-[10px] px-1.5 py-0.5 rounded-full" :class="badgeClass(item.category)">
                  {{ categoryLabel(item.category) }}
                </span>
                <span class="font-mono text-[10px] px-1.5 py-0.5 rounded-full" :class="statusBadgeClass(item.status)">
                  {{ statusLabel(item.status) }}
                </span>
              </div>
            </div>
            <div class="shrink-0 text-right flex items-center gap-2">
              <div>
                <p class="font-mono text-sm font-medium text-ghost">{{ item.price }}</p>
              </div>
              <button @click="startEdit(item)" class="text-ghost-faint hover:text-teal transition-colors p-1" title="Editar">✏️</button>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Summary bar -->
    <div class="mt-3 p-3 bg-surface-2 border border-rim rounded-lg">
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <div class="flex items-center gap-1.5">
          <div class="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"></div>
          <span class="font-mono text-xs text-ghost-muted">{{ alemCount }} ALEM · {{ neuropsicCount }} Neuropsic · {{ studyCount }} estudio</span>
        </div>
        <span class="font-mono text-xs text-ghost-faint ml-auto">{{ appointments.length }} citas · Mayo–Jun 2026</span>
      </div>
    </div>
  </section>

  <!-- Floating action button -->
  <button
    @click="openCreateModal"
    class="fixed bottom-6 right-4 z-50 w-14 h-14 rounded-full bg-teal text-white shadow-glow-teal flex items-center justify-center text-2xl leading-none hover:bg-teal-light active:scale-95 transition-all"
    title="Nueva cita"
    aria-label="Agregar cita"
  >+</button>

  <!-- Create appointment modal -->
  <Teleport to="body">
    <div v-if="showCreateModal" class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showCreateModal = false"></div>
      <div class="relative w-full sm:max-w-md mx-0 sm:mx-4 bg-surface-2 border border-rim rounded-t-2xl sm:rounded-2xl p-4 pb-8 sm:pb-4 max-h-[85vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-sans text-sm font-semibold text-ghost">Nueva Cita</h3>
          <button @click="showCreateModal = false" class="text-ghost-faint hover:text-ghost text-xl leading-none p-1">✕</button>
        </div>
        <div class="space-y-2">
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="field-label">Fecha</label>
              <input v-model="createForm.date" class="edit-input" placeholder="15 May" />
            </div>
            <div>
              <label class="field-label">Hora</label>
              <input v-model="createForm.time" class="edit-input" placeholder="5:00 PM" />
            </div>
          </div>
          <div>
            <label class="field-label">Título</label>
            <input v-model="createForm.title" class="edit-input" placeholder="Título" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="field-label">Categoría</label>
              <select v-model="createForm.category" class="edit-input">
                <option value="neuropsic">Neuropsic</option>
                <option value="alem">ALEM</option>
                <option value="study">Estudio</option>
              </select>
            </div>
            <div>
              <label class="field-label">Estado</label>
              <select v-model="createForm.status" class="edit-input">
                <option value="pendiente">Pendiente</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
                <option value="movida">Movida</option>
              </select>
            </div>
          </div>
          <div>
            <label class="field-label">Lugar</label>
            <select v-model="createForm.place" class="edit-input">
              <option value="">Sin lugar</option>
              <option value="Hospital Ángeles">Hospital Ángeles</option>
              <option value="Consultorio">Consultorio</option>
              <option value="Clínica">Clínica</option>
              <option value="En línea">En línea</option>
              <option value="No definido">No definido</option>
            </select>
          </div>
          <div>
            <label class="field-label">Costo $</label>
            <input v-model.number="createForm.cost" type="number" class="edit-input" placeholder="0" min="0" />
          </div>
        </div>
        <div class="flex gap-2 mt-4">
          <button @click="submitCreate" class="btn-primary text-xs px-3 py-2 flex-1 justify-center rounded-lg">Agregar</button>
          <button @click="showCreateModal = false" class="btn-outline text-xs px-3 py-2 flex-1 justify-center rounded-lg">Cancelar</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { persistentFetch } from '../composables/useOffline.js'
import { useAppointments, loadAppointments } from '../composables/useAppointments.js'

const {
  appointments,
  prices,
  getNumericPrice,
  totalSum,
  alemCount,
  neuropsicCount,
  studyCount,
  sorted,
} = useAppointments()

const editingId = ref(null)
const editForm = ref({})
const saveStatus = ref(null)

const showCreateModal = ref(false)
const defaultCreateForm = () => ({ date: '', time: '', title: '', category: 'neuropsic', place: '', cost: null, status: 'pendiente' })
const createForm = ref(defaultCreateForm())

// Status filter
const statusFilters = [
  { value: 'all', label: 'Todas' },
  { value: 'pendiente', label: '⏳ Pendiente' },
  { value: 'completada', label: '✅ Completada' },
  { value: 'cancelada', label: '❌ Cancelada' },
  { value: 'movida', label: '🔄 Movida' },
]
const activeFilter = ref('all')

const filtered = computed(() => {
  if (activeFilter.value === 'all') return sorted.value
  return sorted.value.filter(a => a.status === activeFilter.value)
})

const openCreateModal = (prefillDate) => {
  createForm.value = defaultCreateForm()
  if (prefillDate) createForm.value.date = prefillDate
  showCreateModal.value = true
}

// Expose for CalendarSection
defineExpose({ openCreateModal })

onMounted(loadAppointments)

const startEdit = (item) => {
  editingId.value = item.id
  editForm.value = { ...item, cost: getNumericPrice(item) }
}

const cancelEdit = () => {
  editingId.value = null
  editForm.value = {}
}

const saveEdit = async (id) => {
  const idx = appointments.value.findIndex(a => a.id === id)
  if (idx === -1) return

  const { cost, price, ...appointmentData } = editForm.value

  if (cost !== undefined && cost !== null) {
    const oldCategory = appointments.value[idx].category
    const oldTitle = appointments.value[idx].title
    const newCategory = appointmentData.category
    const newTitle = appointmentData.title

    if (newCategory === 'neuropsic') {
      const nCount = appointments.value.filter(a => a.category === 'neuropsic').length
      prices.value.neuropsic_total = cost * nCount
    } else if (newCategory === 'alem') {
      if (!prices.value.alem) prices.value.alem = {}
      prices.value.alem[newTitle] = cost
      if (oldCategory === 'alem' && oldTitle !== newTitle) delete prices.value.alem[oldTitle]
    } else if (newCategory === 'study') {
      if (!prices.value.study) prices.value.study = {}
      prices.value.study[newTitle] = cost
      if (oldCategory === 'study' && oldTitle !== newTitle) delete prices.value.study[oldTitle]
    }
  }

  appointments.value[idx] = { ...appointmentData }
  editingId.value = null
  await persist()
}

const submitCreate = async () => {
  const { cost, ...apptData } = createForm.value
  if (!apptData.title || !apptData.date) return

  const newId = appointments.value.length > 0
    ? Math.max(...appointments.value.map(a => a.id)) + 1
    : 1

  const newAppt = { id: newId, ...apptData }

  if (cost !== undefined && cost !== null && cost !== '') {
    if (newAppt.category === 'neuropsic') {
      const nCount = appointments.value.filter(a => a.category === 'neuropsic').length + 1
      prices.value.neuropsic_total = cost * nCount
    } else if (newAppt.category === 'alem') {
      if (!prices.value.alem) prices.value.alem = {}
      prices.value.alem[newAppt.title] = cost
    } else if (newAppt.category === 'study') {
      if (!prices.value.study) prices.value.study = {}
      prices.value.study[newAppt.title] = cost
    }
  }

  appointments.value.push(newAppt)
  showCreateModal.value = false
  await persist()
}

const persist = async () => {
  saveStatus.value = 'saving'
  try {
    await persistentFetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointments: appointments.value, prices: prices.value }),
    })
    saveStatus.value = 'saved'
    setTimeout(() => { saveStatus.value = null }, 2000)
  } catch (e) {
    saveStatus.value = null
    alert('Error al guardar: ' + e.message)
  }
}

const icon = (cat) => ({ alem: '🏠', neuropsic: '🧠', study: '🩻' }[cat] || '📋')
const iconBg = (cat) => ({ alem: 'bg-yellow-muted', neuropsic: 'bg-teal-muted', study: 'bg-blue-muted' }[cat] || 'bg-surface-3')
const badgeClass = (cat) => ({ alem: 'bg-yellow-muted text-yellow-bright', neuropsic: 'bg-teal-muted text-teal-bright', study: 'bg-blue-muted text-blue-bright' }[cat] || '')
const categoryLabel = (cat) => ({ alem: 'ALEM', neuropsic: 'Neuropsic', study: 'Estudio' }[cat] || cat)

const statusLabel = (s) => ({ pendiente: 'Pendiente', completada: 'Completada', cancelada: 'Cancelada', movida: 'Movida' }[s] || s)
const statusClass = (s) => ({ pendiente: 'bg-yellow-400', completada: 'bg-green-400', cancelada: 'bg-red-400', movida: 'bg-blue-400' }[s] || 'bg-gray-400')
const statusBadgeClass = (s) => ({ pendiente: 'bg-yellow-500/15 text-yellow-bright', completada: 'bg-green-500/15 text-green-400', cancelada: 'bg-red-500/15 text-red-400', movida: 'bg-blue-500/15 text-blue-bright' }[s] || '')
</script>

<style scoped>
.app-card {
  background: rgba(21, 22, 40, 0.75);
  border: 1px solid rgba(61, 61, 96, 0.6);
  border-radius: 12px;
  transition: all 0.15s ease;
}
.app-card:hover {
  border-color: rgba(20, 184, 166, 0.35);
}
.app-icon {
  width: 36px; height: 36px;
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}
.field-label {
  display: block;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: rgba(148, 163, 184, 0.6);
  margin-bottom: 2px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.status-dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}
.bg-yellow-muted  { background: rgba(234,179,8,0.15); }
.bg-teal-muted   { background: rgba(20,184,166,0.15); }
.bg-blue-muted   { background: rgba(59,130,246,0.15); }
.text-yellow-bright { color: #f59e0b; }
.text-teal-bright   { color: #14b8a6; }
.text-blue-bright   { color: #60a5fa; }
.edit-input {
  background: rgba(21, 22, 40, 0.9);
  border: 1px solid rgba(61, 61, 96, 0.6);
  border-radius: 8px;
  padding: 6px 8px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: #e2e8f0;
  outline: none;
  width: 100%;
}
.edit-input:focus {
  border-color: rgba(20, 184, 166, 0.5);
}
.bg-surface-2 { background: rgba(21, 22, 40, 0.75); }
.bg-surface-3 { background: rgba(29, 30, 50, 0.75); }
.border-rim { border-color: rgba(61, 61, 96, 0.6); }
</style>
