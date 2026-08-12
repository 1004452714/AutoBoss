/**
 * Boss 配置状态管理。
 *
 * 管理 Boss 配置数组的增删改查、选中状态、自动保存和拖拽排序。
 * 所有字段变化通过 watch 自动同步到配置数组，保持列表与表单数据一致。
 */

import { ref, computed, watch } from 'vue'
import type { BossConfig, FarmMode } from '@/types'
import { createDefaultBossConfig } from '@/types'

export function useBossConfig(onSaveRequest: (content: string) => void) {
  const configs = ref<BossConfig[]>([])
  const selectedIndex = ref(-1)
  const statusMessage = ref('')
  const statusError = ref(false)

  /** 当前选中的配置 */
  const selectedConfig = computed<BossConfig | null>(() => {
    if (selectedIndex.value >= 0 && selectedIndex.value < configs.value.length) {
      return configs.value[selectedIndex.value]
    }
    return null
  })

  /** 是否有选中的配置 */
  const hasSelection = computed(() => selectedConfig.value !== null)

  // ---- 表单字段的本地响应式副本，用于双向绑定 ----
  const form = ref({
    name: '',
    team: '不切换',
    farmMode: '一次性-每日限量' as FarmMode,
    totalCount: 20,
    remainingCount: 20,
    dailyLimitCount: 1,
    dailyRemainingCount: 1,
    timeout: 240,
    strategyName: '根据队伍自动选择',
    returnToStatueAfterEachRound: false,
  })

  /** 加载初始配置数据（从 BGI 运行时接收） */
  function loadConfigs(data: BossConfig[]) {
    if (Array.isArray(data)) {
      configs.value = data
    } else {
      configs.value = []
    }
    if (configs.value.length > 0) {
      selectBoss(0)
    }
    showStatus('配置文件加载成功！')
  }

  /** 选中一个 Boss 进行编辑 */
  function selectBoss(index: number) {
    if (index < 0 || index >= configs.value.length) return
    selectedIndex.value = index
    const config = configs.value[index]
    form.value = {
      name: config.name,
      team: config.team || '不切换',
      farmMode: config.farmMode || '一次性-每日限量',
      totalCount: config.totalCount ?? 20,
      remainingCount: config.remainingCount ?? 20,
      dailyLimitCount: config.dailyLimitCount ?? 1,
      dailyRemainingCount: config.dailyRemainingCount ?? 1,
      timeout: config.fightParam?.timeout ?? 240,
      strategyName: config.fightParam?.strategyName || '根据队伍自动选择',
      returnToStatueAfterEachRound: config.returnToStatueAfterEachRound ?? false,
    }
  }

  /** 将表单数据同步到当前选中的配置条目 */
  function syncFormToConfig() {
    if (!selectedConfig.value) return
    const c = selectedConfig.value
    const f = form.value

    c.name = f.name
    c.team = f.team
    c.farmMode = f.farmMode
    c.totalCount = f.totalCount
    c.remainingCount = f.remainingCount
    c.dailyLimitCount = f.dailyLimitCount
    c.dailyRemainingCount = f.dailyRemainingCount
    c.returnToStatueAfterEachRound = f.returnToStatueAfterEachRound
    c.fightParam = {
      timeout: f.timeout,
      strategyName: f.strategyName || '根据队伍自动选择',
    }
  }

  /** 添加新 Boss */
  function addBoss() {
    configs.value.push(createDefaultBossConfig())
    selectBoss(configs.value.length - 1)
    showStatus('已添加新Boss')
  }

  /** 删除当前选中的 Boss */
  function deleteBoss() {
    if (!hasSelection.value) return
    const name = selectedConfig.value!.name
    configs.value.splice(selectedIndex.value, 1)

    if (configs.value.length === 0) {
      selectedIndex.value = -1
    } else if (selectedIndex.value >= configs.value.length) {
      selectBoss(configs.value.length - 1)
    } else {
      selectBoss(selectedIndex.value)
    }
    showStatus(`已删除Boss: ${name}`)
  }

  /** 拖拽排序 */
  function reorderBoss(fromIndex: number, toIndex: number) {
    if (fromIndex === toIndex) return
    const item = configs.value.splice(fromIndex, 1)[0]
    configs.value.splice(toIndex, 0, item)

    // 调整选中索引
    if (selectedIndex.value === fromIndex) {
      selectedIndex.value = toIndex
    } else if (fromIndex < selectedIndex.value && toIndex >= selectedIndex.value) {
      selectedIndex.value--
    } else if (fromIndex > selectedIndex.value && toIndex <= selectedIndex.value) {
      selectedIndex.value++
    }
    showStatus('Boss顺序已更新')
  }

  /** 保存配置到 BGI 运行时 */
  function saveAndClose() {
    const jsonContent = JSON.stringify(configs.value, null, 4)
    onSaveRequest(jsonContent)
    showStatus('配置已保存，正在关闭...')
  }

  function showStatus(message: string, isError = false) {
    statusMessage.value = message
    statusError.value = isError
  }

  // 监听表单字段变化，自动同步到配置数组
  watch(
    form,
    () => {
      if (hasSelection.value) {
        syncFormToConfig()
      }
    },
    { deep: true }
  )

  return {
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
  }
}
