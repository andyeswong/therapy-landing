<template>
  <section id="notas" class="px-3 pt-0 pb-28">

    <!-- Sticky header -->
    <div class="sticky top-0 z-40 -mx-3 px-3 pt-3 pb-2.5 mb-3 border-b border-rim/30 flex items-center justify-between"
         style="background: rgba(7,8,15,0.93); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);">
      <div>
        <p class="font-mono text-[10px] text-ghost-faint uppercase tracking-widest">// notas_compartidas</p>
        <p class="font-sans text-sm font-semibold text-ghost">Board</p>
      </div>
      <button @click="showTypeSheet = true"
        class="w-9 h-9 rounded-full bg-teal/15 border border-teal/40 text-teal text-2xl leading-none flex items-center justify-center active:scale-90 transition-transform">
        +
      </button>
    </div>

    <!-- Save status -->
    <div v-if="saveStatus" class="mb-2 px-3 py-1.5 rounded-lg text-xs font-mono"
         :class="saveStatus === 'saved' ? 'bg-teal-500/20 text-teal-bright' : 'bg-yellow-500/20 text-yellow-400'">
      {{ saveStatus === 'saved' ? '✓ Guardado' : 'Guardando...' }}
    </div>

    <!-- Empty state -->
    <div v-if="notes.length === 0" class="py-20 text-center">
      <p class="text-4xl mb-2">📌</p>
      <p class="font-mono text-xs text-ghost-faint">Toca + para agregar notas, fotos o links</p>
    </div>

    <!-- Board items -->
    <div class="flex flex-col gap-2">
      <template v-for="item in notes" :key="item.id">

        <!-- NOTE -->
        <div v-if="!item.type || item.type === 'note'"
             class="board-card relative pl-0 overflow-hidden"
             :style="noteBorderStyle(item.color)">
          <button @click="deleteNote(item.id)"
                  class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/20 text-xs flex items-center justify-center text-ghost-faint hover:text-red-400 transition-colors z-10">✕</button>
          <div v-if="editingId === item.id" class="p-3 pr-10">
            <textarea v-model="editText"
                      class="board-textarea"
                      rows="4"
                      placeholder="Escribe tu nota..."
                      autofocus></textarea>
            <button @click="saveNote(item.id)"
                    class="mt-1.5 font-mono text-[10px] bg-black/20 hover:bg-teal/20 px-2.5 py-1 rounded text-ghost-muted hover:text-teal-bright transition-colors">
              ✓ guardar
            </button>
          </div>
          <p v-else @click="startEdit(item)"
             class="p-3 pr-10 font-sans text-xs text-ghost leading-relaxed whitespace-pre-wrap cursor-pointer min-h-[44px]">
            {{ item.text || 'Tap para editar...' }}
          </p>
        </div>

        <!-- LINK -->
        <div v-else-if="item.type === 'link'" class="board-card relative">
          <button @click="deleteNote(item.id)"
                  class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/20 text-xs flex items-center justify-center text-ghost-faint hover:text-red-400 transition-colors">✕</button>
          <div v-if="editingId === item.id" class="space-y-1.5 pr-8">
            <input v-model="editUrl" class="board-input" placeholder="https://..." autofocus />
            <input v-model="editText" class="board-input" placeholder="Descripción (opcional)" />
            <button @click="saveNote(item.id)"
                    class="font-mono text-[10px] bg-teal/20 px-2.5 py-1 rounded text-teal-bright">✓ guardar</button>
          </div>
          <div v-else class="flex items-center gap-2.5 pr-8" @click="startEdit(item)">
            <span class="text-lg shrink-0">🔗</span>
            <div class="flex-1 min-w-0">
              <p class="font-sans text-xs text-ghost font-medium truncate">{{ item.text || item.url }}</p>
              <p v-if="item.text" class="font-mono text-[10px] text-ghost-faint truncate">{{ item.url }}</p>
            </div>
            <a v-if="item.url" :href="item.url" target="_blank" rel="noopener noreferrer" @click.stop
               class="shrink-0 font-mono text-[10px] text-teal-bright border border-teal/30 px-2 py-0.5 rounded-full">↗</a>
          </div>
        </div>

        <!-- PHOTO -->
        <div v-else-if="item.type === 'photo'" class="board-card p-0 overflow-hidden relative">
          <button @click="deleteNote(item.id)"
                  class="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-black/60 text-sm flex items-center justify-center text-white">✕</button>
          <img :src="item.url" :alt="item.filename || 'Foto'"
               class="w-full object-cover max-h-72 cursor-zoom-in"
               @click="viewingPhoto = item.url" />
          <p v-if="item.text" class="px-3 py-2 font-sans text-xs text-ghost-faint">{{ item.text }}</p>
        </div>

        <!-- FILE -->
        <div v-else-if="item.type === 'file'" class="board-card relative">
          <button @click="deleteNote(item.id)"
                  class="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/20 text-xs flex items-center justify-center text-ghost-faint hover:text-red-400 transition-colors">✕</button>
          <div class="flex items-center gap-3 pr-8">
            <span class="text-2xl shrink-0">{{ fileIcon(item.mime_type) }}</span>
            <div class="flex-1 min-w-0">
              <p class="font-sans text-xs text-ghost font-medium truncate">{{ item.filename || 'Archivo' }}</p>
              <p class="font-mono text-[10px] text-ghost-faint truncate">{{ fileMimeLabel(item.mime_type) }}</p>
            </div>
            <a :href="item.url" :download="item.filename" @click.stop
               class="shrink-0 font-mono text-[10px] text-teal-bright border border-teal/30 px-2 py-1 rounded-full">↓</a>
          </div>
        </div>

      </template>
    </div>
  </section>

  <!-- Photo fullscreen viewer -->
  <Teleport to="body">
    <div v-if="viewingPhoto" class="fixed inset-0 z-[80] flex items-center justify-center bg-black/95"
         @click="viewingPhoto = null">
      <img :src="viewingPhoto" class="max-w-full max-h-full object-contain p-4" />
      <button class="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center">✕</button>
    </div>
  </Teleport>

  <!-- Type picker bottom sheet -->
  <Teleport to="body">
    <div v-if="showTypeSheet" class="fixed inset-0 z-[60] flex items-end">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="showTypeSheet = false"></div>
      <div class="relative w-full rounded-t-2xl p-5 pb-10 border-t border-rim/40"
           style="background: #0f1021;">
        <div class="w-8 h-1 bg-rim rounded-full mx-auto mb-4"></div>
        <p class="font-mono text-[10px] text-ghost-faint uppercase tracking-widest mb-3">Agregar al board</p>
        <div class="grid grid-cols-4 gap-2">
          <button v-for="t in typeOptions" :key="t.value" @click="addItem(t.value)"
            class="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-rim active:bg-teal/10 active:border-teal/40 transition-all"
            style="background: rgba(21,22,40,0.9);">
            <span class="text-2xl">{{ t.icon }}</span>
            <span class="font-mono text-[10px] text-ghost-faint">{{ t.label }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Hidden file inputs -->
    <input ref="photoInput" type="file" accept="image/*" capture="environment" class="hidden" @change="onFileSelected($event, 'photo')" />
    <input ref="fileInput" type="file" class="hidden" @change="onFileSelected($event, 'file')" />
  </Teleport>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { persistentFetch } from '../composables/useOffline.js'

const notes = ref([])
const saveStatus = ref(null)
const showTypeSheet = ref(false)
const editingId = ref(null)
const editText = ref('')
const editUrl = ref('')
const viewingPhoto = ref(null)
const photoInput = ref(null)
const fileInput = ref(null)

const typeOptions = [
  { value: 'note',  icon: '📝', label: 'Nota'    },
  { value: 'link',  icon: '🔗', label: 'Enlace'  },
  { value: 'photo', icon: '📷', label: 'Foto'    },
  { value: 'file',  icon: '📎', label: 'Archivo' },
]

const colors = ['yellow', 'teal', 'pink', 'blue', 'green']
const noteBorderStyle = (c) => {
  const map = {
    yellow: '3px solid rgba(250,204,21,0.7)',
    teal:   '3px solid rgba(20,184,166,0.7)',
    pink:   '3px solid rgba(236,72,153,0.7)',
    blue:   '3px solid rgba(59,130,246,0.7)',
    green:  '3px solid rgba(34,197,94,0.7)',
  }
  return { borderLeft: map[c] || map.yellow }
}

const fileIcon = (mime) => {
  if (!mime) return '📎'
  if (mime.startsWith('video/')) return '🎬'
  if (mime.startsWith('audio/')) return '🎵'
  if (mime.includes('pdf')) return '📄'
  if (mime.includes('word') || mime.includes('document')) return '📝'
  if (mime.includes('sheet') || mime.includes('excel')) return '📊'
  return '📎'
}

const fileMimeLabel = (mime) => {
  if (!mime) return 'Archivo'
  if (mime.startsWith('video/')) return 'Video'
  if (mime.startsWith('audio/')) return 'Audio'
  if (mime.includes('pdf')) return 'PDF'
  return mime.split('/').pop()?.toUpperCase() || 'Archivo'
}

const nextId = () => notes.value.length > 0 ? Math.max(...notes.value.map(n => n.id)) + 1 : 1

const loadNotes = async () => {
  try {
    const res = await persistentFetch('/api/notes')
    if (res.ok) notes.value = await res.json()
  } catch {}
}

const persistNotes = async () => {
  saveStatus.value = 'saving'
  try {
    await persistentFetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(notes.value),
    })
    saveStatus.value = 'saved'
    setTimeout(() => { saveStatus.value = null }, 1500)
  } catch {
    saveStatus.value = null
  }
}

