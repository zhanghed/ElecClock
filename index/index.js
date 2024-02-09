setInterval(() => {
  document.querySelector('.clock').innerHTML = new Date().toLocaleTimeString('chinese', { hour12: false })
}, 1000)
