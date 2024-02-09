document.querySelector('.btn').addEventListener('click', async () => {
  const filePath = await window.electronAPI.openFile('123')
  document.querySelector('.filePath').innerText = filePath
})