const addItem = async (type) => {
  showTypeSheet.value = false
  if (type === 'photo') { await nextTick(); photoInput.value?.click(); return }
  if (type === 'file')  { await nextTick(); fileInput.value?.click();  return }
  const noteCount = notes.value.filter(n => !n.type || n.type === 'note').length
  const note = {
    id: nextId(), type, text: '', sort_order: notes.value.length,
    color: type === 'note' ? colors[noteCount % colors.length] : null,
    url: null, mime_type: null, filename: null,
  }
  notes.value.push(note)
  await persistNotes()
  await nextTick()
  editingId.value = note.id
  editText.value = ''
  editUrl.value = ''
}

const onFileSelected = async (e, type) => {
  const file = e.target.files[0]
  if (!file) return
  e.target.value = ''
  const formData = new FormData()
  formData.append('file', file)
  saveStatus.value = 'saving'
  try {
    const res = await persistentFetch('/api/notes/upload', { method: 'POST', body: formData })
    if (!res.ok) throw new Error('Upload failed')
    const { url, mime_type, filename } = await res.json()
    notes.value.push({ id: nextId(), type, text: '', color: null, url, mime_type, filename, sort_order: notes.value.length })
    await persistNotes()
  } catch (err) {
    saveStatus.value = null
    alert('Error subiendo: ' + err.message)
  }
}

