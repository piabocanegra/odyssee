/**
 *   svgClass: tag for svg class, must include the "."
 *   categoryMap: map of short activity keys ("b5") to frequency 
 *   categoryFullMap: map of full activity keys ("Intellectual") to frequency
 *   title: title of graph
 *   personData: list of data entries
 *   returns void, draws data vis for line bar chart
 */
function drawStressorRadialGraph(svgClass, everyoneData, personalityData) {
    let svg = d3.select(svgClass);
    let height = svg.attr("height");
    let width = svg.attr("width");
    console.log(personalityData);
    console.log(everyoneData);

    let circleRadius = 140;

    // Setup scales.
    let radialScale = d3.scaleLinear()
        .domain([0, 3])
        .range([-Math.PI, 0]);

    let center = {
        x: width / 2,
        y: height / 2
    }

    let titleAttr = {
        fontSize: 25,
        fontFamily: "Courier new",
        textAnchor: "middle"
    };

    svg.append("text")
        .attr("x", center.x)
        .attr("y", center.y)
        .text("Stressors")
        .style("font-family", titleAttr.fontFamily)
        .style("font-size", titleAttr.fontSize)
        .style("fill", textColor)
        .style("text-anchor", titleAttr.textAnchor);

    svg.append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("r", circleRadius)

    svg.append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("r", circleRadius * 2)

    svg.append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("r", circleRadius * 3)

    svg.append("text")
        .attr("x", center.x)
        .attr("y", center.y + circleRadius * 2 - 12)
        .text("short-term")
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

    svg.append("text")
        .attr("x", center.x)
        .attr("y", center.y + circleRadius * 3 - 12)
        .text("long-term")
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

}