/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

/** BetterGI 运行时注入的 htmlMask 全局对象 */
interface HtmlMask {
  request(url: string, data?: unknown): Promise<unknown>
  onMessage: ((message: HtmlMaskMessage) => void) | null
}

interface HtmlMaskMessage {
  url: string
  data?: unknown
}

declare global {
  interface Window {
    htmlMask?: HtmlMask
  }
}

export {}
