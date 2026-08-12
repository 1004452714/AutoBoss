<script setup lang="ts">
/**
 * Boss 编辑表单（右侧内容区）。
 * 提供所有配置字段的双向绑定编辑界面。
 * 根据刷取模式自动切换字段的启用/禁用状态。
 */
import { computed } from 'vue'
import type { BossCascadeData, FarmMode } from '@/types'
import CascadeSelect from './CascadeSelect.vue'

const props = defineProps<{
  form: {
    name: string
    team: string
    farmMode: FarmMode
    totalCount: number
    remainingCount: number
    dailyLimitCount: number
    dailyRemainingCount: number
    timeout: number
    strategyName: string
    returnToStatueAfterEachRound: boolean
  }
  cascadeData: BossCascadeData
  unsupported: boolean
}>()

const emit = defineEmits<{
  'update:form': [value: Partial<typeof props.form>]
  delete: []
  openStrategyPicker: []
}>()

const isOnceMode = computed(() => props.form.farmMode === '一次性')
const isDailyMode = computed(() => props.form.farmMode === '每日重置')
const isMainCountDisabled = computed(() => isDailyMode.value)
const isDailyCountDisabled = computed(() => isOnceMode.value)

function emitUpdate<K extends keyof typeof props.form>(key: K, value: (typeof props.form)[K]) {
  emit('update:form', { [key]: value })
}

function parseNumberInput(event: Event, fallback: number): number {
  const value = parseInt((event.target as HTMLInputElement).value, 10)
  return Number.isNaN(value) ? fallback : value
}

const farmModeOptions: { value: FarmMode; label: string; desc: string }[] = [
  { value: '一次性-每日限量', label: '每日限量', desc: '每天刷取限定次数，刷完为止' },
  { value: '一次性', label: '一次性刷完', desc: '连续刷取直到总次数用完' },
  { value: '每日重置', label: '每日重置', desc: '每天重置限量次数，无限循环' },
]
</script>

<template>
  <div class="editor-form">
    <!-- 头部 -->
    <div class="form-header">
      <div class="form-header-left">
        <h2 class="form-title">{{ form.name }}</h2>
        <span class="form-subtitle">编辑讨伐配置</span>
      </div>
      <button class="btn-delete" @click="emit('delete')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
        删除
      </button>
    </div>

    <!-- 刷取模式选择 -->
    <div class="form-section">
      <div class="mode-selector">
        <label
          v-for="opt in farmModeOptions"
          :key="opt.value"
          class="mode-card"
          :class="{ active: form.farmMode === opt.value }"
        >
          <input
            type="radio"
            :value="opt.value"
            :checked="form.farmMode === opt.value"
            @change="emitUpdate('farmMode', opt.value)"
          />
          <span class="mode-label">{{ opt.label }}</span>
          <span class="mode-desc">{{ opt.desc }}</span>
        </label>
      </div>
    </div>

    <!-- BOSS 名称 + 队伍 -->
    <div class="form-section">
      <div class="field-row">
        <div class="field-group">
          <label class="field-label">Boss 名称</label>
          <CascadeSelect
            :model-value="form.name"
            :cascade-data="cascadeData"
            @update:model-value="emitUpdate('name', $event)"
          />
          <div v-if="unsupported" class="field-hint warning">此 Boss 暂未支持自动寻路</div>
        </div>
        <div class="field-group">
          <label class="field-label" for="team">队伍名称</label>
          <input
            id="team"
            class="field-input"
            type="text"
            :value="form.team"
            placeholder="不切换"
            @input="emitUpdate('team', ($event.target as HTMLInputElement).value)"
          />
          <div class="field-hint">留空则使用当前队伍</div>
        </div>
      </div>
    </div>

    <!-- 次数配置 -->
    <div class="form-section">
      <div class="field-row">
        <div class="field-group count-field">
          <label class="field-label" for="totalCount">总讨伐次数</label>
          <input
            id="totalCount"
            class="field-input"
            type="number"
            min="1"
            :value="form.totalCount"
            :disabled="isMainCountDisabled"
            @input="emitUpdate('totalCount', parseNumberInput($event, 20))"
          />
        </div>
        <div class="field-group count-field">
          <label class="field-label" for="remainingCount">剩余次数</label>
          <input
            id="remainingCount"
            class="field-input"
            type="number"
            min="0"
            :value="form.remainingCount"
            :disabled="isMainCountDisabled"
            @input="emitUpdate('remainingCount', parseNumberInput($event, 20))"
          />
        </div>
      </div>
      <div class="field-row">
        <div class="field-group count-field">
          <label class="field-label" for="dailyLimitCount">每日限量次数</label>
          <input
            id="dailyLimitCount"
            class="field-input"
            type="number"
            min="1"
            :value="form.dailyLimitCount"
            :disabled="isDailyCountDisabled"
            @input="emitUpdate('dailyLimitCount', parseNumberInput($event, 1))"
          />
        </div>
        <div class="field-group count-field">
          <label class="field-label" for="dailyRemainingCount">今日剩余</label>
          <input
            id="dailyRemainingCount"
            class="field-input"
            type="number"
            min="0"
            :value="form.dailyRemainingCount"
            :disabled="isDailyCountDisabled"
            @input="emitUpdate('dailyRemainingCount', parseNumberInput($event, 1))"
          />
        </div>
      </div>
    </div>

    <!-- 战斗设置 -->
    <div class="form-section">
      <label class="section-label">战斗设置</label>
      <div class="field-row">
        <div class="field-group">
          <label class="field-label" for="timeout">战斗超时（秒）</label>
          <input
            id="timeout"
            class="field-input"
            type="number"
            min="30"
            :value="form.timeout"
            @input="emitUpdate('timeout', parseNumberInput($event, 240))"
          />
        </div>
        <div class="field-group">
          <label class="field-label" for="strategyName">战斗策略</label>
          <div class="strategy-row">
            <input
              id="strategyName"
              class="field-input"
              type="text"
              :value="form.strategyName"
              placeholder="根据队伍自动选择"
              @input="emitUpdate('strategyName', ($event.target as HTMLInputElement).value)"
            />
            <button type="button" class="btn-pick" @click="emit('openStrategyPicker')">选择</button>
          </div>
          <div class="field-hint">留空则自动匹配。策略文件位于 BetterGI\User\AutoFight\</div>
        </div>
      </div>

      <!-- 回神像开关 -->
      <label class="toggle-row">
        <span class="toggle-label">
          <span>每轮后回七天神像回血</span>
          <span class="field-hint">战斗结束后自动传送回血</span>
        </span>
        <span class="toggle-switch">
          <input
            id="returnToStatueAfterEachRound"
            type="checkbox"
            :checked="form.returnToStatueAfterEachRound"
            @change="emitUpdate('returnToStatueAfterEachRound', ($event.target as HTMLInputElement).checked)"
          />
          <span class="toggle-track"></span>
        </span>
      </label>
    </div>
  </div>
