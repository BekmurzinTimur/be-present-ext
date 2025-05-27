const audio = document.getElementById('bellSound')

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'playSound') {
    audio.currentTime = 0
    audio.play().catch((error) => {
      console.error('Error playing sound:', error)
    })
  }
})
