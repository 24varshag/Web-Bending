// main.js


import { createWordCloud } from "./wordcloud.js";
import { initializePhrases } from "./phrases.js";
const mainCharacters = ["Aang", "Katara", "Sokka", "Toph", "Zuko", "Iroh"];
window.selectedCharacters = new Set();
window.selectedCharacter = "Aang";
window.currentTab = "tabf0-1";
let characterData = null;
let lastWordCloudData = null;


window.onload = async () => {
  //on(); // Show overlay
  //setTimeout(slideDoors, 500); // Slide doors after a delay

  characterData = await d3.json("character_top_words.json");
  window.selectedCharacters = new Set(["Aang", "Katara", "Sokka", "Toph", "Zuko", "Iroh"]);
  window.selectedCharacter = "Aang";
  window.currentTab = "tabf0-1";

  initializePhrases();
  initializeCharacterFaces();
  updateWordCloud();
  window.updateCard = updateCard;
  // Set glow for default tab
  setGlowForTab("tabf0-1");
};

let phrasesCooldown = false;

function initializeCharacterFaces() {
  d3.selectAll(".charFace").on("click", function () {
    const character = d3.select(this).attr("data-character");
    const face = this;

    switch (currentTab) {
      case "tabf0-2": // Phrases (single-select)
        if (phrasesCooldown) return;

        phrasesCooldown = true;
        setTimeout(() => (phrasesCooldown = false), 1244);

        window.selectedCharacter = character;
        selectedCharacters = new Set([character]);

        d3.selectAll(".charFace").each(function () {
          const char = d3.select(this).attr("data-character");
          d3.select(this)
            .classed("active", char === character)
            .classed("glow", char === character)
            .classed(char, char === character); // character-specific class
        });

        updateCharacterDropdownForPhrases(character);
        updatePhrasesGraph();
        break;

      case "tabf0-3": // Cloud (multi-select)
        if (selectedCharacters.has(character)) {
          selectedCharacters.delete(character);
        } else {
          selectedCharacters.add(character);
        }

        // Failsafe: if all deselected, reselect all
        if (selectedCharacters.size === 0) {
          selectedCharacters = new Set(["Aang", "Katara", "Sokka", "Toph", "Zuko", "Iroh"]);
        }

        d3.selectAll(".charFace").each(function () {
          const char = d3.select(this).attr("data-character");
          const isActive = selectedCharacters.has(char);
          d3.select(this)
            .classed("active", isActive)
            .classed("glow", isActive)
            .classed(char, isActive); // apply character class when glowing
        });

        updateWordCloud();
        break;

      case "tabf0-4": // Map (multi-select)
        if (selectedCharacters.has(character)) {
          selectedCharacters.delete(character);
        } else {
          selectedCharacters.add(character);
        }

        d3.selectAll(".charFace").each(function () {
          const char = d3.select(this).attr("data-character");
          const isActive = selectedCharacters.has(char);
          d3.select(this)
            .classed("active", isActive)
            .classed("glow", isActive)
            .classed(char, isActive);
        });

        updateMapCharacters(character);
        break;

      case "tabf0-5": // Network
        // Do nothing
        break;
    }
  });
}


function setGlowForTab(tabId) {
  const allFaces = document.querySelectorAll(".charFace");
  allFaces.forEach(f => f.classList.remove("glow", "active"));

  switch (tabId) {
    case "tabf0-1": // Episodes
    case "tabf0-3":
      // Only apply glow for characters currently in selectedCharacters
      allFaces.forEach(f => {
        const charName = f.getAttribute("data-character");
        if (selectedCharacters.has(charName)) {
          f.classList.add("glow", "active");
        } else {
          f.classList.remove("glow", "active");
        }
      });
      break;

    case "tabf0-4": // Map

      allFaces.forEach(f => f.classList.add("glow", "active"));
      break;

    case "tabf0-5": // Network — force all faces on regardless of selection
    allFaces.forEach(f => {
      const charName = f.getAttribute("data-character");
      if (selectedCharacters && selectedCharacters.has(charName)) {
        f.classList.add("glow", "active");
      }
    });
    break;
    case "tabf0-2": // Phrases
      const aangFace = document.querySelector('.charFace[data-character="Aang"]');
      if (aangFace) aangFace.classList.add("glow", "active");
      break;
  }
}


function updateNetworkDiagram(character) {
  console.log(`Network update triggered for ${character}`);
  // Add your chord diagram update logic here.
}

function updateCharacterDropdownForPhrases(character) {
  const dropdown = d3.select("#characterDropdownPhrases");
  if (!dropdown.empty()) dropdown.property("value", character);
}

function updateWordCloud() {
  if (selectedCharacters.size === 0) {
    if (lastWordCloudData !== "global") {
      createWordCloud("top_global_words.json", "#wordcloud");
      lastWordCloudData = "global";
    }
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

  // Only update if it's new
  const newDataKey = JSON.stringify(mergedData);
  if (newDataKey === lastWordCloudData) return;

  lastWordCloudData = newDataKey;
  console.log("Word Cloud Data:", mergedData); // You can keep this
  createWordCloud(null, "#wordcloud", mergedData);
}
window.updateWordCloud = updateWordCloud;

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
export { updateWordCloud };
