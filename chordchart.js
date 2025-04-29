// chordchart.js

let chordData; // Global variable to store JSON data

const svg = d3.select("#chordDiagram")
    .attr("width", 700)
    .attr("height", 700);

const width = +svg.attr("width");
const height = +svg.attr("height");
const outerRadius = Math.min(width, height) * 0.5 - 40;
const innerRadius = outerRadius - 30;

const color = d3.scaleOrdinal()
    .domain(["Aang", "Katara", "Sokka", "Toph", "Iroh", "Zuko"])
    .range(["#ff7f0e", "#9467bd", "#1f77b4", "#2ca02c", "#d62728", "#8c564b"]);

const chordLayout = d3.chord()
    .padAngle(0.05)
    .sortSubgroups(d3.descending);

const arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius);

const ribbon = d3.ribbon()
    .radius(innerRadius);

// Load JSON
d3.json("public/character_interactions.json").then(data => {
    chordData = data;

    populateSeasonDropdown();
    populateEpisodeDropdown("Season 1");

    document.getElementById("season-select").value = "Season 1";
    document.getElementById("episode-select").value = "The Boy in the Iceberg";

    drawChordDiagram("Season 1", "The Boy in the Iceberg");
    drawChart(); // update the dot plot too

    document.getElementById("season-select").addEventListener("change", (e) => {
        const selectedSeason = e.target.value;
        populateEpisodeDropdown(selectedSeason);
        drawChordDiagram(selectedSeason, "All");
    });

    document.getElementById("episode-select").addEventListener("change", (e) => {
        const selectedSeason = document.getElementById("season-select").value;
        const selectedEpisode = e.target.value;
        drawChordDiagram(selectedSeason, selectedEpisode);
        drawChart(); // keep the other chart synced
    });
});


// Populate Seasons
function populateSeasonDropdown() {
    const seasonSelect = document.getElementById("season-select");
    seasonSelect.innerHTML = "";
    Object.keys(chordData).forEach(season => {
        const option = document.createElement("option");
        option.value = season;
        option.text = season;
        seasonSelect.appendChild(option);
    });
}

// Populate Episodes
function populateEpisodeDropdown(season) {
    const episodeSelect = document.getElementById("episode-select");
    episodeSelect.innerHTML = "";

    const episodes = Object.keys(chordData[season]).sort((a, b) => {
        if (a === "All") return -1;
        if (b === "All") return 1;
        return 0; // Keep titles alphabetical by default (or you could custom sort if needed)
    });

    episodes.forEach(ep => {
        const option = document.createElement("option");
        option.value = ep;
        option.text = ep;
        episodeSelect.appendChild(option);
    });

    // Default to "All" if available
    episodeSelect.value = "All";
}

// Draw Chord Diagram
function drawChordDiagram(season, episode) {
    svg.selectAll("*").remove(); // Clear previous drawing

    const data = chordData[season][episode];
    const nodes = data.nodes;
    const links = data.links;

    const indexByName = new Map();
    const nameByIndex = new Map();
    nodes.forEach((d, i) => {
        indexByName.set(d.name, i);
        nameByIndex.set(i, d.name);
    });

    const matrix = Array.from({ length: nodes.length }, () => new Array(nodes.length).fill(0));
    links.forEach(link => {
        const source = indexByName.get(link.source);
        const target = indexByName.get(link.target);
        matrix[source][target] = link.value;
        matrix[target][source] = link.value; // undirected
    });

    const chords = chordLayout(matrix);

    const g = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const ribbons = g.append("g")
        .attr("fill-opacity", 0.7)
        .selectAll("path")
        .data(chords)
        .join("path")
        .attr("d", ribbon)
        .attr("fill", d => color(nameByIndex.get(d.source.index)))
        .attr("stroke", d => d3.rgb(color(nameByIndex.get(d.source.index))).darker())
        .on("mouseover", (event, d) => {
            const source = nameByIndex.get(d.source.index);
            const target = nameByIndex.get(d.target.index);
            const tooltipText = `${source} ↔ ${target}: ${matrix[d.source.index][d.target.index]} times`;
            showTooltip(event, tooltipText);
        })
        .on("mousemove", (event) => {
            moveTooltip(event);
        })
        .on("mouseout", () => {
            hideTooltip();
        });

    const group = g.append("g")
        .selectAll("g")
        .data(chords.groups)
        .join("g");

    group.append("path")
        .attr("fill", d => color(nameByIndex.get(d.index)))
        .attr("stroke", d => d3.rgb(color(nameByIndex.get(d.index))).darker())
        .attr("d", arc);

        group.append("text")
        .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("transform", d => {
            const angle = (d.angle * 180 / Math.PI - 90);
            return `
                rotate(${angle})
                translate(${outerRadius + 10})
                rotate(90)
            `;
        })
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(d => nameByIndex.get(d.index))
        .style("font-family", "Forum")
        .style("fill", "white") // SVG uses 'fill', not 'color'
        .style("font-size", "16px");
    
    
}

// Tooltip functions
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .style("position", "absolute")
    .style("padding", "8px")
    .style("background", "rgba(0, 0, 0, 0.7)")
    .style("color", "white")
    .style("border-radius", "4px")
    .style("pointer-events", "none")
    .style("font-size", "12px");

function showTooltip(event, text) {
    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
    tooltip.html(text)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
}

function moveTooltip(event) {
    tooltip
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
}

function hideTooltip() {
    tooltip.transition()
        .duration(300)
        .style("opacity", 0);
}
