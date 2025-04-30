let chordData;
let selectedName = null;

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

d3.json("public/character_interactions.json").then(data => {
    chordData = data;

    populateSeasonDropdown();
    populateEpisodeDropdown("Season 1");

    document.getElementById("season-select").value = "Season 1";
    document.getElementById("episode-select").value = "The Boy in the Iceberg";

    drawChordDiagram("Season 1", "The Boy in the Iceberg");
    drawChart(); 

    document.getElementById("season-select").addEventListener("change", (e) => {
        const selectedSeason = e.target.value;
        populateEpisodeDropdown(selectedSeason);
        drawChordDiagram(selectedSeason, "All");
    });

    document.getElementById("episode-select").addEventListener("change", (e) => {
        const selectedSeason = document.getElementById("season-select").value;
        const selectedEpisode = e.target.value;
        drawChordDiagram(selectedSeason, selectedEpisode);
        drawChart(); 
    });
});

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

function populateEpisodeDropdown(season) {
    const episodeSelect = document.getElementById("episode-select");
    episodeSelect.innerHTML = "";

    const episodes = Object.keys(chordData[season]).sort((a, b) => {
        if (a === "All") return -1;
        if (b === "All") return 1;
        return 0;
    });

    episodes.forEach(ep => {
        const option = document.createElement("option");
        option.value = ep;
        option.text = ep;
        episodeSelect.appendChild(option);
    });

    episodeSelect.value = "All";
}

function drawChordDiagram(season, episode) {
    svg.selectAll("*").remove();
    selectedName = null;

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .style("font-size", "22px")
        .style("fill", "white")
        .style("font-family", "Forum")
        .style("font-weight", "bold")
        .text("Character Interaction Chord Diagram");

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
        matrix[target][source] = link.value;
    });

    const chords = chordLayout(matrix);

    const g = svg.append("g")
        .attr("transform", `translate(${width / 2},${height / 2 + 20})`);

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
            showTooltip(event, `${source} ↔ ${target}: ${matrix[d.source.index][d.target.index]} times`);
        })
        .on("mousemove", moveTooltip)
        .on("mouseout", hideTooltip);

    const group = g.append("g")
        .selectAll("g")
        .data(chords.groups)
        .join("g")
        .on("click", (event, d) => {
            const name = nameByIndex.get(d.index);
            selectedName = selectedName === name ? null : name;

            ribbons
                .style("opacity", r =>
                    !selectedName || nameByIndex.get(r.source.index) === selectedName || nameByIndex.get(r.target.index) === selectedName
                        ? 0.9
                        : 0.1
                );

            group.selectAll("path")
                .style("opacity", g =>
                    !selectedName || nameByIndex.get(g.index) === selectedName ? 1 : 0.2
                );

            group.selectAll("text")
                .style("opacity", g =>
                    !selectedName || nameByIndex.get(g.index) === selectedName ? 1 : 0.2
                );
        });

    group.append("path")
        .attr("fill", d => color(nameByIndex.get(d.index)))
        .attr("stroke", d => d3.rgb(color(nameByIndex.get(d.index))).darker())
        .attr("d", arc);

    group.append("text")
        .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", ".35em")
        .attr("transform", d => {
            const angle = (d.angle * 180 / Math.PI - 90);
            return `rotate(${angle}) translate(${outerRadius + 10}) rotate(90)`;
        })
        .attr("text-anchor", "middle")
        .style("font-weight", "bold")
        .text(d => nameByIndex.get(d.index))
        .style("font-family", "Forum")
        .style("fill", "white")
        .style("font-size", "16px");
}

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
