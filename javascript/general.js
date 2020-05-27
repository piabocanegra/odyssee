// General drawing functions.

function drawTitle(svg, title) {
    let titleAttr = {
        x: width / 2,
        y: 35,
        fontSize: 25,
        fontFamily: "Courier new",
        textAnchor: "middle"
    };

    svg.append('text')
        .attr('x', titleAttr.x)
        .attr('y', titleAttr.y)
        .text(title)
        .style("font-family", titleAttr.fontFamily)
        .style("font-size", titleAttr.fontSize)
        .style("fill", textColor)
        .style("text-anchor", titleAttr.textAnchor);
}

function drawMoodLegendData(moodLegend) {
    let width = moodLegend.attr("width");
    if (width == null) {
        console.error("drawMoodLegendData: must specify width for moodLegend.")
    }
    let xScale = d3.scaleLinear()
        .domain([0, moodList.length - 1])
        .range([0, width]);

    moodLegend.selectAll(".moodDots")
        .data(moodList)
        .enter()
        .append('circle')
        .attr("cx", function(d, i) { return xScale(i); })
        .attr("cy", padding * 1)
        .attr("r", 5)
        .style("fill", function(d) { return colorHexArray[d]; });
    moodLegend.selectAll(".moodText")
        .data(moodList)
        .enter()
        .append('text')
        .attr("x", function(d, i) { return xScale(i); })
        .attr("y", padding * 1.65)
        .text(function(d) { return d; })
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);
}

function drawMoodLegend(svgClass) {
    let svg = d3.select(svgClass)
    let height = svg.attr('height')

    let moodLegendAttr = {
        x: padding * 2,
        y: height - padding * 2.5,
        width: padding * 1.75 * (moodList.length - 1)
    }
    let moodLegend = svg.append("g")
        .attr("class", "moodLegend")
        .attr("width", moodLegendAttr.width)
        .attr("transform", "translate(" + moodLegendAttr.x + "," + moodLegendAttr.y + ")");

    moodLegend.append("text")
        .attr("x", moodLegendAttr.width / 2)
        .attr("y", 15)
        .text("Average mood")
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

    drawMoodLegendData(moodLegend);
}

function drawAttitudeLegendData(attitudeLegend) {
    let width = attitudeLegend.attr("width");
    if (width == null) {
        console.error("drawAttitudeLegendData: must specify width for attitudeLegend.")
    }
    let xScale = d3.scaleLinear()
        .domain([0, attitudeList.length - 1])
        .range([0, width]);

    attitudeLegend.selectAll(".attText")
        .data(attitudeList)
        .enter()
        .append('text')
        .attr("x", function(d, i) { return xScale(i); })
        .attr("y", padding * 1.65)
        .text(function(d) { return d; })
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);
    attitudeLegend.selectAll(".attLine")
        .data(attitudeList)
        .enter()
        .append('line')
        .attr("x1", function(d, i) { return xScale(i); })
        .attr("x2", function(d, i) { return xScale(i); })
        .attr("y1", padding * 1.2)
        .attr("y2", 35)
        .attr("stroke", textColor)
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-dasharray", function(d, i) { return dashArray2[i]; });
}

function drawAttitudeLegend(svgClass) {
    let svg = d3.select(svgClass)
    let height = svg.attr('height')
    let width = svg.attr('width')
    let attitudeLegendAttr = {
        x: width / 2 + padding * 2,
        y: height - padding * 2.5,
        width: width - (width / 2 + padding * 2) - (padding * 2)
    }
    let attitudeLegendStart = width / 2 + padding * 2
    let attitudeLegend = svg.append("g")
        .attr("class", "attitudeLegend")
        .attr("width", attitudeLegendAttr.width)
        .attr("transform", "translate(" + attitudeLegendAttr.x + "," + attitudeLegendAttr.y + ")");

    attitudeLegend.append("text")
        .attr("x", attitudeLegendAttr.width / 2)
        .attr("y", 15)
        .text("Most frequent attitude")
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("fill", textColor)
        .style("font-size", 12);

    drawAttitudeLegendData(attitudeLegend);
}