const characters = ["Aang", "Katara", "Sokka", "Toph", "Zuko", "Iroh"];

const colorScale = d3
  .scaleOrdinal()
  .domain(characters)
  .range(["#1f77b4", "#9467bd", "#ff7f0e", "#2ca02c", "#d62728", "#8c564b"]);

let allData = [];

d3.csv("avatar_transcripts_with_context.csv").then((data) => {
  allData = data;

  // Season dropdown
  const seasons = Array.from(new Set(data.map((d) => d.Season))).sort(
    (a, b) => +a - +b
  );
  const seasonSelect = d3.select("#season-select");
  seasonSelect
    .selectAll("option")
    .data(seasons)
    .enter()
    .append("option")
    .text((d) => `Season ${d}`)
    .attr("value", (d) => d);

  seasonSelect.on("change", updateEpisodes);

  // episode list
  updateEpisodes();
});

// Update Episodes dropdown based on Season
function updateEpisodes() {
  const selectedSeason = d3.select("#season-select").property("value");

  const filteredEpisodes = allData.filter((d) => d.Season === selectedSeason);
  const episodes = Array.from(
    new Set(filteredEpisodes.map((d) => d["Episode Title"]))
  );

  const episodeSelect = d3.select("#episode-select");
  episodeSelect.selectAll("option").remove();
  episodeSelect
    .selectAll("option")
    .data(episodes)
    .enter()
    .append("option")
    .text((d) => d)
    .attr("value", (d) => d);

  episodeSelect.on("change", drawChart);

  drawChart();
}

// Draw Chart
function drawChart() {
  const selectedSeason = d3.select("#season-select").property("value");
  const selectedEpisode = d3.select("#episode-select").property("value");

  const episodeData = allData.filter(
    (d) => d.Season === selectedSeason && d["Episode Title"] === selectedEpisode
  );

  // Assign order numbers to dialogues
  episodeData.forEach((d, i) => (d.dialogueOrder = i));

  const totalDialogues = episodeData.length;

  // For each character, find their dialogue percentages
  const characterData = characters.map((character) => {
    const charDialogues = episodeData.filter((d) => d.Character === character);
    const points = charDialogues.map((d) => ({
      x: character,
      y: (d.dialogueOrder / totalDialogues) * 100,
    }));
    return { character, points };
  });

  // Clear previous chart
  d3.select("#chart").html("");

  const width = 800;
  const height = 500;
  const margin = { top: 50, right: 20, bottom: 50, left: 70 };

  const svg = d3
    .select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3
    .scalePoint()
    .domain(characters)
    .range([margin.left, width - margin.right])
    .padding(0.5);

  const yScale = d3
    .scaleLinear()
    .domain([0, 100])
    .range([height - margin.bottom, margin.top]);

  // Draw y-axis (0%-100%) with grid lines
  const yAxis = d3
    .axisLeft(yScale)
    .ticks(10)
    .tickFormat((d) => d + "%")
    .tickSize(-(width - margin.left - margin.right)); // make ticks span horizontally

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .attr("class", "axis")
    .call((g) =>
      g
        .selectAll(".tick line")
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "2,2")
    ); // this makes dashed grid lines

  // x-axis forr  6 characterss
  const xAxis = d3.axisBottom(xScale);
  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .attr("class", "axis");

  // Line generator for each character
  const line = d3
    .line()
    .x((d) => xScale(d.x))
    .y((d) => yScale(d.y))
    .curve(d3.curveMonotoneY);

  // Draw and dots
  characterData.forEach((d) => {
    if (d.points.length > 0) {
      // svg
      //   .append("path")
      //   .datum(d.points)
      //   .attr("fill", "none")
      //   .attr("stroke", colorScale(d.character))
      //   .attr("stroke-width", 2)
      //   .attr("d", line);

      svg
        .selectAll(`.dot-${d.character}`)
        .data(d.points)
        .enter()
        .append("circle")
        .attr("cx", (p) => xScale(p.x))
        .attr("cy", (p) => yScale(p.y))
        .attr("r", 4)
        .attr("fill", colorScale(d.character));
    }
  });
}
