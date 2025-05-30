document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('bellToggle');
  const status = document.getElementById('status');
  const volumeSlider = document.getElementById('volumeSlider');
  const volumeValue = document.getElementById('volumeValue');
  const timeRadios = document.querySelectorAll('input[name="bellTime"]');

  // Load saved state
  chrome.storage.sync.get(['bellEnabled', 'bellVolume', 'bellInterval'], function(result) {
    const isEnabled = result.bellEnabled || false;
    const volume = result.bellVolume !== undefined ? result.bellVolume : 50;
    const interval = result.bellInterval || 5;
    
    toggle.checked = isEnabled;
    volumeSlider.value = volume;
    
    // Set the correct time radio button
    const timeRadio = document.querySelector(`input[name="bellTime"][value="${interval}"]`);
    if (timeRadio) {
      timeRadio.checked = true;
    }
    
    updateStatus(isEnabled);
    updateVolumeDisplay(volume);
    updateSliderTrack(volume);
  });

  // Handle toggle change
  toggle.addEventListener('change', function() {
    const isEnabled = toggle.checked;
    
    // Save state
    chrome.storage.sync.set({ bellEnabled: isEnabled });
    
    // Update status
    updateStatus(isEnabled);
    
    // Send message to background script
    chrome.runtime.sendMessage({
      action: isEnabled ? 'start' : 'stop'
    });
  });

  // Handle time interval change
  timeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.checked) {
        const interval = parseInt(this.value);
        
        // Save interval setting
        chrome.storage.sync.set({ bellInterval: interval });
        
        // Send interval to background script
        chrome.runtime.sendMessage({
          action: 'setInterval',
          interval: interval
        });
        
        // Restart timer if currently active
        if (toggle.checked) {
          chrome.runtime.sendMessage({ action: 'restart' });
        }
      }
    });
  });

  // Handle volume change
  volumeSlider.addEventListener('input', function() {
    const volume = parseInt(volumeSlider.value);
    updateVolumeDisplay(volume);
    updateSliderTrack(volume);
    
    // Save volume setting
    chrome.storage.sync.set({ bellVolume: volume });
    
    // Send volume to background script
    chrome.runtime.sendMessage({
      action: 'setVolume',
      volume: volume / 100
    });
  });

  function updateStatus(isEnabled) {
    if (isEnabled) {
      status.textContent = 'Active';
      status.className = 'status active';
    } else {
      status.textContent = 'Inactive';
      status.className = 'status inactive';
    }
  }

  function updateVolumeDisplay(volume) {
    volumeValue.textContent = volume + '%';
  }

  function updateSliderTrack(volume) {
    volumeSlider.style.setProperty('--value', volume + '%');
  }
});