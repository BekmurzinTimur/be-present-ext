let intervalId = null
let offscreenDocumentId = null

// Initialize when extension starts
chrome.runtime.onStartup.addListener(initializeBell)
chrome.runtime.onInstalled.addListener(initializeBell)

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    startBell()
  } else if (message.action === 'stop') {
    stopBell()
  }
})

async function initializeBell() {
  const result = await chrome.storage.sync.get(['bellEnabled'])
  if (result.bellEnabled) {
    startBell()
  }
}

function startBell() {
  // Clear any existing interval
  if (intervalId) {
    clearInterval(intervalId)
  }

  intervalId = setInterval(() => {
    playBell()
  }, 5 * 60 * 1000)

  console.log('Mindfulness bell started - will ring every 5 minutes')
}

function stopBell() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  console.log('Mindfulness bell stopped')
}

async function playBell() {
  try {
    // Create offscreen document for audio playback
    if (!offscreenDocumentId) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Playing mindfulness bell sound',
      })
      offscreenDocumentId = true
    }

    // Send message to offscreen document to play sound
    chrome.runtime.sendMessage({
      action: 'playSound',
    })
  } catch (error) {
    console.error('Error playing bell sound:', error)
  }
}