const startEdit = (item) => {
  editingId.value = item.id
  editText.value = item.text || ''
  editUrl.value = item.url || ''
}

const saveNote = async (id) => {
  const idx = notes.value.findIndex(n => n.id === id)
  if (idx === -1) return
  notes.value[idx] = {
    ...notes.value[idx],
    text: editText.value,
    ...(notes.value[idx].type === 'link' ? { url: editUrl.value } : {}),
  }
  editingId.value = null
  await persistNotes()
}

const deleteNote = async (id) => {
  notes.value = notes.value.filter(n => n.id !== id)
  if (editingId.value === id) editingId.value = null
  await persistNotes()
}

onMounted(loadNotes)
</script>

<style scoped>
.board-card {
  background: rgba(21, 22, 40, 0.85);
  border: 1px solid rgba(61, 61, 96, 0.5);
  border-radius: 12px;
  padding: 12px;
  transition: border-color 0.15s;
}
.board-card:hover { border-color: rgba(61, 61, 96, 0.8); }
.board-textarea {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: #e2e0f0;
  line-height: 1.6;
  min-height: 60px;
}
.board-input {
  display: block;
  width: 100%;
  background: rgba(7, 8, 15, 0.6);
  border: 1px solid rgba(61, 61, 96, 0.6);
  border-radius: 8px;
  padding: 6px 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  color: #e2e0f0;
  outline: none;
}
.board-input:focus { border-color: rgba(20, 184, 166, 0.5); }
.text-teal-bright { color: #14b8a6; }
</style>
