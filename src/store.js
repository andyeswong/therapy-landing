import { ref } from 'vue'
import data from './data/appointments.json'

export const appointments = ref(JSON.parse(JSON.stringify(data.appointments)))
export const prices = ref(JSON.parse(JSON.stringify(data.prices)))
