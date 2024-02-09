// 获取文件路径和修改标题
document.querySelector('.btn').addEventListener('click', async () => {
  const filePath = await window.electronAPI.openFile('123')
  document.querySelector('.filePath').innerText = filePath
})

// document.querySelector('.btn').addEventListener('click', async () => {
//   var options = {
//     title: '通知',
//     body: '123',
//     icon: '../img/h.png',
//   }
//   new window.Notification('通知', options)
// })

// 时钟
setInterval(() => {
  document.querySelector('.clock').innerHTML = new Date().toLocaleTimeString('chinese', { hour12: false })
}, 1000)
