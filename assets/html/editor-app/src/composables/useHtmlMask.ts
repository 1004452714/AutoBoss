/**
 * htmlMask 通信层封装。
 *
 * 负责与 BetterGI 运行时（window.htmlMask）之间的双向消息通信。
 * 网页加载完成后自动请求配置和 Boss 列表数据。
 */

import { ref, onMounted } from 'vue'
import type { HtmlMaskMessage } from '@/types'

interface HtmlMaskAPI {
  request: (url: string, data?: unknown) => Promise<unknown>
  onMessage: ((message: HtmlMaskMessage) => void) | null
}

export function useHtmlMask() {
  const isReady = ref(false)
  const isInBgiEnv = ref(false)

  /** 获取 htmlMask API，如果不在 BGI 环境中则返回 null */
  function getApi(): HtmlMaskAPI | null {
    if (typeof window !== 'undefined' && window.htmlMask) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return window.htmlMask as any
    }
    return null
  }

  /**
   * 向 BGI 运行时发送请求
   * @param url - 消息路由路径
   * @param data - 请求数据
   */
  async function request(url: string, data: unknown = {}): Promise<unknown> {
    const api = getApi()
    if (api) {
      return api.request(url, data)
    }
    console.warn(`[htmlMask] 未在 BGI 环境中运行，无法发送请求: ${url}`)
    return null
  }

  /**
   * 注册消息接收处理器。
   * 页面挂载后调用，将 onMessage 回调绑定到 htmlMask。
   */
  function onMessage(handler: (message: HtmlMaskMessage) => void): void {
    const api = getApi()
    if (api) {
      api.onMessage = handler
      isInBgiEnv.value = true
    } else {
      console.warn('[htmlMask] 未在 BGI 环境中运行，使用演示模式')
    }
    isReady.value = true
  }

  onMounted(() => {
    // 标记环境就绪，具体消息注册由调用方处理
    isReady.value = true
    if (getApi()) {
      isInBgiEnv.value = true
    }
  })

  return {
    isReady,
    isInBgiEnv,
    request,
    onMessage,
    getApi,
  }
}
