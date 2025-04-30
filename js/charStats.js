document.addEventListener("DOMContentLoaded", () => {
  // Element to image mapping
  const elementImages = {
    Waterbender: "water.png",
    Firebender: "fire.png",
    Earthbender: "earth.png",
    Avatar: "avatar-nations.png",
    "Non-bender": "boom.png",
  };

  // DOM elements
  const faces = document.querySelectorAll(".charFace");
  const charCard = document.getElementById("charCard");
  const elementDiv = document.getElementById("element");

  // Character data
  const characterStats = {
    Aang: {
      episodes: 61,
      spoken_percent: 18.23,
      first_appearance: "Season 1 Ep 1: The Boy in the Iceberg",
      bender: "Avatar",
      link: "https://avatar.fandom.com/wiki/Aang",
    },
    Katara: {
      episodes: 59,
      spoken_percent: 14.35,
      first_appearance: "Season 1 Ep 1: The Boy in the Iceberg",
      bender: "Waterbender",
      link: "https://avatar.fandom.com/wiki/katara",
    },
    Sokka: {
      episodes: 59,
      spoken_percent: 16.45,
      first_appearance: "Season 1 Ep 1: The Boy in the Iceberg",
      bender: "Non-bender",
      link: "https://avatar.fandom.com/wiki/sokka",
    },
    Toph: {
      episodes: 35,
      spoken_percent: 5.19,
      first_appearance: "Season 2 Ep 6: The Blind Bandit",
      bender: "Earthbender",
      link: "https://avatar.fandom.com/wiki/toph",
    },
    Zuko: {
      episodes: 46,
      spoken_percent: 7.65,
      first_appearance: "Season 1 Ep 1: The Boy in the Iceberg",
      bender: "Firebender",
      link: "https://avatar.fandom.com/wiki/zuko",
    },
    Iroh: {
      episodes: 34,
      spoken_percent: 3.22,
      first_appearance: "Season 1 Ep 1: The Boy in the Iceberg",
      bender: "Firebender",
      link: "https://avatar.fandom.com/wiki/iroh",
    },
  };

  // Function to update card content
  const updateCard = (characterName) => {
    const stats = characterStats[characterName];
    const elementImg = elementImages[stats.bender]
      ? `<img src="images/${elementImages[stats.bender]}" class="element-icon">`
      : "";

    charCard.innerHTML = `
          <div id="charStats">
          <div style="display:flex; justify-content: space-between; align-items:center"> 
            <div class="cardName" style="margin: 0; font-size: 4em; color: brown; display:flex; justify-content: space-around; align-items:center; margin-left:2px;">
                ${characterName}
                                <a href="${stats.link}" target="_blank" style="color:brown; font-size:14px; "><span style="font-size:14px">wiki</span></a>

            </div>
            <div id="element" style="width:50px; height:50px;">${elementImg}</div>
          </div>
            
            <div style="color: brown; font-size: 20px">
                <div style="display:flex; justify-content:space-between">
                    <div style="margin: 0px 2px; text-align:left"> Episodes present: ${stats.episodes}</div>
                    <div style="margin:0px;text-align:right"> ${stats.bender}</div>
                </div>
                <div style="margin: 4px 2px">First Seen: ${stats.first_appearance}</div>

                            

            </div>
          </div>
        `;
  };

  // Show Aang initially
  updateCard("aang");

  // Add hover functionality
  faces.forEach((face) => {
    face.addEventListener("mouseenter", () => {
      updateCard(face.dataset.name);
    });
  });
});
