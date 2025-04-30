export function drawCharacterImportanceChart(data) {
  const svg = d3.select("#importanceChart");
  svg.selectAll("*").remove();

  // Custom colors for main characters
  const characterColors = {
    Aang: "#ff7f0e",
    Katara: "#9467bd",
    Sokka: "#1f77b4",
    Toph: "#2ca02c",
    Iroh: "#8c564b",
    Zuko: "#d62728"
  };

  // Fallback D3 color scheme
  const fallbackColor = d3.scaleOrdinal(d3.schemeTableau10);

  // Chart dimensions
  svg.attr("width", 1200).attr("height", 400);
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 80, right: 20, bottom: 80, left: 80 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const x = d3.scaleBand()
    .domain(data.map(d => d.character))
    .range([0, chartWidth])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.wordCount)])
    .nice()
    .range([chartHeight, 0]);

  const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Y axis
  chart.append("g")
    .call(d3.axisLeft(y))
    .selectAll("text")
    .style("fill", "white")
    .style("font-size", "16px");

  // X axis
  chart.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-30)")
    .style("text-anchor", "end")
    .style("fill", "white")
    .style("font-size", "16px");

  // Title
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .style("font-size", "25px")
    .style("fill", "white")
    .style("font-weight", "bold")
    .text("Character Importance by Word Count");

  // Description
  const desc = svg.append("text")
    .attr("x", width / 2)
    .attr("y", 55)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("fill", "#ccc");

  desc.append("tspan")
    .attr("x", width / 2)
    .attr("dy", "1em")
    .text("This chart shows how much each main or recurring character speaks across the entire show or selected season ");

  desc.append("tspan")
    .attr("x", width / 2)
    .attr("dy", "1.2em")
    .text("(measured by word count). Hover over each bar for detailed information.");

  // Y axis label
  svg.append("text")
    .attr("transform", `rotate(-90)`)
    .attr("x", -height / 2)
    .attr("y", 10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "white")
    .text("Total Words Spoken");

  // X axis label
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("fill", "white")
    .text("Character");

  // Tooltip
  const tooltip = d3.select("#tooltip");
  if (tooltip.empty()) {
    d3.select("body").append("div")
      .attr("id", "tooltip")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("pointer-events", "none")
      .style("background", "white")
      .style("color", "black")
      .style("border", "1px solid #ccc")
      .style("padding", "8px")
      .style("border-radius", "5px")
      .style("font-family", "sans-serif")
      .style("font-size", "12px");
  }

  const tip = d3.select("#tooltip");

  // Bars
  chart.selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => x(d.character))
    .attr("y", d => y(d.wordCount))
    .attr("width", x.bandwidth())
    .attr("height", d => chartHeight - y(d.wordCount))
    .attr("fill", d => characterColors[d.character] || fallbackColor(d.character))
    .on("mouseover", (event, d) => {
      tip.transition().duration(200).style("opacity", 0.95);
      tip.html(`<strong>${d.character}</strong><br>Words: ${d.wordCount}<br>Episodes: ${d.episodesAppeared}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
    })
    .on("mouseout", () => {
      tip.transition().duration(500).style("opacity", 0);
    });

  // Dropdown styling
  d3.select("#importance-select")
    .style("background", "rgba(255, 255, 255, 0.6)")
    .style("color", "black")
    .style("border", "1px solid rgba(142, 141, 141, 0.3)")
    .style("padding", "6px 10px")
    .style("border-radius", "6px")
    .style("font-size", "15px")
    .style("margin-left", "10px")
    .style("backdrop-filter", "blur(4px)");
}
