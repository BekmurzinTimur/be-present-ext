let intervalId = null;
let offscreenDocumentId = null;
let currentVolume = 0.5; // Default 50%
let currentInterval = 5; // Default 5 minutes

// Initialize when extension starts
chrome.runtime.onStartup.addListener(initializeBell);
chrome.runtime.onInstalled.addListener(initializeBell);

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'start') {
    startBell();
  } else if (message.action === 'stop') {
    stopBell();
  } else if (message.action === 'restart') {
    stopBell();
    startBell();
  } else if (message.action === 'setVolume') {
    currentVolume = message.volume;
  } else if (message.action === 'setInterval') {
    currentInterval = message.interval;
  }
});

async function initializeBell() {
  const result = await chrome.storage.sync.get(['bellEnabled', 'bellVolume', 'bellInterval']);
  
  if (result.bellEnabled) {
    startBell();
  }
  if (result.bellVolume !== undefined) {
    currentVolume = result.bellVolume / 100;
  }
  if (result.bellInterval !== undefined) {
    currentInterval = result.bellInterval;
  }
}

function startBell() {
  // Clear any existing interval
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  // Convert minutes to milliseconds
  const intervalMs = currentInterval * 60 * 1000;
  
  // Set up new interval
  intervalId = setInterval(() => {
    playBell();
  }, intervalMs);
  
  console.log(`Mindfulness bell started - will ring every ${currentInterval} minutes`);
}

function stopBell() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  console.log('Mindfulness bell stopped');
}

async function playBell() {
  try {
    // Create offscreen document for audio playback
    if (!offscreenDocumentId) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Playing mindfulness bell sound'
      });
      offscreenDocumentId = true;
    }
    
    // Send message to offscreen document to play sound with volume
    chrome.runtime.sendMessage({
      action: 'playSound',
      volume: currentVolume
    });
    
  } catch (error) {
    console.error('Error playing bell sound:', error);
  }
}