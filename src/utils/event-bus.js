import Vue from 'vue'

// 创建事件总线
export const EventBus = new Vue()

// 为了方便使用，将其挂载到Vue原型上
Vue.prototype.$eventBus = EventBus

export default EventBus