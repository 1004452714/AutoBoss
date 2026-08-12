<script setup lang="ts">
/**
 * 策略树节点（递归组件）。
 * 文件夹：可展开/折叠，点击后懒加载子节点。
 * 文件：可选中。
 */
import { ref } from 'vue'
import type { StrategyNode } from '@/types'

const props = defineProps<{
  node: StrategyNode
  selectedPath: string
  childrenCache: Record<string, StrategyNode[]>
  onLoadFolder: (path: string) => Promise<StrategyNode[]>
}>()

const emit = defineEmits<{
  select: [path: string]
}>()

const isExpanded = ref(false)
const isLoaded = ref(false)
const children = ref<StrategyNode[]>([])

function displayName(): string {
  return props.node.name.split('/').pop() || props.node.name
}

function isSelected(): boolean {
  const cleanPath = props.node.name.replace(/\.txt$/i, '').replace(/\.json$/i, '')
  return props.selectedPath === cleanPath
}

async function toggleFolder() {
  isExpanded.value = !isExpanded.value
  if (isExpanded.value && !isLoaded.value) {
    isLoaded.value = true
    children.value = await props.onLoadFolder(props.node.name)
  }
}

function onFileClick() {
  emit('select', props.node.name)
}
</script>

<template>
  <div class="tree-node-wrapper">
    <!-- 文件夹 -->
    <div v-if="node.type === 'folder'" class="tree-node folder" @click="toggleFolder">
      <svg class="node-chevron" :class="{ expanded: isExpanded }" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
        <polyline points="9 18 15 12 9 6"/>
      </svg>
      <svg class="node-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
      </svg>
      <span class="node-name">{{ displayName() }}</span>
    </div>

    <!-- 文件夹子节点 -->
    <div v-if="node.type === 'folder'" class="node-children" :class="{ collapsed: !isExpanded }">
      <div v-if="isExpanded && !isLoaded" class="node-loading">加载中...</div>
      <StrategyTree
        v-for="child in children"
        :key="child.name"
        :node="child"
        :selected-path="selectedPath"
        :children-cache="childrenCache"
        :on-load-folder="onLoadFolder"
        @select="emit('select', $event)"
      />
    </div>

    <!-- 文件 -->
    <div
      v-if="node.type === 'file'"
      class="tree-node file"
      :class="{ selected: isSelected() }"
      @click="onFileClick"
    >
      <span class="node-indent"></span>
      <svg class="node-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
      <span class="node-name">{{ displayName() }}</span>
      <svg v-if="isSelected()" class="node-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.tree-node-wrapper { }

/* ===== 节点基础 ===== */
.tree-node {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  user-select: none;
}

.tree-node:hover {
  background: var(--color-primary-lighter);
}

/* ===== 文件夹 ===== */
.tree-node.folder {
  color: var(--color-text);
  font-weight: 500;
}

.node-chevron {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform 0.15s;
}

.node-chevron.expanded {
  transform: rotate(90deg);
}

/* ===== 文件 ===== */
.tree-node.file {
  color: var(--color-text-secondary);
}

.tree-node.file.selected {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 500;
}

.node-indent {
  width: 14px;
  flex-shrink: 0;
}

.node-icon {
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.tree-node.folder .node-icon {
  color: var(--color-primary);
}

.tree-node.file.selected .node-icon {
  color: var(--color-primary);
}

.node-name {
  flex: 1;
  font-size: 13px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-check {
  color: var(--color-primary);
  flex-shrink: 0;
}

/* ===== 子节点容器 ===== */
.node-children {
  padding-left: 18px;
}

.node-children.collapsed {
  display: none;
}

.node-loading {
  padding: 6px 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
