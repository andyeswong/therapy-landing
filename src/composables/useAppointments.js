import { ref, computed } from 'vue'
import { apiFetch } from './useAuth.js'

const appointments = ref([])
const prices = ref({ neuropsic_total: 0, alem: {}, study: {} })

const neuropsicPerSession = computed(() => {
  const count = appointments.value.filter(a => a.category === 'neuropsic').length
  return count > 0 ? Math.round(prices.value.neuropsic_total / count) : 0
})

function getPrice(item) {
  if (item.category === 'neuropsic') return `$${neuropsicPerSession.value.toLocaleString()}`
  if (item.category === 'alem')      return `$${prices.value.alem[item.title]?.toLocaleString() ?? 0}`
  if (item.category === 'study')     return `$${prices.value.study[item.title]?.toLocaleString() ?? 0}`
  return '-'
}

function getNumericPrice(item) {
  if (item.category === 'neuropsic') return neuropsicPerSession.value
  if (item.category === 'alem')      return prices.value.alem[item.title] ?? 0
  if (item.category === 'study')     return prices.value.study[item.title] ?? 0
  return 0
}

const appointmentsWithPrice = computed(() =>
  appointments.value.map(a => ({ ...a, price: getPrice(a) }))
)

const totalSum = computed(() => {
  let total = prices.value.neuropsic_total || 0
  Object.values(prices.value.alem   || {}).forEach(v => total += v)
  Object.values(prices.value.study  || {}).forEach(v => total += v)
  return total
})

const alemCount      = computed(() => appointments.value.filter(a => a.category === 'alem').length)
const neuropsicCount = computed(() => appointments.value.filter(a => a.category === 'neuropsic').length)
const studyCount     = computed(() => appointments.value.filter(a => a.category === 'study').length)

// Dynamic month sort — works for any month/year
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
  const data = await res.json()
  appointments.value = data.appointments || []
  prices.value = data.prices || { neuropsic_total: 0, alem: {}, study: {} }
}

export function useAppointments() {
  return {
    appointments,
    prices,
    neuropsicPerSession,
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
