(() => {
  try {
    const theme = localStorage.getItem('nebulosa-theme') === 'light' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  } catch (_error) {
    document.documentElement.dataset.theme = 'dark'
    document.documentElement.style.colorScheme = 'dark'
  }
})()
