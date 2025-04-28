// wordcloud.js

export async function createWordCloud(jsonPath, svgSelector, externalData = null) {
    const data = externalData ? externalData : await d3.json(jsonPath);

    const width = 800;
    const height = 600;

    const svg = d3.select(svgSelector)
        .attr("width", width)
        .attr("height", height)
        .html("") // Clear previous words
        .append("g")
        .attr("transform", `translate(${width/2},${height/2})`);

    const fontSizeScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value)])
        .range([15, 80]);

    d3.layout.cloud()
        .size([width, height])
        .words(data.map(d => ({ text: d.text, size: fontSizeScale(d.value) })))
        .padding(5)
        .rotate(() => ~~(Math.random() * 2) * 90)
        .fontSize(d => d.size)
        .on("end", draw)
        .start();

    function draw(words) {
        const tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid #ccc")
            .style("padding", "5px 10px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("font-size", "14px");

        svg.selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => `${d.size}px`)
            .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
            .text(d => d.text)
        
            // Stores original text color
            .attr("original-fill", function()
            {
                return d3.select(this).style("fill");
            })
        
            // Hover effects:
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.text}: ${Math.round(d.size)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
        
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("font-size", d => `${d.size * 1.3}px`)
                    .style("fill", function()
                    {
                        return d3.color(d3.select(this).attr("original-fill")).darker(1.5).toString();
                    })
                    .style("font-weight", "bold");
            })
            .on("mouseout", function() {
                tooltip.transition()
                    .duration(300)
                    .style("opacity", 0);
        
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style("font-size", d => `${d.size}px`)
                    .style("fill", function()
                    {
                        return d3.select(this).attr("original-fill"); // <-- why I keep the original color lol
                    })
                    .style("font-weight", "normal");
            })
            .on("mousemove", function(event)
            {
                tooltip.style("left", (event.pageX + 10) + "px")
                       .style("top", (event.pageY - 10) + "px");
            }
        );
    }   
}
