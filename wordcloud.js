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
    // --- GLOWY BACKGROUND ---
    const defs = svg.append("defs");

    const radialGradient = defs.append("radialGradient")
        .attr("id", "cloudBackgroundGradient")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")
        .attr("fx", "50%")
        .attr("fy", "50%");

    radialGradient.append("stop")
        .attr("offset", "40%")
        .attr("stop-color", "#fff5d4")
        .attr("stop-opacity", 1);

    radialGradient.append("stop")
        .attr("offset", "120%")
        .attr("stop-color", "#132f4a")
        .attr("stop-opacity", 0);

    svg.append("circle")
        .attr("r", Math.min(width, height) / 2)
        .attr("cx", 0)
        .attr("cy", 0)
        .style("fill", "url(#cloudBackgroundGradient)")
        .lower();
    // -----------------------------

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
    
        // Define glow filter
        const defs = svg.append("defs");
    
        const filter = defs.append("filter")
            .attr("id", "glow");
    
        filter.append("feGaussianBlur")
            .attr("stdDeviation", "3.5")
            .attr("result", "coloredBlur");
    
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "coloredBlur");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
    
        // Append a group for each word
        const wordGroups = svg.selectAll("g.word")
            .data(words)
            .enter()
            .append("g")
            .attr("class", "word")
            .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`);
    
        // Inside each group:
        // 1st Layer: blurred glow version
        wordGroups.append("text")
            .text(d => d.text)
            .attr("text-anchor", "middle")
            .style("font-family", "'Forum', cursive") 
            .style("font-size", d => `${d.size}px`)
            .style("fill", function() {
                return d3.hsl(Math.random() * 360, 0.7, 0.3).toString();
            })
            
            .attr("filter", "url(#glow)")
            .attr("opacity", 0.6);
    
        // 2nd Layer: sharp visible text
        wordGroups.append("text")
            .text(d => d.text)
            .attr("text-anchor", "middle")
            .style("font-family", "'Forum', cursive")
            .style("font-size", d => `${d.size}px`)
            .style("fill", function() {
                return d3.schemeCategory10[Math.floor(Math.random() * 10)];
            })
            .style("font-weight", "bold")
            .attr("original-fill", function() {
                return d3.select(this).style("fill");
            });
    
        // Now hover effects on the GROUP, not just the top text
        wordGroups
            .on("mouseover", function(event, d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.text}: ${Math.round(d.size)}`)
                    .style("left", (event.pageX + 10) + "px")
                    .style("top", (event.pageY - 10) + "px");
    
                d3.select(this)
                    .raise() // bring hovered word to front
                    .transition()
                    .duration(200)
                    .attr("transform", function() {
                        const transform = d3.select(this).attr("transform");
                        return transform + " scale(1.3)"; // grow whole group
                    });
    
                d3.select(this).select("text:nth-child(2)") // sharp text only
                    .style("fill", function() {
                        return d3.color(d3.select(this).attr("original-fill")).darker(1.5).toString();
                    })
                    .style("font-weight", "bold");
            })
            .on("mouseout", function(event, d) {
                tooltip.transition()
                    .duration(300)
                    .style("opacity", 0);
    
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`); // reset transform
    
                d3.select(this).select("text:nth-child(2)") // sharp text only
                    .style("fill", function() {
                        return d3.select(this).attr("original-fill");
                    })
                    .style("font-weight", "normal");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 10) + "px")
                        .style("top", (event.pageY - 10) + "px");
            });
    }
    
        
}
