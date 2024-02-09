setInterval(() => {
  document.querySelector('.clock').innerHTML = new Date().toLocaleTimeString('chinese', { hour12: false })
}, 1000)

window.electronAPI.handConfig((event, value) => {
  console.log(value)
  document.querySelector('.clock').style.color = value.color
})
