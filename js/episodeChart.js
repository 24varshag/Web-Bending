// episodeChart.js

const characterColors = {
  Aang: "#ff7f0e",
  Katara: "#9467bd",
  Sokka: "#1f77b4",
  Toph: "#2ca02c",
  Iroh: "#8c564b",
  Zuko: "#d62728"
};

fetch("public/main_character_dialogue_by_episode.json")
  .then((res) => res.json())
  .then((data) => {
    const grid = d3.select("#episode-character-grid");

    // Create global tooltip
    const tooltip = d3.select("body").append("div")
    .attr("class", "dot-tooltip")
    .style("position", "absolute")
    .style("padding", "12px 16px")
    .style("background", "white")
    .style("color", "black")
    .style("border", "2px solid #666")
    .style("border-radius", "8px")
    .style("font-size", "16px")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("z-index", 1000)
    .style("box-shadow", "0px 4px 12px rgba(0, 0, 0, 0.2)");
  

    // Group episodes by season
    const seasonMap = new Map();
    data.forEach((ep) => {
      if (!seasonMap.has(ep.season)) seasonMap.set(ep.season, []);
      seasonMap.get(ep.season).push(ep);
    });

    const maxEpisodes = Math.max(...Array.from(seasonMap.values()).map(eps => eps.length));

    // Create table structure
    const table = grid.append("table").attr("class", "episode-table");
    const thead = table.append("thead");
    const headerRow = thead.append("tr");
    headerRow.append("th").text(""); // top-left corner

    for (let i = 1; i <= maxEpisodes; i++) {
      headerRow.append("th").text(`Episode ${i}`);
    }

    const tbody = table.append("tbody");

    seasonMap.forEach((episodes, season) => {
      const row = tbody.append("tr");
      row.append("td").text(`Season ${season}`).style("font-weight", "bold");

      for (let i = 0; i < maxEpisodes; i++) {
        const cell = row.append("td");
        const ep = episodes[i];
        if (!ep) continue;

        const svg = cell.append("svg")
          .attr("width", "100%")
          .attr("height", 60)
          .style("display", "block")
          .style("margin", "auto");

        const max = d3.max(ep.characters, d => d.wordCount);
        const radiusScale = d3.scaleSqrt().domain([0, max]).range([2, 10]);

        svg.selectAll("circle")
          .data(ep.characters)
          .enter()
          .append("circle")
          .attr("cx", (_, i) => 12 + (i % 3) * 18)
          .attr("cy", (_, i) => 18 + Math.floor(i / 3) * 20)
          .attr("r", d => radiusScale(d.wordCount))
          .attr("fill", d => characterColors[d.character])
          .attr("stroke", "white")
          .attr("stroke-width", 1)
          .attr("data-character", d => d.character)
          .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 0.95);
            tooltip.html(
              `<strong>${d.character}</strong><br>
              Words: ${d.wordCount}<br>
              Sentences: ${d.sentenceCount}<br>
              <em>${ep.title}</em>`
            )
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY - 28) + "px");
          })
          .on("mouseout", () => {
            tooltip.transition().duration(300).style("opacity", 0);
          });
      }
    });

    // Add character legend
    const legend = d3.select("#character-legend");

    legend.append("h4")
      .text("Character Legend")
      .style("color", "white")
      .style("margin-bottom", "6px");

    const legendItems = legend.selectAll(".legend-item")
      .data(Object.entries(characterColors))
      .enter()
      .append("div")
      .attr("class", "legend-item")
      .style("display", "inline-flex")
      .style("align-items", "center")
      .style("margin-right", "15px")
      .style("margin-bottom", "6px")
      .style("cursor", "pointer")
      .on("click", (_, [char]) => {
        const isActive = legend.classed(`highlight-${char}`);
        d3.selectAll("#episode-character-grid circle")
          .style("opacity", d => isActive || d.character === char ? 1 : 0.15);
        legend.attr("class", "");
        if (!isActive) legend.classed(`highlight-${char}`, true);
      });

    legendItems.append("div")
      .style("width", "12px")
      .style("height", "12px")
      .style("border-radius", "50%")
      .style("margin-right", "6px")
      .style("background-color", d => d[1]);

    legendItems.append("span")
      .text(d => d[0])
      .style("color", "white")
      .style("font-size", "13px");

    // Add clear highlight button
    legend.append("button")
  .text("Clear Highlight")
  .attr("id", "clear-highlight")
  .style("margin-left", "12px")
  .style("margin-bottom", "12px")
  .style("padding", "6px 14px")
  .style("font-size", "13px")
  .style("border", "1px solid rgba(255,255,255,0.4)")
  .style("background", "rgba(255, 255, 255, 0.08)")
  .style("color", "white")
  .style("border-radius", "6px")
  .style("backdrop-filter", "blur(4px)")
  .style("cursor", "pointer")
  .style("transition", "background 0.3s ease")
  .on("mouseover", function () {
    d3.select(this).style("background", "rgba(255, 255, 255, 0.2)");
  })
  .on("mouseout", function () {
    d3.select(this).style("background", "rgba(255, 255, 255, 0.08)");
  })
  .on("click", () => {
    d3.selectAll("#episode-character-grid circle").style("opacity", 1);
    legend.attr("class", "");
  });

  });
