<script setup lang="ts">
/**
 * Boss 列表面板（左侧边栏）。
 * 渲染配置列表并支持 HTML5 拖拽排序。
 */
import { ref } from 'vue'
import type { BossConfig } from '@/types'

const props = defineProps<{
  configs: BossConfig[]
  selectedIndex: number
}>()

const emit = defineEmits<{
  select: [index: number]
  reorder: [fromIndex: number, toIndex: number]
  add: []
  saveAndClose: []
}>()

const draggedIndex = ref(-1)

function onDragStart(e: DragEvent, index: number) {
  draggedIndex.value = index
  const el = e.currentTarget as HTMLElement
  el.classList.add('dragging')
  e.dataTransfer!.effectAllowed = 'move'
}

function onDragEnd(e: DragEvent) {
  const el = e.currentTarget as HTMLElement
  el.classList.remove('dragging')
  draggedIndex.value = -1
}

function onDragOver(e: DragEvent, index: number) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'move'
  if (index !== draggedIndex.value) {
    const el = e.currentTarget as HTMLElement
    el.classList.add('drag-over')
  }
}

function onDragLeave(e: DragEvent) {
  const el = e.currentTarget as HTMLElement
  el.classList.remove('drag-over')
}

function onDrop(e: DragEvent, dropIndex: number) {
  e.preventDefault()
  const el = e.currentTarget as HTMLElement
  el.classList.remove('drag-over')
  if (draggedIndex.value !== -1 && draggedIndex.value !== dropIndex) {
    emit('reorder', draggedIndex.value, dropIndex)
  }
  draggedIndex.value = -1
}
</script>

<template>
  <aside class="sidebar">
    <!-- 标题栏 -->
    <div class="sidebar-header">
      <div class="sidebar-title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="12" y1="18" x2="12" y2="12"/>
          <line x1="9" y1="15" x2="15" y2="15"/>
        </svg>
        <span>Boss 配置列表</span>
      </div>
      <span class="sidebar-count">{{ configs.length }}</span>
    </div>

    <!-- Boss 列表 -->
    <div class="boss-list">
      <div
        v-for="(config, index) in configs"
        :key="index"
        class="boss-item"
        :class="{ selected: index === selectedIndex }"
        draggable="true"
        @click="emit('select', index)"
        @dragstart="onDragStart($event, index)"
        @dragend="onDragEnd"
        @dragover="onDragOver($event, index)"
        @dragleave="onDragLeave"
        @drop="onDrop($event, index)"
      >
        <span class="drag-handle" title="拖拽排序">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="9" cy="5" r="2"/><circle cx="15" cy="5" r="2"/>
            <circle cx="9" cy="12" r="2"/><circle cx="15" cy="12" r="2"/>
            <circle cx="9" cy="19" r="2"/><circle cx="15" cy="19" r="2"/>
          </svg>
        </span>
        <span class="boss-index">{{ index + 1 }}</span>
        <span class="boss-name">{{ config.name }}</span>
        <span class="boss-mode-tag">{{ config.farmMode === '每日重置' ? '每日' : config.farmMode === '一次性' ? '单次' : '限量' }}</span>
      </div>

      <div v-if="configs.length === 0" class="boss-list-empty">
        暂无配置，点击下方按钮添加
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="sidebar-footer">
      <button class="btn btn-add" @click="emit('add')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
        添加 Boss
      </button>
      <button class="btn btn-save" @click="emit('saveAndClose')">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        保存并关闭
      </button>
    </div>
  </aside>
</template>

<style scoped>
/* ===== 侧边栏 ===== */
.sidebar {
  width: 240px;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  background: var(--color-sidebar);
  border-right: 1px solid var(--color-border);
}

/* ===== 标题栏 ===== */
.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--color-border);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.sidebar-title svg {
  color: var(--color-primary);
  flex-shrink: 0;
}

.sidebar-count {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
  background: var(--color-border-light);
  padding: 2px 8px;
  border-radius: 10px;
  min-width: 22px;
  text-align: center;
}

/* ===== Boss 列表 ===== */
.boss-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.boss-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 10px;
  margin-bottom: 3px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  border: 1px solid transparent;
  background: transparent;
}

.boss-item:hover {
  background: var(--color-primary-lighter);
}

.boss-item.selected {
  background: var(--color-primary-light);
  border-color: var(--color-primary);
}

.boss-item.dragging {
  opacity: 0.4;
}

.boss-item.drag-over {
  border-color: var(--color-primary);
  border-style: dashed;
  background: var(--color-primary-lighter);
}

.drag-handle {
  flex-shrink: 0;
  cursor: grab;
  color: var(--color-text-placeholder);
  display: flex;
  align-items: center;
  padding: 2px;
  border-radius: 3px;
  transition: color var(--transition);
}

.drag-handle:active { cursor: grabbing; }
.boss-item:hover .drag-handle { color: var(--color-text-muted); }

.boss-index {
  flex-shrink: 0;
  width: 20px;
  text-align: center;
  font-size: 11px;
  font-weight: 500;
  color: var(--color-text-muted);
}

.boss-name {
  flex: 1;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.boss-mode-tag {
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 500;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-border-light);
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
}

.boss-item.selected .boss-mode-tag {
  background: rgba(79, 110, 247, 0.12);
  color: var(--color-primary);
}

.boss-list-empty {
  padding: 32px 16px;
  text-align: center;
  font-size: 13px;
  color: var(--color-text-muted);
}

/* ===== 底部操作 ===== */
.sidebar-footer {
  padding: 12px;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
}

.btn-add {
  background: transparent;
  color: var(--color-primary);
  border: 1.5px dashed var(--color-primary);
}

.btn-add:hover {
  background: var(--color-primary-lighter);
}

.btn-save {
  background: var(--color-primary);
  color: #fff;
}

.btn-save:hover {
  background: var(--color-primary-hover);
}
</style>
