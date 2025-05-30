let intervalId = null;
let offscreenCreated = false;
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
  try {
    // Create offscreen document on initialization
    await ensureOffscreenDocument();
    
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
  } catch (error) {
    console.error('Error initializing bell:', error);
  }
}

function startBell() {
  // Clear any existing interval
  if (intervalId) {
    clearInterval(intervalId);
  }
  
  // Convert minutes to milliseconds
  const intervalMs = currentInterval * 60 * 1000;
  playBell();
  
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

async function ensureOffscreenDocument() {
  try {
    // Check if offscreen document already exists
    const hasDocument = await chrome.offscreen.hasDocument();
    
    if (!hasDocument) {
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: ['AUDIO_PLAYBACK'],
        justification: 'Playing mindfulness bell sound'
      });
      offscreenCreated = true;
      console.log('Offscreen document created');
    }
  } catch (error) {
    console.error('Error creating offscreen document:', error);
    throw error;
  }
}

async function playBell() {
  try {
    // Ensure offscreen document exists
    await ensureOffscreenDocument();
    
    // Send message to offscreen document to play sound with volume
    await chrome.runtime.sendMessage({
      action: 'playSound',
      volume: currentVolume
    });
    
    console.log('Bell sound played');
    
  } catch (error) {
    console.error('Error playing bell sound:', error);
    
    // If connection failed, try to recreate offscreen document
    if (error.message.includes('Receiving end does not exist')) {
      console.log('Attempting to recreate offscreen document...');
      offscreenCreated = false;
      try {
        // Close existing document if any
        await chrome.offscreen.closeDocument();
      } catch (closeError) {
        // Ignore close errors
      }
      
      // Try again
      try {
        await ensureOffscreenDocument();
        await chrome.runtime.sendMessage({
          action: 'playSound',
          volume: currentVolume
        });
        console.log('Bell sound played after recreation');
      } catch (retryError) {
        console.error('Failed to play sound after recreation:', retryError);
      }
    }
  }
}