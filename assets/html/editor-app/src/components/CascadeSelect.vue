<script setup lang="ts">
/**
 * 级联下拉选择器。
 * 左侧区域列表 → 右侧 Boss 名称列表，两级联动选择。
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { BossCascadeData } from '@/types'

const props = defineProps<{
  modelValue: string
  cascadeData: BossCascadeData
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const selectedRegion = ref('')
const triggerRef = ref<HTMLElement | null>()
const dropdownRef = ref<HTMLElement | null>()

const regions = computed(() => Object.keys(props.cascadeData.bossList || {}))
const bosses = computed(() => {
  if (!selectedRegion.value) return []
  return props.cascadeData.bossList[selectedRegion.value] || []
})

function open() {
  if (props.modelValue) {
    for (const [region, bossNames] of Object.entries(props.cascadeData.bossList || {})) {
      if (bossNames.includes(props.modelValue)) {
        selectedRegion.value = region
        break
      }
    }
  }
  if (!selectedRegion.value && regions.value.length > 0) {
    selectedRegion.value = regions.value[0]
  }
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function selectRegion(region: string) {
  selectedRegion.value = region
}

function selectBoss(bossName: string) {
  emit('update:modelValue', bossName)
  close()
}

function onDocumentClick(e: MouseEvent) {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(e.target as Node) &&
    triggerRef.value &&
    !triggerRef.value.contains(e.target as Node)
  ) {
    close()
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))
</script>

<template>
  <div class="cascade-root">
    <div
      ref="triggerRef"
      class="cascade-trigger"
      :class="{ open: isOpen }"
      @click.stop="isOpen ? close() : open()"
    >
      <span v-if="modelValue" class="cascade-value">{{ modelValue }}</span>
      <span v-else class="cascade-placeholder">点击选择 Boss</span>
      <svg class="cascade-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </div>

    <Transition name="drop">
      <div v-if="isOpen" ref="dropdownRef" class="cascade-dropdown" @click.stop>
        <!-- 区域列表 -->
        <div class="cascade-regions">
          <button
            v-for="region in regions"
            :key="region"
            class="cascade-region-btn"
            :class="{ active: region === selectedRegion }"
            @click="selectRegion(region)"
          >
            {{ region }}
          </button>
        </div>

        <!-- Boss 列表 -->
        <div class="cascade-bosses">
          <button
            v-for="boss in bosses"
            :key="boss"
            class="cascade-boss-btn"
            :class="{ selected: boss === modelValue }"
            @click="selectBoss(boss)"
          >
            <span>{{ boss }}</span>
            <svg v-if="boss === modelValue" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </button>
          <div v-if="bosses.length === 0" class="cascade-empty">无 Boss 数据</div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.cascade-root {
  position: relative;
}

/* ===== 触发器 ===== */
.cascade-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 9px 12px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  user-select: none;
  min-height: 38px;
}

.cascade-trigger:hover {
  border-color: var(--color-primary);
}

.cascade-trigger.open {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

.cascade-value {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.cascade-placeholder {
  font-size: 13px;
  color: var(--color-text-placeholder);
}

.cascade-chevron {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform 0.2s;
}

.cascade-trigger.open .cascade-chevron {
  transform: rotate(180deg);
}

/* ===== 下拉面板 ===== */
.cascade-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  z-index: 1000;
  display: flex;
  width: 380px;
  max-width: calc(100vw - 40px);
  max-height: 300px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

/* ===== 区域列表 ===== */
.cascade-regions {
  width: 100px;
  flex-shrink: 0;
  overflow-y: auto;
  background: var(--color-sidebar);
  border-right: 1px solid var(--color-border);
  padding: 6px;
}

.cascade-region-btn {
  display: block;
  width: 100%;
  padding: 8px 10px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition);
}

.cascade-region-btn:hover {
  background: var(--color-primary-lighter);
  color: var(--color-primary);
}

.cascade-region-btn.active {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

/* ===== Boss 列表 ===== */
.cascade-bosses {
  flex: 1;
  overflow-y: auto;
  padding: 6px;
}

.cascade-boss-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 9px 12px;
  font-size: 13px;
  color: var(--color-text);
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  text-align: left;
  transition: all var(--transition);
}

.cascade-boss-btn:hover {
  background: var(--color-primary-lighter);
}

.cascade-boss-btn.selected {
  color: var(--color-primary);
  font-weight: 500;
}

.cascade-boss-btn.selected svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.cascade-empty {
  padding: 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* ===== 过渡动画 ===== */
.drop-enter-active { transition: all 0.15s ease-out; }
.drop-leave-active { transition: all 0.1s ease-in; }
.drop-enter-from,
.drop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
