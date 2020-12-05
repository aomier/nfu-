export default class SocketService {
  /**
   * 单例
   */
  static instance = null
  static get Instance() {
    if (!this.instance) {
      this.instance = new SocketService()
    }
    return this.instance
  }

  // 和服务端连接的socket对象
  ws = null
  // 标识是否连接成功
  connected = false

  // 存储回到函数
  callBackMapping = {}

  // 定义连接服务器的方法
  connect() {
    // 连接服务器
    if (!window.WebSocket) return console.log('您的浏览器不支持 WebSocket');

    this.ws = new WebSocket('ws://localhost:9998')

    // 连接成功的事件
    this.ws.onopen = () => {
      this.connected = true
      console.log('连接服务端成功了');
    }

    // 接收到服务端数据
    this.ws.onmessage = (msg) => {
      console.log('接收到服务端数据：', msg.data);
      // 保存接收到的数据
      const recvData = JSON.parse(msg.data)
      // 取出业务模块类型
      const socketType = recvData.socketType
      // 判断回调函数是否存在
      if (this.callBackMapping[socketType]) {
        const action = recvData.action
        if (action === 'getData') {
          // 获取数据  realData真实数据
          const realData = JSON.parse(recvData.data)
          console.log(this.callBackMapping);
          this.callBackMapping[socketType].call(this, realData)
        } else if (action === 'fullScreen') {
          // 全屏事件
        } else if (action === 'themeChange') {
          // 主题切换
        }
      }

      return console.log('未注册回调函数');
    }

    // 连接服务端失败
    this.ws.onerror = () => {
      this.connected = false
      console.log('连接服务端失败');
    }

    // 连接已关闭
    this.ws.onclose = () => {
      this.connected = false
      console.log('连接已关闭');
    }
  }

  /**
   * 注册回调函数
   * @param {socketType} 业务模块类型 
   * @param {*} callback 
   */
  registerCallBack(socketType, callback) {
    this.callBackMapping[socketType] = callback
  }

  // 取消某一个回调函数
  unRegisterCallBack(socketType) {
    this.callBackMapping[callback] = null
  }

  // 发送数据的方法
  send(data) {
    if (this.connected) {
      // 调用 webSocket 身上的send方法
      this.ws.send(JSON.stringify(data))
    } else {
      setTimeout(() => {
        this.send
      }, 500);
    }

  }
}