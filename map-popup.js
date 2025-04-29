const MAP_WIDTH = 3840;
const MAP_HEIGHT = 2160;
let map;
let markerLayers = [];
let characterData = []; // hold character info (NOT markers)
let activeCharacters = new Set([
  "Aang",
  "Katara",
  "Sokka",
  "Toph",
  "Zuko",
  "Iroh",
]);
let currentCharacterMarkers = []; // heads currently shown on map

async function initializeMap() {
  map = L.map("map-container", {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 3,
    zoomSnap: 0.01,
    zoomControl: true,
    maxBounds: [
      [0, 0],
      [MAP_HEIGHT, MAP_WIDTH],
    ],
    maxBoundsViscosity: 1.0,
  });

  const bounds = [
    [0, 0],
    [MAP_HEIGHT, MAP_WIDTH],
  ];
  L.imageOverlay("public/Avatar_world_map.png", bounds).addTo(map);
  map.fitBounds(bounds);

  const response = await fetch("public/avatar_map_data.json");
  const data = await response.json();

  const CATEGORY_COLORS = {
    1: { outer: "#98a4be", inner: "#535f6c" },
    2: { outer: "#8fb768", inner: "#4e6840" },
    3: { outer: "#ce9f88", inner: "#6f5c50" },
    7: { outer: "#fcf6e3", inner: "#85887e" },
  };

  data.markers.forEach((markerData) => {
    const [x, y] = markerData.position;
    const latlng = [y, x];
    const category = CATEGORY_COLORS[markerData.categoryId];
    if (!category) return;

    const customIcon = L.divIcon({
      className: "avatar-marker-wrapper",
      html: `
        <div class="avatar-marker" style="background:${category.outer};">
          <div class="avatar-marker-inner" style="background:${category.inner};"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 24],
      popupAnchor: [0, -24],
    });

    const markerLayer = L.marker(latlng, { icon: customIcon }).bindPopup(`
      <strong>${markerData.popup.title}</strong><br/>
      ${markerData.popup.description}<br/>
      <a href="https://avatar.fandom.com/wiki/${markerData.popup.link.url}" target="_blank">See more</a>
    `);

    markerLayer.categoryId = markerData.categoryId;
    markerLayer.addTo(map);
    markerLayers.push(markerLayer);
  });

  setupFilters();
  await loadCharacterData();
  setupCharacterSelection();
  setupTimeline();
}

function setupFilters() {
  document.getElementById("filter-toggle").addEventListener("click", () => {
    document.getElementById("filter-options").classList.toggle("hidden");
  });

  const allCheckboxes = document.querySelectorAll(
    '#filter-options input[type="checkbox"]:not(#select-all)'
  );
  const selectAll = document.getElementById("select-all");

  selectAll.addEventListener("change", () => {
    const checked = selectAll.checked;
    allCheckboxes.forEach((cb) => (cb.checked = checked));
    triggerFilter();
  });

  allCheckboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      const allChecked = Array.from(allCheckboxes).every((cb) => cb.checked);
      selectAll.checked = allChecked;
      triggerFilter();
    });
  });

  function triggerFilter() {
    const checked = Array.from(allCheckboxes)
      .filter((cb) => cb.checked)
      .map((cb) => parseInt(cb.value));

    markerLayers.forEach((marker) => {
      if (checked.includes(parseInt(marker.categoryId))) {
        marker.addTo(map);
      } else {
        map.removeLayer(marker);
      }
    });
  }
}

async function loadCharacterData() {
  const response = await fetch("public/character_paths.json");
  characterData = await response.json();
}

function moveCharactersToEpisode(targetEpisode) {
  // First, remove existing character heads
  currentCharacterMarkers.forEach((marker) => {
    map.removeLayer(marker);
  });
  currentCharacterMarkers = [];

  // Then, add new ones
  const charIconUrls = {
    Aang: "public/aang.png",
    Katara: "public/katara.png",
    Sokka: "public/sokka.png",
    Toph: "public/toph.png",
    Zuko: "public/zuko.png",
    Iroh: "public/iroh.png",
  };

  characterData.forEach((entry) => {
    if (
      parseInt(entry.episode) === targetEpisode &&
      activeCharacters.has(entry.character)
    ) {
      const [x, y] = entry.position;
      const offsetX = (Math.random() - 0.5) * 40; // medium cluster
      const offsetY = (Math.random() - 0.5) * 40;
      const latlng = [y + offsetY, x + offsetX];

      const characterIcon = L.icon({
        iconUrl: charIconUrls[entry.character],
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker(latlng, {
        icon: characterIcon,
        zIndexOffset: 1000,
      }).bindPopup(`
        <strong>${entry.character}</strong><br/>
        ${entry.popup.description}
      `);

      marker.addTo(map);
      currentCharacterMarkers.push(marker);
    }
  });
}

function setupCharacterSelection() {
  const container = document.getElementById("character-select-menu");
  container.innerHTML = ""; // Clear old content

  const charactersLeft = ["Aang", "Katara", "Sokka"];
  const charactersRight = ["Toph", "Zuko", "Iroh"];

  const chibiIcons = {
    Aang: "public/aang.png",
    Katara: "public/katara.png",
    Sokka: "public/sokka.png",
    Toph: "public/toph.png",
    Zuko: "public/zuko.png",
    Iroh: "public/iroh.png",
  };

  // Select All checkbox
  const selectAllLabel = document.createElement("label");
  selectAllLabel.style.display = "flex";
  selectAllLabel.style.alignItems = "center";
  selectAllLabel.style.gap = "8px";
  selectAllLabel.style.marginBottom = "12px";
  selectAllLabel.innerHTML = `
      <input type="checkbox" id="select-all-characters" checked>
      <strong>Select All</strong>
    `;
  container.appendChild(selectAllLabel);

  // Create a flexbox wrapper for two columns
  const columnsWrapper = document.createElement("div");
  columnsWrapper.style.display = "flex";
  columnsWrapper.style.justifyContent = "space-between";
  columnsWrapper.style.gap = "10px";

  // Left column
  const leftColumn = document.createElement("div");
  leftColumn.style.display = "flex";
  leftColumn.style.flexDirection = "column";
  leftColumn.style.gap = "10px";
  leftColumn.style.paddingLeft = "10px";

  charactersLeft.forEach((character) => {
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "8px";

    label.innerHTML = `
        <input type="checkbox" value="${character}" checked class="character-checkbox">
        <img src="${chibiIcons[character]}" alt="${character}" style="width:50px; height:50px; border-radius:50%;">
        ${character}
      `;
    leftColumn.appendChild(label);
  });

  // Right column
  const rightColumn = document.createElement("div");
  rightColumn.style.display = "flex";
  rightColumn.style.flexDirection = "column";
  rightColumn.style.gap = "10px";
  rightColumn.style.paddingRight = "20px";

  charactersRight.forEach((character) => {
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "8px";

    label.innerHTML = `
        <input type="checkbox" value="${character}" checked class="character-checkbox">
        <img src="${chibiIcons[character]}" alt="${character}" style="width:50px; height:50px; border-radius:50%;">
        ${character}
      `;
    rightColumn.appendChild(label);
  });

  // Append columns to the wrapper
  columnsWrapper.appendChild(leftColumn);
  columnsWrapper.appendChild(rightColumn);

  // Append the wrapper under the Select All
  container.appendChild(columnsWrapper);

  // Event listeners
  const selectAllCharacters = document.getElementById("select-all-characters");
  const characterCheckboxes = container.querySelectorAll(".character-checkbox");

  selectAllCharacters.addEventListener("change", () => {
    const checked = selectAllCharacters.checked;
    characterCheckboxes.forEach((cb) => {
      cb.checked = checked;
      if (checked) {
        activeCharacters.add(cb.value);
      } else {
        activeCharacters.delete(cb.value);
      }
    });
    const currentEpisode = parseInt(
      document.getElementById("episode-slider").value
    );
    moveCharactersToEpisode(currentEpisode);
  });

  characterCheckboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      if (cb.checked) {
        activeCharacters.add(cb.value);
      } else {
        activeCharacters.delete(cb.value);
      }
      const currentEpisode = parseInt(
        document.getElementById("episode-slider").value
      );
      moveCharactersToEpisode(currentEpisode);

      const allChecked = Array.from(characterCheckboxes).every(
        (cb) => cb.checked
      );
      selectAllCharacters.checked = allChecked;
    });
  });
}

function setupTimeline() {
  const slider = document.getElementById("episode-slider");
  const label = document.getElementById("episode-label");

  slider.addEventListener("input", () => {
    const episodeNumber = parseInt(slider.value);
    moveCharactersToEpisode(episodeNumber);
    label.textContent = `Episode: ${episodeNumber}`;
    label.style.color = "black";
  });
}

window.initializeMap = initializeMap;
