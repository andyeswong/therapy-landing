import { ref, computed } from 'vue'
import data from '../data/appointments.json'

const appointments = ref(JSON.parse(JSON.stringify(data.appointments)))
const prices = ref(JSON.parse(JSON.stringify(data.prices)))

const neuropsicPerSession = computed(() => {
  const count = appointments.value.filter(a => a.category === 'neuropsic').length
  return count > 0 ? Math.round(prices.value.neuropsic_total / count) : 0
})

function getPrice(item) {
  if (item.category === 'neuropsic') return `$${neuropsicPerSession.value.toLocaleString()}`
  if (item.category === 'alem') return `$${prices.value.alem[item.title]?.toLocaleString() ?? 0}`
  if (item.category === 'study') return `$${prices.value.study[item.title]?.toLocaleString() ?? 0}`
  return '-'
}

function getNumericPrice(item) {
  if (item.category === 'neuropsic') return neuropsicPerSession.value
  if (item.category === 'alem') return prices.value.alem[item.title] ?? 0
  if (item.category === 'study') return prices.value.study[item.title] ?? 0
  return 0
}

const appointmentsWithPrice = computed(() =>
  appointments.value.map(a => ({ ...a, price: getPrice(a) }))
)

const totalSum = computed(() => {
  let total = prices.value.neuropsic_total
  Object.values(prices.value.alem).forEach(v => total += v)
  Object.values(prices.value.study).forEach(v => total += v)
  return total
})

const alemCount = computed(() => appointments.value.filter(a => a.category === 'alem').length)
const neuropsicCount = computed(() => appointments.value.filter(a => a.category === 'neuropsic').length)
const studyCount = computed(() => appointments.value.filter(a => a.category === 'study').length)

const monthOrder = { 'May': 1, 'Jun': 2 }
const sorted = computed(() => [...appointmentsWithPrice.value].sort((a, b) => {
  const [dA, mA] = a.date.split(' ')
  const [dB, mB] = b.date.split(' ')
  if ((monthOrder[mA] ?? 99) !== (monthOrder[mB] ?? 99)) return (monthOrder[mA] ?? 99) - (monthOrder[mB] ?? 99)
  return parseInt(dA) - parseInt(dB)
}))

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
  }
}
