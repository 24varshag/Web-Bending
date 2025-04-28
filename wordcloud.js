// wordcloud.js

export async function createWordCloud(jsonPath, svgSelector) {
    const data = await d3.json(jsonPath);

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
        svg.selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", d => `${d.size}px`)
            .style("fill", () => d3.schemeCategory10[Math.floor(Math.random() * 10)])
            .attr("text-anchor", "middle")
            .attr("transform", d => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
            .text(d => d.text);
    }
}
