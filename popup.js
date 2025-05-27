document.addEventListener('DOMContentLoaded', function () {
  const toggle = document.getElementById('bellToggle')
  const status = document.getElementById('status')

  // Load saved state
  chrome.storage.sync.get(['bellEnabled'], function (result) {
    const isEnabled = result.bellEnabled || false
    toggle.checked = isEnabled
    updateStatus(isEnabled)
  })

  // Handle toggle change
  toggle.addEventListener('change', function () {
    const isEnabled = toggle.checked

    // Save state
    chrome.storage.sync.set({ bellEnabled: isEnabled })

    // Update status
    updateStatus(isEnabled)

    // Send message to background script
    chrome.runtime.sendMessage({
      action: isEnabled ? 'start' : 'stop',
    })
  })

  function updateStatus(isEnabled) {
    if (isEnabled) {
      status.textContent = 'Active'
      status.className = 'status active'
    } else {
      status.textContent = 'Inactive'
      status.className = 'status inactive'
    }
  }
})
