// Load CSV Data
d3.csv('avatar_transcripts_with_context.csv').then(function(data) {
    // Create the grid (3 rows for 3 seasons, 22 columns for 22 episodes)
    createGrid();

    // Create character buttons and faces only once if not already present
    if (document.querySelectorAll(".charFace").length === 0) {
      createCharacterButtons();
    }

    // Handle click on character button (for face images)
    document.querySelectorAll(".charFace").forEach(function(button) {
      button.addEventListener("click", function() {
        const character = this.getAttribute("data-character");
        updateGrid(character, data);
        updateWordCloud(character, data); // Update word cloud
      });
    });

    // Handle click on character buttons (for word cloud toggle)
    document.querySelectorAll(".char-btn").forEach(function(button) {
      button.addEventListener("click", function() {
        const character = this.getAttribute("data-character");
        updateGrid(character, data);
        updateWordCloud(character, data); // Update word cloud as well
      });
    });
});

// Create the 3x22 grid layout
function createGrid() {
  const seasons = ['Season 1', 'Season 2', 'Season 3'];
  const episodes = Array.from({ length: 22 }, (_, i) => i + 1);  // [1, 2, ..., 22]

  const gridContainer = d3.select("#episode-chart");

  // Create header row with episode numbers
  const headerRow = gridContainer.append("tr");
  headerRow.append("th"); // Empty cell for the top-left corner
  episodes.forEach(episode => {
    headerRow.append("th").text(episode);
  });

  // Create rows for Seasons
  seasons.forEach(season => {
    const row = gridContainer.append("tr");
    row.append("th").text(season);  // Add season name to the left side
    episodes.forEach(episode => {
      row.append("td").attr("data-season", season).attr("data-episode", episode).attr("class", "episode-cell");
    });
  });
}

// Create character buttons (faces) under the TopCards div
function createCharacterButtons() {
  const characters = ['Aang', 'Katara', 'Sokka', 'Toph', 'Zuko', 'Iroh'];
  const faceContainer = d3.select("#character-toggle-buttons");

  characters.forEach(character => {
    // Add dynamic character buttons with the respective images
    faceContainer.append("button")
      .attr("class", "char-btn")
      .attr("data-character", character)
      .style("background-image", function() {
        return `url(public/${character.toLowerCase()}.png)`; // Set character's face image as background
      })
      .on("click", function() {
        updateGrid(character, data);  // Trigger the grid update when clicked
      });
  });
}

// Function to update the grid based on the clicked character
function updateGrid(character, data) {
  // Clear previous dots
  d3.selectAll(".dot").remove();

  // Filter the data based on the selected character
  const filteredData = data.filter(d => d.Character === character);

  // For each record in the filtered data, place a dot in the correct season and episode
  filteredData.forEach(d => {
    const season = `Season ${d.Season}`;
    const episode = d['Episode Number'];

    // Find the corresponding cell in the grid and add a dot
    const cell = d3.select(`td[data-season="${season}"][data-episode="${episode}"]`);
    cell.append("div").attr("class", "dot")
      .attr("data-character", character)  // Store the character name as data
      .attr("data-episode", episode);    // Store the episode number as data
  });
}

// Tooltip functionality (no need for separate function now)
function showTooltip(event, dialogue) {
  const tooltip = document.getElementById('tooltip');
  tooltip.textContent = dialogue;  // Set the text to the dialogue of the character
  tooltip.style.display = 'block';

  // Position the tooltip near the hovered dot
  tooltip.style.top = `${event.clientY + 10}px`;  // 10px below the mouse pointer
  tooltip.style.left = `${event.clientX + 10}px`;  // 10px to the right of the mouse pointer
}

function hideTooltip() {
  const tooltip = document.getElementById('tooltip');
  tooltip.style.display = 'none';
}

// Adding hover event listeners to dots
d3.selectAll('.dot').on('mouseover', function(event) {
  const character = event.target.getAttribute('data-character');  // Get character from dot data
  const episode = event.target.getAttribute('data-episode'); // Get episode from dot data

  // Directly fetch the dialogue for the character in that episode from the CSV data
  const dialogue = getDialogueFromData(character, episode);

  // Show tooltip with the character's dialogue
  showTooltip(event, dialogue);
}).on('mouseout', hideTooltip);

// Function to get the dialogue for a character in a specific episode (from your data)
function getDialogueFromData(character, episode) {
  // Find the matching data from the CSV for the character and episode
  const dialogueData = data.find(d => d.Character === character && d['Episode Number'] == episode);
  return dialogueData ? dialogueData.Dialogue : "No dialogue available";
}
