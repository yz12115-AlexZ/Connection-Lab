// Name a vriable to track if generation is in progress
var isGenerating = false;
// Variable to store the currently selected design for download
var currentSelectedDesign = null;
// Establish Socket.IO connection for real-time updates
var socket = io();
// Listen for new designs from the server (real-time sync)
socket.on('newDesign', function(design) {
  loadHistory();
});
// When the page loads, check if there's an existing design
window.onload = function() {
  // Load all design history
  loadHistory();
};
// When click the start button, call generate function
document.getElementById('generateBtn').onclick = function() {
  generate();
};
// Enable pressing Enter key to start generation
document.getElementById('promptInput').onkeydown = function(e) {
  if (e.key === 'Enter') {
    generate();
  }
};
// When user clicks a color button to choose phone case color
var colorButtons = document.querySelectorAll('.color-btn');
for (var i = 0; i < colorButtons.length; i++) {
  colorButtons[i].onclick = function() {
    // Remove active class from all buttons
    for (var j = 0; j < colorButtons.length; j++) {
      colorButtons[j].classList.remove('active');
    }
    // Add active class to clicked button
    this.classList.add('active');

    // Get the case filename from data-case attribute
    var selectedCase = this.getAttribute('data-case');
    // Change the phone case image
    document.getElementById('caseImg').src = selectedCase;
  };
}

// When user clicks the download button
document.getElementById('downloadBtn').onclick = function() {
  // Check if we have a design selected
  if (!currentSelectedDesign) {
    showMessage('Please select a design from history first', 'error');
    return;
  }

  // Download the image
  downloadImage(currentSelectedDesign.textureUrl, currentSelectedDesign.prompt);
};
// Main function to generate the phone case design
function generate() {
  // Get the text from input box and remove extra spaces
  var prompt = document.getElementById('promptInput').value.trim();
  // If prompt is empty, show error and stop
  if (prompt === '') {
    showMessage('Enter prompt', 'error');
    return;
  }
// If there's already a generation in progress, do nothing
  if (isGenerating) {
    return;
  }
// Set the isgenerating is true and disable the button
  isGenerating = true;
  document.getElementById('generateBtn').disabled = true;
  showMessage('Generating... Please wait 30-60 seconds... Prompt: ' + prompt, 'info');

  // Send request to server to generate the design
  fetch('/api/generate', {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ prompt: prompt }) 
  })
  .then(function(response) {
    // Get the response from server and convert to JSON
    return response.json();
  })
  .then(function(data) {
    // When generation is done, enable the button again
    isGenerating = false;
    document.getElementById('generateBtn').disabled = false;

    // Check if we got a texture image URL
    if (data.textureUrl) {
      showImage(data.textureUrl);
      showMessage('Generation completed! Prompt: ' + data.prompt, 'success');
      // Reload history to show the new design
      loadHistory();
    } else if (data.error) {
      // If there's an error, show it to user
      showMessage(data.error, 'error');
    }
  })
}

// This function displays the generated texture on the phone case
function showImage(url) {
  // Set the image source to the URL we got from server
  document.getElementById('textureImg').src = url;
  // Make the texture visible
  document.getElementById('textureImg').classList.add('visible');
  // Hide the "No design" text
  document.getElementById('emptyState').classList.add('hidden');
}
// This function shows status messages to the user
function showMessage(message, type) {
  var statusDiv = document.getElementById('statusMessage');
  statusDiv.textContent = message;
  statusDiv.className = 'status-message visible ' + type;
  // After 5 seconds, hide the message automatically
  setTimeout(function() {
    statusDiv.classList.remove('visible');
  }, 5000);
}

// Load all designs from database and show them in history list
function loadHistory() {
  fetch('/api/designs')
    .then(function(response) {
      return response.json();
    })
    .then(function(designs) {
      // Show all designs in the history list
      displayHistory(designs);
    });
}

// Display the history list on the page
function displayHistory(designs) {
  var historyList = document.getElementById('historyList');
  // Clear the list first
  historyList.innerHTML = '';

  // If no designs, show a message
  if (designs.length === 0) {
    historyList.innerHTML = '<p style="text-align: center; color: #999;">No history yet</p>';
    return;
  }

  // Loop through all designs and create a box for each one
  for (var i = 0; i < designs.length; i++) {
    var design = designs[i];

    // Create a div for this design
    var item = document.createElement('div');
    item.className = 'history-item';

    // Add image preview
    var img = document.createElement('img');
    img.className = 'history-item-preview';
    img.src = design.textureUrl;
    item.appendChild(img);

    // Add prompt text
    var promptText = document.createElement('div');
    promptText.className = 'history-item-prompt';
    promptText.textContent = design.prompt;
    item.appendChild(promptText);

    // Add time
    var timeText = document.createElement('div');
    timeText.className = 'history-item-time';
    timeText.textContent = formatTime(design.timestamp);
    item.appendChild(timeText);

    // When click on this item, show the design
    item.onclick = createClickHandler(design);

    // Add to the list
    historyList.appendChild(item);
  }
}

// Create a click handler for each history item
function createClickHandler(design) {
  return function() {
    showImage(design.textureUrl);
    showMessage('Showing design: ' + design.prompt, 'info');

    // Save the selected design so we can download it
    currentSelectedDesign = design;
    // Enable the download button
    document.getElementById('downloadBtn').disabled = false;
  };
}

// Convert timestamp to readable time
function formatTime(timestamp) {
  var date = new Date(timestamp);
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hours = date.getHours();
  var minutes = date.getMinutes();
  return month + '/' + day + ' ' + hours + ':' + minutes;
}

// Function to download an image
function downloadImage(imageUrl, prompt) {
  showMessage('Preparing download...', 'info');

  // First, fetch the image from the URL
  fetch(imageUrl)
    .then(function(response) {
      // Convert the response to a blob (binary data)
      return response.blob();
    })
    .then(function(blob) {
      // Create a temporary URL for the blob
      var url = URL.createObjectURL(blob);

      // Create a temporary link element
      var link = document.createElement('a');
      link.href = url;
      // Set the download filename (use prompt as filename)
      link.download = 'phonecase-' + prompt + '.png';
      // Add the link to the page
      document.body.appendChild(link);
      // Click the link to trigger download
      link.click();
      // Remove the link from the page
      document.body.removeChild(link);

      showMessage('Download complete: ' + prompt, 'success');
    })
    .catch(function(error) {
      // If download fails, show error message
      showMessage('Download failed. Please try again.', 'error');
    });
}
