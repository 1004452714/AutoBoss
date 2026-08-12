/**
 * 策略文件树状态管理。
 *
 * 负责从 BGI 运行时加载策略文件树，管理文件夹展开/折叠和文件选中。
 * 支持全量加载（根目录）和动态懒加载（子目录）两种模式。
 */

import { ref } from 'vue'
import type { StrategyNode, StrategyChildrenData } from '@/types'

export function useStrategyTree(requestFn: (url: string, data?: unknown) => Promise<unknown>) {
  const treeData = ref<StrategyNode | null>(null)
  const selectedPath = ref('')
  const isLoading = ref(false)

  /** 加载根目录策略树（全量） */
  async function loadRootTree() {
    isLoading.value = true
    try {
      await requestFn('/loadStrategyTree', {})
    } catch {
      // 错误由 htmlMask onMessage 统一处理
    } finally {
      isLoading.value = false
    }
  }

  /** 加载指定目录的子节点（动态懒加载） */
  async function loadChildren(path: string): Promise<StrategyNode[]> {
    try {
      const result = await requestFn('/loadStrategyChildren', { path })
      return (result as StrategyChildrenData)?.children || []
    } catch {
      return []
    }
  }

  /** 处理根目录策略树数据 */
  function handleTreeData(data: StrategyNode) {
    treeData.value = data
  }

  /** 选中策略文件 */
  function selectStrategy(path: string) {
    // 去掉文件后缀名
    const cleanPath = path.replace(/\.txt$/i, '').replace(/\.json$/i, '')
    selectedPath.value = cleanPath
    return cleanPath
  }

  /**
   * 格式化策略名用于显示
   * @param strategyPath - 完整策略路径
   * @returns 截断后的显示名（最长12字）
   */
  function formatDisplay(strategyPath: string): string {
    if (!strategyPath) return ''
    const fileName = strategyPath.split('/').pop() || strategyPath
    if (fileName.length > 12) {
      return fileName.substring(0, 4) + '...' + fileName.substring(fileName.length - 4)
    }
    return fileName
  }

  return {
    treeData,
    selectedPath,
    isLoading,
    loadRootTree,
    loadChildren,
    handleTreeData,
    selectStrategy,
    formatDisplay,
  }
}
