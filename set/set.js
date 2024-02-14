window.electronAPI.handConfig((event, value) => {
  document.querySelector('.color').value = value.color
  document.querySelector('.size').value = value.size
  document.querySelector('.openAtLogin').checked = value.openAtLogin
  document.querySelector('.remind').value = value.remind
  document.querySelector('.format').checked = value.format
})
document.querySelector('.color').addEventListener('change', (event) => {
  window.electronAPI.setColor(event.target.value)
})
document.querySelector('.size').addEventListener('change', (event) => {
  window.electronAPI.setSize(Number(event.target.value))
})
document.querySelector('.openAtLogin').addEventListener('change', (event) => {
  window.electronAPI.setOpenAtLogin(event.target.checked)
})
document.querySelector('.remind').addEventListener('change', (event) => {
  window.electronAPI.setRemind(event.target.value)
})
document.querySelector('.format').addEventListener('change', (event) => {
  window.electronAPI.setFormat(event.target.checked)
})

document.querySelector('.reset').addEventListener('click', (event) => {
  const reset = { color: '#d81e06', size: 4, format: true, position: [50, 50], openAtLogin: true, remind: '' }
  window.electronAPI.setReset(reset)
})
