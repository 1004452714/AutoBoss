<script setup lang="ts">
/**
 * 策略选择弹窗。
 * 模态对话框，内嵌策略文件树浏览器。
 */
import type { StrategyNode } from '@/types'
import StrategyTree from './StrategyTree.vue'

defineProps<{
  visible: boolean
  treeData: StrategyNode | null
  selectedPath: string
  childrenCache: Record<string, StrategyNode[]>
  onLoadFolder: (path: string) => Promise<StrategyNode[]>
}>()

const emit = defineEmits<{
  close: []
  select: [strategyPath: string]
}>()

function onOverlayClick(e: MouseEvent) {
  if (e.target === e.currentTarget) emit('close')
}

function onSelectFile(path: string) {
  const cleanPath = path.replace(/\.txt$/i, '').replace(/\.json$/i, '')
  emit('select', cleanPath)
}
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click="onOverlayClick">
      <div class="modal-panel">
        <!-- 头部 -->
        <div class="modal-header">
          <div class="modal-title-group">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
            </svg>
            <span>选择战斗策略</span>
          </div>
          <button class="modal-close" @click="emit('close')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <!-- 内容 -->
        <div class="modal-body">
          <div class="tree-container">
            <div v-if="!treeData" class="tree-loading">
              <span class="spinner"></span>
              加载策略文件中...
            </div>
            <template v-else-if="treeData.children && treeData.children.length > 0">
              <StrategyTree
                v-for="node in treeData.children"
                :key="node.name"
                :node="node"
                :selected-path="selectedPath"
                :children-cache="childrenCache"
                :on-load-folder="onLoadFolder"
                @select="onSelectFile"
              />
            </template>
            <div v-else class="tree-empty">
              <p>未找到策略文件</p>
              <span>请确保 BetterGI\User\AutoFight\ 目录下存在 .txt 或 .json 策略文件</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ===== 遮罩 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(4px);
}

/* ===== 弹窗面板 ===== */
.modal-panel {
  width: 420px;
  max-width: 90vw;
  max-height: 75vh;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ===== 弹窗头部 ===== */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}

.modal-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.modal-title-group svg {
  color: var(--color-primary);
}

.modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-sm);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition);
}

.modal-close:hover {
  background: var(--color-border-light);
  color: var(--color-text);
}

/* ===== 弹窗内容 ===== */
.modal-body {
  padding: 16px 20px;
  overflow: hidden;
  flex: 1;
}

.tree-container {
  max-height: 420px;
  overflow-y: auto;
  padding: 4px;
  border-radius: var(--radius-sm);
  background: var(--color-sidebar);
}

.tree-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 16px;
  font-size: 13px;
  color: var(--color-text-muted);
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.tree-empty {
  padding: 32px 16px;
  text-align: center;
}

.tree-empty p {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
  margin-bottom: 6px;
}

.tree-empty span {
  font-size: 12px;
  color: var(--color-text-muted);
  line-height: 1.5;
}

/* ===== 过渡动画 ===== */
.modal-enter-active { transition: all 0.2s ease-out; }
.modal-leave-active { transition: all 0.15s ease-in; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-from .modal-panel { transform: scale(0.95) translateY(8px); }
.modal-leave-to .modal-panel { transform: scale(0.95) translateY(8px); }
.modal-panel { transition: transform 0.2s ease-out; }
</style>
