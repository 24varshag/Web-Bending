// Get the modal
const modal = document.getElementById('myModal');

// Get the button that opens the modal
const btn = document.getElementById('openModalButton');

// Get the <span> element that closes the modal
const span = document.getElementsByClassName('close')[0];

// Get the image button, background, YouTube video container, and info container
const imageButton = document.getElementById('imageButton');
const newButtonLeft = document.getElementById('newButtonLeft');
const newButtonRight = document.getElementById('newButtonRight');
const buttonText = document.getElementById('buttonText');
const videoContainer = document.getElementById('videoContainer');
const infoContainer = document.getElementById('infoContainer');

// When the user clicks the button, open the modal
btn.onclick = function() {
  modal.style.display = 'block';
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = 'none';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}

// When the user clicks the new left button, show the information
newButtonLeft.onclick = function() {
  infoContainer.style.display = 'block'; // Show the info container
  videoContainer.style.display = 'none'; // Hide the video container if it's visible
}

// When the user clicks the new right button, show the information
newButtonRight.onclick = function() {
  infoContainer.style.display = 'block'; // Show the info container
  videoContainer.style.display = 'none'; // Hide the video container if it's visible
}

// When the user clicks the image button, fade out the background and button, and show the YouTube video
imageButton.onclick = function() {
  // Fade out the background to black and hide the button
  modal.classList.add('fade-out-background');
  imageButton.style.display = 'none'; // Hide the image button

  // After the fade-out transition finishes, show the video
  setTimeout(function() {
    // Expand the modal content and show the video
    videoContainer.style.display = 'block'; // Show the video container
  }, 1000); // Wait for the fade-out animation to finish before showing the video
}
