// Name a vriable to track if generation is in progress
var isGenerating = false;

// When the page loads, check if there's an existing design
window.onload = function() {
  // Fetch the current deisgn from the server
  fetch('/api/current')
    .then(function(response) {
      //tell replicate to return a json response
      return response.json();
    })
    .then(function(data) {
// If there;s a texture URL, show the image
      if (data.textureUrl) {
        showImage(data.textureUrl);
      }
    });
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
