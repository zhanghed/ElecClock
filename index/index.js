let format = true

const showDate = () => {
  const date = new Date()
  let h = String(date.getHours()).padStart(2, '0')
  let m = String(date.getMinutes()).padStart(2, '0')
  let s = String(date.getSeconds()).padStart(2, '0')
  if (format) {
    document.querySelector('body').innerHTML = `${h}:${m}:${s}`
  } else {
    document.querySelector('body').innerHTML = `${h}:${m}`
  }
}

window.electronAPI.handConfig((event, value) => {
  format = value.format
  document.querySelector('body').style.color = value.color
  if (format) {
    document.querySelector('body').style.fontSize = '23vw'
  } else {
    document.querySelector('body').style.fontSize = '36vw'
  }
  showDate()
})

setInterval(() => {
  showDate()
}, 1000)
