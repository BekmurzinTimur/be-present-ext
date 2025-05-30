const audio = document.getElementById('bellSound');

// Add logging to help debug
console.log('Offscreen document loaded');
const VOLUME_GAIN_FACTOR = 0.2;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Offscreen received message:', message);
  
  if (message.action === 'playSound') {
    try {
      // Set volume (0.0 to 1.0)
      const rawVolume = message.volume !== undefined ? message.volume : 0.5;
      const adjustedVolume = rawVolume * VOLUME_GAIN_FACTOR;
      audio.volume = adjustedVolume;
      
      console.log(`Playing bell sound - Raw volume: ${rawVolume}, Adjusted volume: ${adjustedVolume}`);
      
      // Reset audio to beginning
      audio.currentTime = 0;
      
      // Play the sound
      audio.play()
        .then(() => {
          console.log('Bell sound played successfully');
          sendResponse({ success: true });
        })
        .catch(error => {
          console.error('Error playing sound:', error);
          sendResponse({ success: false, error: error.message });
        });
      
      // Return true to indicate we'll send a response asynchronously
      return true;
      
    } catch (error) {
      console.error('Error in playSound handler:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
});

// Add error event listener to audio element
audio.addEventListener('error', (e) => {
  console.error('Audio element error:', e);
});

// Add load event listener to confirm audio is ready
audio.addEventListener('loadeddata', () => {
  console.log('Audio file loaded successfully');
});

// Test if audio file exists
audio.addEventListener('loadstart', () => {
  console.log('Audio loading started');
});