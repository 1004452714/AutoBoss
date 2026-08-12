<script setup lang="ts">
/**
 * Boss 配置编辑器 - 根组件。
 * 游戏内浮层弹窗，负责布局、BGI 通信初始化和消息路由。
 */
import { ref, onMounted } from 'vue'
import type { BossConfig, BossCascadeData, HtmlMaskMessage, StrategyNode, StrategyChildrenData } from '@/types'
import { useHtmlMask } from '@/composables/useHtmlMask'
import { useBossConfig } from '@/composables/useBossConfig'
import { useStrategyTree } from '@/composables/useStrategyTree'
import BossList from '@/components/BossList.vue'
import BossForm from '@/components/BossForm.vue'
import StrategyPicker from '@/components/StrategyPicker.vue'

const { request, onMessage } = useHtmlMask()

const cascadeData = ref<BossCascadeData>({ bossList: {}, unsupportedBosses: [] })

const {
  treeData,
  selectedPath,
  loadRootTree,
  loadChildren,
  handleTreeData,
  handleChildrenData,
  formatDisplay,
} = useStrategyTree(request)

const {
  configs,
  selectedIndex,
  selectedConfig,
  hasSelection,
  form,
  statusMessage,
  statusError,
  loadConfigs,
  selectBoss,
  addBoss,
  deleteBoss,
  reorderBoss,
  saveAndClose,
  showStatus,
} = useBossConfig((content: string) => {
  request('/saveAndClose', { content })
})

const isVisible = ref(true)
const strategyModalVisible = ref(false)
const childrenCache = ref<Record<string, StrategyNode[]>>({})

function isUnsupported(bossName: string): boolean {
  const baseName = bossName.replace(/（未支持）$/, '')
  return cascadeData.value.unsupportedBosses.some(
    (unsupported) => baseName === unsupported || bossName.includes(unsupported)
  )
}

function openStrategyPicker() {
  strategyModalVisible.value = true
  loadRootTree()
}

function closeStrategyPicker() {
  strategyModalVisible.value = false
}

function onStrategySelect(strategyPath: string) {
  form.value.strategyName = strategyPath
  strategyModalVisible.value = false
  showStatus('已选择策略: ' + formatDisplay(strategyPath))
}

async function onLoadChildren(folderPath: string): Promise<StrategyNode[]> {
  if (childrenCache.value[folderPath]) return childrenCache.value[folderPath]
  const children = await loadChildren(folderPath)
  childrenCache.value[folderPath] = children
  return children
}

onMounted(() => {
  onMessage((msg: HtmlMaskMessage) => {
    switch (msg.url) {
      case '/loadConfig': {
        const data = (msg.data as { data?: BossConfig[] })?.data ?? (msg.data as BossConfig[])
        loadConfigs(data as BossConfig[])
        break
      }
      case '/bossList': {
        const data = (msg.data as { data?: BossCascadeData })?.data ?? (msg.data as BossCascadeData)
        cascadeData.value = data as BossCascadeData
        break
      }
      case '/toggleVisibility': {
        const visible = (msg.data as { visible: boolean })?.visible
        isVisible.value = visible !== false
        break
      }
      case '/strategyTreeData': {
        const data = (msg.data as { data?: StrategyNode })?.data ?? (msg.data as StrategyNode)
        handleTreeData(data as StrategyNode)
        break
      }
      case '/strategyChildrenData': {
        const data = (msg.data as { data?: StrategyChildrenData })?.data ?? (msg.data as StrategyChildrenData)
        const childrenData = data as StrategyChildrenData
        if (childrenData.path && childrenData.children) {
          childrenCache.value[childrenData.path] = childrenData.children
          handleChildrenData(childrenData)
        }
        break
      }
      case '/saveAndClose':
        showStatus('配置已保存')
        break
    }
  })

  if (typeof window !== 'undefined' && window.htmlMask) {
    request('/loadConfig', {}).catch(() => {})
  }
})
</script>

<template>
  <div class="overlay-root" :style="{ display: isVisible ? 'flex' : 'none' }">
    <div class="editor-panel">
      <!-- 左侧列表 -->
      <BossList
        :configs="configs"
        :selected-index="selectedIndex"
        @select="selectBoss"
        @reorder="reorderBoss"
        @add="addBoss"
        @save-and-close="saveAndClose"
      />

      <!-- 右侧内容区 -->
      <div class="content-area">
        <!-- 空状态 -->
        <div v-if="!hasSelection" class="empty-state">
          <div class="empty-icon">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
              <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5"/>
              <path d="M18 3l-3 3 3 3"/><path d="M15 6h6"/>
            </svg>
          </div>
          <p class="empty-title">选择或添加 Boss</p>
          <p class="empty-desc">从左侧列表选择条目进行编辑<br/>或点击「添加 Boss」创建新配置</p>
        </div>

        <!-- 编辑表单 -->
        <BossForm
          v-else
          :form="form"
          :cascade-data="cascadeData"
          :unsupported="isUnsupported(form.name)"
          @update:form="Object.assign(form, $event)"
          @delete="deleteBoss"
          @open-strategy-picker="openStrategyPicker"
        />

        <!-- 状态提示 -->
        <Transition name="toast">
          <div v-if="statusMessage" class="status-toast" :class="{ error: statusError }">
            <span class="status-dot"></span>
            {{ statusMessage }}
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <!-- 策略选择弹窗 -->
  <StrategyPicker
    :visible="strategyModalVisible"
    :tree-data="treeData"
    :selected-path="selectedPath"
    :children-cache="childrenCache"
    :on-load-folder="onLoadChildren"
    @close="closeStrategyPicker"
    @select="onStrategySelect"
  />
</template>

<style scoped>
/* ===== 浮层根容器（透明背景，居中面板） ===== */
.overlay-root {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 游戏内浮层：背景透明 */
  background: transparent;
  pointer-events: none;
}

/* ===== 编辑器面板（浮层卡片） ===== */
.editor-panel {
  display: flex;
  width: 960px;
  max-width: calc(100vw - 24px);
  height: 650px;
  max-height: calc(100vh - 24px);
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-panel);
  overflow: hidden;
  /* 面板本身接收交互 */
  pointer-events: auto;
}

/* ===== 右侧内容区 ===== */
.content-area {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
  background: var(--color-surface);
}

/* ===== 空状态 ===== */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
}

.empty-icon {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  background: var(--color-primary-lighter);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin-bottom: 18px;
}

.empty-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
}

.empty-desc {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  line-height: 1.7;
}

/* ===== 状态提示 ===== */
.status-toast {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: var(--shadow-panel);
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  z-index: 100;
}

.status-toast.error {
  color: var(--color-danger);
  border-color: rgba(229, 72, 77, 0.2);
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-success);
  flex-shrink: 0;
}

.status-toast.error .status-dot {
  background: var(--color-danger);
}

.toast-enter-active { transition: all 0.2s ease-out; }
.toast-leave-active { transition: all 0.15s ease-in; }
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(8px);
}
</style>
