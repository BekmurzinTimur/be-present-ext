const audio = document.getElementById('bellSound');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'playSound') {
    // Set volume (0.0 to 1.0)
    audio.volume = message.volume !== undefined ? message.volume : 0.5;
    
    audio.currentTime = 0;
    audio.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  }
});