import './assets/main.css'

import {createApp} from 'vue'
import App from './App.vue'
import ColorPicker from 'colorpicker-v3'  // 注册组件
import 'colorpicker-v3/style.css' // 引入样式文件
const app = createApp(App)
app.use(ColorPicker)
app.mount('#app')
