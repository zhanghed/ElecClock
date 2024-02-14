window.electronAPI.handConfig((event, value) => {
  document.querySelector('.color').value = value.color
  document.querySelector('.size').value = value.size
  document.querySelector('.openAtLogin').checked = value.openAtLogin
  document.querySelector('.remind').value = value.remind
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
