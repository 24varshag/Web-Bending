// phrases.js

let phraseData = null;
let selectedSeason = "Season 1";
let selectedEpisode = "All";
let selectedCharacter = "Aang";

const mainCharacters = ["Aang", "Katara", "Sokka", "Toph", "Zuko", "Iroh"];

export async function initializePhrases() {
    phraseData = await d3.json('character_top_phrases.json');

    setupDropdowns();
    updatePhrasesGraph();
}

function setupDropdowns() {
    const controls = d3.select("#phrases-controls");
    controls.html(""); // Clear previous

    controls.append("label").text("Season: ").style("margin-right", "5px");

    const seasonDropdown = controls.append("select")
        .attr("id", "seasonDropdownPhrases")
        .style("margin-right", "20px")
        .on("change", function() {
            selectedSeason = this.value;
            selectedEpisode = "All";
            updateEpisodeDropdown();
            updatePhrasesGraph();
        });

    seasonDropdown.selectAll("option")
        .data(["Season 1", "Season 2", "Season 3"])
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);

    controls.append("label").text("Episode: ").style("margin-right", "5px");

    controls.append("select")
        .attr("id", "episodeDropdownPhrases")
        .style("margin-right", "20px")
        .on("change", function() {
            selectedEpisode = this.value;
            updatePhrasesGraph();
        });

    updateEpisodeDropdown();

    controls.append("label").text("Character: ").style("margin-right", "5px");

    const charDropdown = controls.append("select")
        .attr("id", "characterDropdownPhrases")
        .on("change", function() {
            selectedCharacter = this.value;
            updatePhrasesGraph();
        });

    charDropdown.selectAll("option")
        .data(mainCharacters)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d);
}

function updateEpisodeDropdown() {
    const episodeDropdown = d3.select("#episodeDropdownPhrases");
    episodeDropdown.selectAll("option").remove();

    const episodesPerSeason = {
        "Season 1": 20,
        "Season 2": 20,
        "Season 3": 21
    };

    const episodeOptions = ["All"];
    for (let i = 1; i <= episodesPerSeason[selectedSeason]; i++) {
        episodeOptions.push(i.toString());
    }

    episodeDropdown.selectAll("option")
        .data(episodeOptions)
        .enter()
        .append("option")
        .attr("value", d => d)
        .text(d => d === "All" ? "All Episodes" : `Episode ${d}`);

    selectedEpisode = "All"; // Reset
}

function updatePhrasesGraph() {
    const width = 800;
    const height = 600;
    const fadeDuration = 1000;

    const svg = d3.select("#phrases-chart").select("svg");

    if (!svg.empty()) {
        svg.transition()
            .duration(fadeDuration)
            .style("opacity", 0)
            .remove();
    }

    setTimeout(() => { 
        // Only start building after waiting!

        const newSvg = d3.select("#phrases-chart")
            .append("svg")
            .attr("width", width)
            .attr("height", height)
            .style("opacity", 0); // Start invisible

        const fullKey = selectedEpisode === "All" ? selectedSeason : `${selectedSeason} - Episode ${selectedEpisode}`;

        let phrases = (phraseData[selectedCharacter] && phraseData[selectedCharacter][fullKey]) || [];

        if (!phrases.length && selectedEpisode !== "All") {
            phrases = (phraseData[selectedCharacter][selectedSeason]) || [];
        }

        phrases = phrases.slice(0, 20); // Top 20 phrases

        const radiusScale = d3.scaleSqrt()
            .domain([0, d3.max(phrases, d => d[1]) || 1])
            .range([15, 60]);

        const colorScale = d3.scaleOrdinal(d3.schemeSet2);

        const nodes = phrases.map((d, i) => ({
            id: i,
            text: d[0],
            value: d[1],
            radius: radiusScale(d[1]),
            color: colorScale(i)
        }));

        const simulation = d3.forceSimulation(nodes)
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("charge", d3.forceManyBody().strength(0))
            .force("collision", d3.forceCollide().radius(d => d.radius + 6))
            .alphaDecay(0.13)
            .on("tick", ticked);

        const node = newSvg.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .style("opacity", 0); // Start invisible

        // Tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px 10px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("font-size", "14px");

        // Glowy filter
        const defs = newSvg.append("defs");
        const filter = defs.append("filter").attr("id", "glow");
        filter.append("feGaussianBlur").attr("stdDeviation", "3.5").attr("result", "coloredBlur");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");

        node.append("circle")
            .attr("r", d => d.radius)
            .attr("fill", d => d.color)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 3)
            .style("filter", "url(#glow)")
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`<strong>${d.text}</strong><br>Used: ${d.value} times`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 20) + "px");

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 4)
                    .attr("fill", d3.color(d.color).brighter(1.5));
            })
            .on("mouseout", function(event, d) {
                tooltip.transition()
                    .duration(300)
                    .style("opacity", 0);

                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("stroke-width", 2)
                    .attr("fill", d.color);
            });

        node.append("text")
            .each(function(d) {
                const words = d.text.split(" ");
                const g = d3.select(this);
                if (words.length <= 3) {
                    g.append("tspan")
                        .attr("x", 0)
                        .attr("y", 0)
                        .text(d.text);
                } else {
                    const firstLine = words.slice(0, Math.ceil(words.length / 2)).join(" ");
                    const secondLine = words.slice(Math.ceil(words.length / 2)).join(" ");
                    g.append("tspan")
                        .attr("x", 0)
                        .attr("y", "-0.6em")
                        .text(firstLine);
                    g.append("tspan")
                        .attr("x", 0)
                        .attr("y", "0.9em")
                        .text(secondLine);
                }
            })
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .style("font-weight", "bold")
            .style("font-family", "'Forum', cursive")
            .style("fill", "white")
            .style("pointer-events", "none");

        function ticked() {
            node.attr("transform", d => `translate(${d.x},${d.y})`);
        }

        // Fade in nicely
        newSvg.transition()
            .duration(fadeDuration)
            .style("opacity", 1);

        node.transition()
            .delay((d, i) => i * 50)
            .duration(600)
            .style("opacity", 1);

    }, fadeDuration - 10);  // Wait for old fadeout to finish but with a smallll minus to duration 
                            // (so that the parent folder doesn't collapse on itself during the time that there is NO SVG at all)
}
