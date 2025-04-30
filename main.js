// main.js
import { createWordCloud } from "./wordcloud.js";
import { initializePhrases } from "./phrases.js";
let selectedCharacters = new Set();
let characterData = {};

window.onload = async () => {
  // on(); // Show overlay
  // setTimeout(slideDoors, 500); // Slide doors after a delay
  characterData = await d3.json("character_top_words.json");
  initializePhrases();
  initializeCharacterButtons();
  createWordCloud("top_global_words.json", "#wordcloud");
};
// Get character selection
function initializeCharacterButtons() {
  d3.selectAll(".char-btn").on("click", function () {
    const character = d3.select(this).attr("data-character");

    if (selectedCharacters.has(character)) {
      selectedCharacters.delete(character);
      d3.select(this).classed("active", false);
    } else {
      selectedCharacters.add(character);
      d3.select(this).classed("active", true);
    }

    updateWordCloud();
  });
}

function updateWordCloud() {
  if (selectedCharacters.size === 0) {
    createWordCloud("top_global_words.json", "#wordcloud");
    return;
  }

  const mergedWords = {};

  selectedCharacters.forEach((character) => {
    const topWords = characterData[character];
    if (topWords) {
      for (const [word, count] of topWords) {
        mergedWords[word] = (mergedWords[word] || 0) + count;
      }
    }
  });

  const mergedData = Object.entries(mergedWords).map(([word, count]) => ({
    text: word,
    value: count,
  }));

  createWordCloud(null, "#wordcloud", mergedData);
}
// Get the modal
const modal = document.getElementById("myModal");

// Get the button that opens the modal
const btn = document.getElementById("openModalButton");

// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

// Get the image button, background, YouTube video container, and info container
const imageButton = document.getElementById("imageButton");
const newButtonLeft = document.getElementById("newButtonLeft");
const newButtonRight = document.getElementById("newButtonRight");
const buttonText = document.getElementById("buttonText");
const videoContainer = document.getElementById("videoContainer");
const infoContainer = document.getElementById("infoContainer");

// When the user clicks the button, open the modal
btn.onclick = function () {
  modal.style.display = "block";
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Function to show the content for the left button
function showLeftContent() {
  // Update the content of infoContainer for the left button
  document.getElementById("leftContent").style.display = "block"; // Show the left content
  document.getElementById("rightContent").style.display = "none"; // Hide the right content
  infoContainer.style.display = "block"; // Show the info container
}

// Function to show the content for the right button
function showRightContent() {
  // Update the content of infoContainer for the right button
  document.getElementById("rightContent").style.display = "block"; // Show the right content
  document.getElementById("leftContent").style.display = "none"; // Hide the left content
  infoContainer.style.display = "block"; // Show the info container
}

// When the user clicks the new left button, show the left button information
newButtonLeft.onclick = function () {
  showLeftContent(); // Call the function to show left content
};

// When the user clicks the new right button, show the right button information
newButtonRight.onclick = function () {
  showRightContent(); // Call the function to show right content
};

// When the user clicks the image button, fade out the background and button, and show the YouTube video
imageButton.onclick = function () {
  // Fade out the background to black and hide the button
  modal.classList.add("fade-out-background");
  imageButton.style.display = "none"; // Hide the image button

  // After the fade-out transition finishes, show the video
  setTimeout(function () {
    // Expand the modal content and show the video
    videoContainer.style.display = "block"; // Show the video container
  }, 1000); // Wait for the fade-out animation to finish before showing the video
};
