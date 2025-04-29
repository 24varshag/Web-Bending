// Load CSV Data
d3.csv('avatar_transcripts_with_context.csv').then(function(data) {
  // Create a grid (3 rows for 3 seasons, 22 columns for 22 episodes)
  createGrid();

  // Create character buttons only once, if not already present
  if (document.querySelectorAll(".charFace").length === 0) {
    createCharacterButtons();
  }

  // Handle click on character button (for face images)
  document.querySelectorAll(".charFace").forEach(function(button) {
    button.addEventListener("click", function() {
      const character = this.getAttribute("data-character");
      updateGrid(character, data);
    });
  });

  // Handle click on character buttons (for word cloud toggle)
  document.querySelectorAll(".char-btn").forEach(function(button) {
    button.addEventListener("click", function() {
      const character = this.getAttribute("data-character");
      updateGrid(character, data);
    });
  });
});

// Create the 3x22 grid layout
function createGrid() {
  const seasons = ['Season 1', 'Season 2', 'Season 3'];
  const episodes = Array.from({length: 22}, (_, i) => i + 1);  // [1, 2, ..., 22]
  
  const gridContainer = d3.select("#tabf0-1");
  const grid = gridContainer.append("table").attr("id", "episode-chart");
  
  // Create header row with episode numbers
  const headerRow = grid.append("tr").append("th").text("Seasons");
  episodes.forEach(episode => {
    headerRow.append("th").text(episode);
  });
  
  // Create rows for Seasons
  seasons.forEach(season => {
    const row = grid.append("tr");
    row.append("th").text(season);  // Add season name
    episodes.forEach(episode => {
      row.append("td").attr("data-season", season).attr("data-episode", episode).attr("class", "episode-cell");
    });
  });
}

// Create character buttons (faces)
function createCharacterButtons() {
  const characters = ['Aang', 'Katara', 'Sokka', 'Toph', 'Zuko', 'Iroh'];
  const faceContainer = d3.select(".faces");

  characters.forEach(character => {
    faceContainer.append("img")
      .attr("src", `public/${character.toLowerCase()}.png`)
      .attr("class", "charFace")
      .attr("data-character", character);

    // Create buttons dynamically for the "Cloud" section (word cloud toggle)
    const buttonContainer = d3.select("#character-toggle-buttons");
    buttonContainer.append("button")
      .attr("class", "char-btn")
      .attr("data-character", character)
      .text(character);
  });
}

// Function to update the grid based on the clicked character
function updateGrid(character, data) {
  // Filter the data based on the selected character
  const filteredData = data.filter(d => d.Character === character);
  
  // For each record in the filtered data, place a dot in the correct season and episode
  filteredData.forEach(d => {
    const season = `Season ${d.Season}`;
    const episode = d['Episode Number'];

    // Find the corresponding cell in the grid and add a dot
    const cell = d3.select(`td[data-season="${season}"][data-episode="${episode}"]`);
    cell.append("div").attr("class", "dot");
  });
}