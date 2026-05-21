import { ref, computed } from 'vue'
import { apiFetch } from './useAuth.js'

const appointments = ref([])

function getPrice(item) {
  return item.cost ? `$${Number(item.cost).toLocaleString()}` : '-'
}

function getNumericPrice(item) {
  return item.cost ?? 0
}

const appointmentsWithPrice = computed(() =>
  appointments.value.map(a => ({ ...a, price: getPrice(a) }))
)

const totalSum = computed(() =>
  appointments.value
    .filter(a => a.status !== 'completada')
    .reduce((sum, a) => sum + (a.cost ?? 0), 0)
)

const alemCount      = computed(() => appointments.value.filter(a => a.category === 'alem').length)
const neuropsicCount = computed(() => appointments.value.filter(a => a.category === 'neuropsic').length)
const studyCount     = computed(() => appointments.value.filter(a => a.category === 'study').length)

const MONTH_IDX = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 }
function parseDateOrd(dateStr) {
  const [d, m] = (dateStr || '').split(' ')
  return (MONTH_IDX[m] ?? 99) * 100 + (parseInt(d) || 0)
}

const sorted = computed(() =>
  [...appointmentsWithPrice.value].sort((a, b) => parseDateOrd(a.date) - parseDateOrd(b.date))
)

export async function loadAppointments() {
  const res = await apiFetch('/api/appointments')
  if (!res.ok) return
  const { appointments: rows } = await res.json()
  appointments.value = rows || []
}

export function useAppointments() {
  return {
    appointments,
    getPrice,
    getNumericPrice,
    appointmentsWithPrice,
    totalSum,
    alemCount,
    neuropsicCount,
    studyCount,
    sorted,
    loadAppointments,
  }
}
