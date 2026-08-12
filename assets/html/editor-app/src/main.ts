/**
 * Boss 配置编辑器 - Vue 3 入口。
 *
 * 挂载 Vue 应用到 #app，全局样式。
 */
import { createApp } from 'vue'
import App from './App.vue'
import './styles/main.css'

const app = createApp(App)
app.mount('#app')