</template>

<style scoped>
/* ===== 表单容器 ===== */
.editor-form {
  flex: 1;
  overflow-y: auto;
  padding: 22px 28px;
  max-width: none;
}

/* ===== 头部 ===== */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 18px;
}

.form-header-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.form-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}

.form-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
}

.btn-delete {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-danger);
  background: transparent;
  border: 1px solid rgba(229, 72, 77, 0.25);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}

.btn-delete:hover {
  background: var(--color-danger);
  color: #fff;
}

/* ===== 分区 ===== */
.form-section {
  margin-bottom: 18px;
}

.section-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 12px;
}

/* ===== 字段行 ===== */
.field-row {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.field-row:last-child { margin-bottom: 0; }

.field-group {
  flex: 1;
  min-width: 0;
}

.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.count-field {
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-field .field-label {
  flex: 0 0 91px;
  margin-bottom: 0;
  white-space: nowrap;
}

.count-field .field-input {
  flex: 1;
  min-width: 0;
  width: auto;
}

.field-input {
  width: 100%;
  padding: 9px 12px;
  font-size: 13px;
  font-family: inherit;
  color: var(--color-text);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  outline: none;
  transition: all var(--transition);
}

.field-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-lighter);
}

.field-input:disabled {
  background: var(--color-sidebar);
  color: var(--color-text-placeholder);
  cursor: not-allowed;
}

.field-input::placeholder {
  color: var(--color-text-placeholder);
}

.field-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 5px;
  line-height: 1.4;
}

.field-hint.warning {
  color: var(--color-warning);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* ===== 模式选择器 ===== */
.mode-selector {
  display: flex;
  gap: 10px;
}

.mode-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 9px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition);
  position: relative;
}

.mode-card input[type="radio"] {
  position: absolute;
  opacity: 0;
}

.mode-card:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-lighter);
}

.mode-card.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.mode-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
}

.mode-desc {
  font-size: 11px;
  color: var(--color-text-muted);
  line-height: 1.4;
}

.mode-card.active .mode-label { color: var(--color-primary); }
.mode-card.active .mode-desc { color: var(--color-primary); opacity: 0.7; }

/* ===== 策略选择行 ===== */
.strategy-row {
  display: flex;
  gap: 8px;
}

.strategy-row .field-input {
  flex: 1;
}

.btn-pick {
  flex-shrink: 0;
  padding: 9px 14px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-primary);
  background: var(--color-primary-lighter);
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  white-space: nowrap;
}

.btn-pick:hover {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

/* ===== Toggle 开关 ===== */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: var(--color-sidebar);
  border-radius: var(--radius-md);
  cursor: pointer;
  border: 1px solid transparent;
  transition: all var(--transition);
}

.toggle-row:hover {
  border-color: var(--color-border);
}

.toggle-label {
  display: flex;
  flex-direction: column;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
}

.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
}

.toggle-switch input {
  position: absolute;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
  z-index: 1;
}

.toggle-track {
  position: absolute;
  inset: 0;
  background: var(--color-border);
  border-radius: 12px;
  transition: background var(--transition);
}

.toggle-track::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: transform var(--transition);
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
}

.toggle-switch input:checked + .toggle-track {
  background: var(--color-primary);
}

.toggle-switch input:checked + .toggle-track::after {
  transform: translateX(20px);
}
</style>
