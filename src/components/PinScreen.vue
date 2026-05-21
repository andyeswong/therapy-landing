<template>
  <div class="min-h-screen flex items-center justify-center px-4"
       style="background: #07080f; background-image: url('/noise.svg'); background-size: 200px;">
    <div class="w-full max-w-xs">

      <!-- Header -->
      <div class="text-center mb-10">
        <div class="text-5xl mb-3">🫶</div>
        <h1 class="font-serif text-xl font-semibold text-ghost">Ian</h1>
        <p class="font-mono text-[10px] text-ghost-faint mt-1 uppercase tracking-widest">agenda compartida · acceso privado</p>
      </div>

      <!-- PIN dots -->
      <div class="flex justify-center gap-4 mb-2" :class="{ shake: shaking }">
        <div v-for="i in 6" :key="i"
             class="w-3 h-3 rounded-full border-2 transition-all duration-150"
             :class="pin.length >= i
               ? 'bg-teal border-teal'
               : 'bg-transparent border-rim'" />
      </div>

      <!-- Error -->
      <p class="text-center font-mono text-xs text-red-400 mb-6 h-4">
        {{ error }}
      </p>

      <!-- Numpad -->
      <div class="grid grid-cols-3 gap-2">
        <button v-for="n in [1,2,3,4,5,6,7,8,9]" :key="n"
                @click="add(n)"
                class="numpad-btn">{{ n }}</button>
        <div></div>
        <button @click="add(0)" class="numpad-btn">0</button>
        <button @click="del" class="numpad-btn" style="color: #504f6a;">⌫</button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { login } from '../composables/useAuth.js'

const pin     = ref('')
const error   = ref('')
const shaking = ref(false)

const add = (d) => {
  if (pin.value.length >= 6) return
  pin.value += String(d)
  error.value = ''
}

const del = () => {
  pin.value = pin.value.slice(0, -1)
  error.value = ''
}

watch(pin, async (val) => {
  if (val.length < 6) return
  try {
    await login(val)
  } catch {
    shaking.value = true
    error.value = 'PIN incorrecto'
    setTimeout(() => {
      pin.value   = ''
      shaking.value = false
      error.value   = ''
    }, 600)
  }
})
</script>

<style scoped>
.numpad-btn {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  background: rgba(21, 22, 40, 0.75);
  border: 1px solid rgba(37, 37, 64, 1);
  font-family: 'JetBrains Mono', monospace;
  font-size: 1.25rem;
  color: #e2e0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.1s;
  -webkit-tap-highlight-color: transparent;
}
.numpad-btn:active {
  background: rgba(20, 184, 166, 0.2);
  border-color: rgba(20, 184, 166, 0.4);
  transform: scale(0.95);
}

.shake { animation: shake 0.45s ease; }
@keyframes shake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-10px); }
  40%      { transform: translateX(10px); }
  60%      { transform: translateX(-7px); }
  80%      { transform: translateX(5px); }
}
</style>
