<template>
  <section id="notas" class="px-3 pt-4 pb-4">
    <div class="flex items-center justify-between mb-3">
      <div>
        <p class="font-mono text-[10px] text-ghost-faint uppercase tracking-widest">// notas_compartidas</p>
        <p class="font-sans text-sm font-semibold text-ghost">Notas</p>
      </div>
    </div>

    <!-- Notes grid -->
    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
      <div
        v-for="note in notes"
        :key="note.id"
        class="postit p-3 rounded-xl relative"
        :class="postitBg(note.color)"
      >
        <button
          @click.stop="deleteNote(note.id)"
          class="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/20 text-xs flex items-center justify-center"
        >✕</button>

        <!-- Edit mode -->
        <div v-if="editingNoteId === note.id">
          <textarea
            ref="textareaRef"
            v-model="editNoteText"
            class="w-full bg-transparent border-none outline-none resize-none font-sans text-xs text-gray-900 min-h-[50px]"
            rows="3"
          ></textarea>
          <div class="flex gap-1.5 mt-1">
            <button @click="saveNote(note.id)" class="font-mono text-[10px] bg-black/15 px-2 py-0.5 rounded text-gray-800">✓ guardar</button>
          </div>
        </div>

        <!-- View mode -->
        <div v-else @click="startEditNote(note)" class="cursor-pointer">
          <p class="font-sans text-xs text-gray-900 leading-relaxed whitespace-pre-wrap pr-4">{{ note.text || 'Tap para editar...' }}</p>
        </div>
      </div>

      <!-- Add note button -->
      <button
        @click="addNote"
        class="postit-add rounded-xl flex flex-col items-center justify-center gap-1 min-h-[80px]"
      >
        <span class="text-xl text-ghost-faint">+</span>
        <span class="font-mono text-[10px] text-ghost-faint">Agregar</span>
      </button>
    </div>

    <!-- Save status -->
    <div v-if="noteSaveStatus" class="px-3 py-1.5 rounded-lg text-xs font-mono bg-teal-500/20 text-teal-bright">
      {{ noteSaveStatus }}
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { persistentFetch, isOnline } from '../composables/useOffline.js'

const notes = ref([])
const editingNoteId = ref(null)
const editNoteText = ref('')
const noteSaveStatus = ref(null)
const textareaRef = ref(null)

const colors = ['yellow', 'teal', 'pink', 'blue', 'green']
const postitBg = (c) => ({
  yellow: 'bg-yellow-200/90',
  teal: 'bg-teal-200/90',
  pink: 'bg-pink-200/90',
  blue: 'bg-blue-200/90',
  green: 'bg-green-200/90',
}[c] || 'bg-yellow-200/90')

const loadNotes = async () => {
  try {
    const res = await (isOnline() ? fetch('/api/notes') : fetch('/api/notes'))
    if (res.ok) {
      const data = await res.json()
      notes.value = data.length ? data : [{ id: 1, text: 'Tap para editar...', color: 'yellow' }]
    }
  } catch {
    notes.value = [{ id: 1, text: 'Tap para editar...', color: 'yellow' }]
  }
}

const persistNotes = async () => {
  try {
    noteSaveStatus.value = 'Guardando...'
    const res = await persistentFetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes.value),
    })
    if (res.ok) {
      noteSaveStatus.value = '✓ Guardado'
      setTimeout(() => { noteSaveStatus.value = null }, 1500)
    } else {
      noteSaveStatus.value = 'Error al guardar'
    }
  } catch (e) {
    noteSaveStatus.value = 'Error: ' + e.message
  }
}

const addNote = async () => {
  const newId = notes.value.length > 0 ? Math.max(...notes.value.map(n => n.id)) + 1 : 1
  const color = colors[notes.value.length % colors.length]
  const newNote = { id: newId, text: '', color }
  notes.value.push(newNote)
  await persistNotes()
  // Auto edit the new note
  await nextTick()
  startEditNote(newNote)
}

const startEditNote = (note) => {
  editingNoteId.value = note.id
  editNoteText.value = note.text
}

const saveNote = async (noteId) => {
  const idx = notes.value.findIndex(n => n.id === noteId)
  if (idx !== -1) {
    notes.value[idx].text = editNoteText.value
    editingNoteId.value = null
    await persistNotes()
  }
}

const deleteNote = async (id) => {
  notes.value = notes.value.filter(n => n.id !== id)
  if (editingNoteId.value === id) editingNoteId.value = null
  await persistNotes()
}

onMounted(loadNotes)
</script>

<style scoped>
.postit-add {
  background: rgba(21, 22, 40, 0.5);
  border: 2px dashed rgba(61, 61, 96, 0.6);
  transition: all 0.15s;
}
.postit-add:hover, .postit-add:active {
  border-color: rgba(20, 184, 166, 0.4);
  background: rgba(21, 22, 40, 0.7);
}
.text-teal-bright { color: #14b8a6; }
</style>
