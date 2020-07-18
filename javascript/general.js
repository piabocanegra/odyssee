// General drawing functions.

function drawTitle(svg, title) {
    let width = svg.attr("width");
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

function drawText(svg, text, attr) {
    let x = attr.x == null ? 0 : attr.x;
    let y = attr.y == null ? 0 : attr.y;
    let textAnchor = attr.textAnchor == null ? 'middle' : attr.textAnchor;
    let alignmentBaseline = attr.alignmentBaseline == null ? 'middle' : attr.alignmentBaseline;
    let fontSize = attr.fontSize == null ? 12 : attr.fontSize;
    let transform = attr.transform == null ? '' : attr.transform;
    let fill = attr.fill == null ? textColor : attr.fill;

    return svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', textAnchor)
        .attr('font-family', 'Courier new')
        .attr('fill', fill)
        .attr('font-size', fontSize)
        .attr('alignment-baseline', alignmentBaseline)
        .attr('transform', transform)
        .text(text);
}

function drawTab(svg, x, y, orientation) {
    let tabHeight = 16
    svg.append('line')
        .attr('x1', orientation == 'horizontal' ? x - tabHeight / 2 : x)
        .attr('x2', orientation == 'horizontal' ? x + tabHeight / 2 : x)
        .attr('y1', orientation == 'vertical' ? y - tabHeight / 2 : y)
        .attr('y2', orientation == 'vertical' ? y + tabHeight / 2 : y)
        .attr('stroke', 'lightgrey')
        .attr('stroke-width', 2)
        .style("stroke-linecap", "round");
}

function drawStdDevAvgLegend(svg) {
    // Add avg line + std legend.
    let height = svg.attr("height");
    let width = svg.attr("width");
    svg.append("line")
        .attr("x1", width * 0.85)
        .attr("x2", width * 0.85)
        .attr("y1", height - padding * 2.25)
        .attr("y2", height - padding * 0.6)
        .attr("stroke", "#cdcdcd")
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round");
    svg.append("circle")
        .attr("cx", width * 0.85)
        .attr("cy", height - padding * 1.4)
        .attr("r", 5)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", width * 0.83)
        .attr("y", height - padding * 1.4)
        .text("group average")
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("circle")
        .attr("cx", width * 0.85)
        .attr("cy", height - padding * 1)
        .attr("r", 4)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", width * 0.83)
        .attr("y", height - padding * 1)
        .text("a user")
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("text")
        .attr("x", width * 0.87)
        .attr("y", height - padding * 2.15 - 15)
        .text("standard")
        .style("font-family", "Courier new")
        .style("text-anchor", "start")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("text")
        .attr("x", width * 0.87)
        .attr("y", height - padding * 2.15)
        .text("deviation")
        .style("font-family", "Courier new")
        .style("text-anchor", "start")
        .style("fill", textColor)
        .style("font-size", 12);
}

function drawMoodLegendData(moodLegend, moodList) {
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

function drawMoodLegend(moodLegend, title, moodList) {
    let width = moodLegend.attr("width");
    if (width == null) {
        console.error("drawMoodLegend: must specify width for moodLegend.")
    }
    moodLegend.append("text")
        .attr("x", width / 2)
        .attr("y", 15)
        .text(title)
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

    drawMoodLegendData(moodLegend, moodList);
}

function drawMoodHalfLegend(svgClass, title = "Average mood") {
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

    drawMoodLegend(moodLegend, title, moodList);
}

function drawAttitudeLegendData(attitudeLegend, attitudeList) {
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

function drawAttitudeLegend(attitudeLegend, title, attitudeList) {
    let width = attitudeLegend.attr("width");
    if (width == null) {
        console.error("drawAttitudeLegend: must specify width for attitudeLegend.")
    }
    attitudeLegend.append("text")
        .attr("x", width / 2)
        .attr("y", 15)
        .text(title)
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

    drawAttitudeLegendData(attitudeLegend, attitudeList);
}

function drawAttitudeHalfLegend(svgClass, attList = attitudeList, title = "Most frequent attitude") {
    let svg = d3.select(svgClass)
    let height = svg.attr('height')
    let width = svg.attr('width')
    let attitudeLegendAttr = {
        x: width / 2 + padding * 2,
        y: height - padding * 2.5,
        width: width - (width / 2 + padding * 2) - (padding * 2)
    }

    let attitudeLegend = svg.append("g")
        .attr("class", "attitudeLegend")
        .attr("width", attitudeLegendAttr.width)
        .attr("transform", "translate(" + attitudeLegendAttr.x + "," + attitudeLegendAttr.y + ")");

    drawAttitudeLegend(attitudeLegend, title, attList);
}

// add color filters to website, must call this per svg 
function setUpFilters(svgClass) {
    let svg = d3.select(svgClass);
    svg.append('filter')
        .attr('id', 'Amazing')
        .append('feColorMatrix')
        .attr('type', 'matrix')
        .attr('color-interpolation-filters', 'sRGB')
        .attr('values', "0 0 0 0 1 0 0 0 0 0.772549 0 0 0 0 0 0 0 0 1 0");

    svg.append('filter')
        .attr('id', 'Good')
        .append('feColorMatrix')
        .attr('type', 'matrix')
        .attr('color-interpolation-filters', 'sRGB')
        .attr('values', "0 0 0 0 0.9490196 0 0 0 0 0.84705882 0 0 0 0 0.4705882 0 0 0 1 0");

    svg.append('filter')
        .attr('id', 'Ok')
        .append('feColorMatrix')
        .attr('type', 'matrix')
        .attr('color-interpolation-filters', 'sRGB')
        .attr('values', "0 0 0 0 0.92941176 0 0 0 0 0.76470588 0 0 0 0 0.63921568 0 0 0 1 0");

    svg.append('filter')
        .attr('id', 'Bad')
        .append('feColorMatrix')
        .attr('type', 'matrix')
        .attr('color-interpolation-filters', 'sRGB')
        .attr('values', "0 0 0 0 0.79215686 0 0 0 0 0.380392156 0 0 0 0 0.30196078 0 0 0 1 0");

    svg.append('filter')
        .attr('id', 'Awful')
        .append('feColorMatrix')
        .attr('type', 'matrix')
        .attr('color-interpolation-filters', 'sRGB')
        .attr('values', "0 0 0 0 0.6235294 0 0 0 0 0.1490196 0 0 0 0 0.3568627 0 0 0 1 0");

    svg.append('filter')
        .attr('id', 'Grey')
        .append('feColorMatrix')
        .attr('type', 'matrix')
        .attr('color-interpolation-filters', 'sRGB')
        .attr('values', "0 0 0 0 0.804 0 0 0 0 0.804 0 0 0 0 0.804 0 0 0 1 0");

}

// Helper function for drawing imperfect circles and zigzag curves.
function getImperfectArcPoints(center, radius, start, end, step, maxOffset) {
    let points = [];
    for (let i = start; i <= end; i += step) {
        // Convert angle to radians.
        let theta = i * Math.PI / 180;
        // Calculate point on circle.
        let x = center.x + radius * Math.cos(theta); // x = rcos(a)
        let y = center.y + radius * Math.sin(theta); // y = rsin(a)
        // Add random radius offset in range [-maxOffset, maxOffset] to create zig zag.
        let rOffset = (2 * Math.random() - 1) * maxOffset;
        x += rOffset * Math.cos(theta);
        y += rOffset * Math.sin(theta);
        // Add point to points array.
        points.push([x, y]);
    }
    return points
}

function drawImperfectCircle(svg, center, radius, attr = {}) {
    // Unwrap optional attributes, set defaults.
    // Arc.
    let step = attr.step == null ? 8 : attr.step; // Control point increment.
    let maxOffset = attr.maxOffset == null ? Math.ceil(radius / 65) : attr.maxOffset; // Control radius max offset.
    // Stroke.
    let strokeWidth = attr.strokeWidth == null ? 2 : attr.strokeWidth; // Control thickness of line.
    let stroke = attr.stroke == null ? "lightgrey" : attr.stroke; // Control color of line.

    // Setup arc generator.
    let circleArcGen = d3.line()
        .curve(d3.curveCardinalClosed);

    // Generate imperfect circle arc points.
    let circlePoints = getImperfectArcPoints(center, radius, 0, 360 - step, step, maxOffset);

    // Draw path.
    let circleArc = circleArcGen(circlePoints);
    svg.append("path")
        .attr("d", circleArc)
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth);
}

function drawZigzagArc(svg, center, radius, attr = {}) {
    // Unwrap optional attributes, set defaults.
    // Zigzag.
    let step = attr.step == null ? 2 : attr.step; // Control width spacing of zigzag.
    let maxOffset = attr.maxOffset == null ? 8 : attr.maxOffset; // Control max height of zigzag.
    // Angle.
    let minAngle = attr.minAngle == null ? 0 : attr.minAngle; // Control arc angle start.
    let maxAngle = attr.maxAngle == null ? 360 : attr.maxAngle; // Control arc angle end.
    // Stroke.
    let strokeWidth = attr.strokeWidth == null ? 2 : attr.strokeWidth; // Control thickness of line.
    let stroke = attr.stroke == null ? "lightgrey" : attr.stroke; // Control color of line.

    // Setup arc generator.
    let zigzagArcGen = d3.line()
        .curve(d3.curveLinear);

    // Generate zigzag arc points.
    let zigzagArcPoints = getImperfectArcPoints(center, radius, minAngle, maxAngle, step, maxOffset);

    // Add zigzag arc path.
    let zigzagArc = zigzagArcGen(zigzagArcPoints);
    svg.append("path")
        .attr("d", zigzagArc)
        .attr("fill", "none")
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth);
}

function addTooltip(tooltipId) {
    return d3.select("body")
        .append('div')
        .attr('id', tooltipId)
        .style('padding', 10)
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('visibility', 'hidden')
        .attr('white-space', 'pre-line')
        .style('background-color', backgroundColor)
        .style('border-radius', '15px')
        .style('border', '1px solid #cdcdcd')
        .style('font-family', 'Courier new')
        .style('font-size', 12)
        .style('text-align', 'left')
        .style('color', textColor)
        .style('max-width', 250);
}

function setTooltipText(tooltip, text, leftOffset, rightOffset) {
    tooltip
        .html(text)
        .style("font-family", "Courier new")
        .style("font-size", 12)
        .style("text-align", "left")
        .style("color", textColor)
        .style("visibility", "visible")
        .style("max-width", 250)
        .style("top", event.pageY + 20)
        .style("left", function() {
            if (d3.event.clientX < 750) {
                return event.pageX + leftOffset + "px";
            } else {
                return event.pageX - rightOffset + "px";
            }
        });
}

function drawImperfectHorizontalLine(svg, xStart, xEnd, y) {
    let points = [];

    // generate points
    for (var i = xStart; i <= xEnd; i += 50) {
        let direction = Math.floor(Math.random() * 2) == 0 ? -1 : 1;
        let offset = Math.floor(Math.random() * 3);

        points.push({
            "x": i,
            "y": y + offset * direction
        });
    }

    points.push({ "x": xEnd, "y": y });

    let lineGenerator = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(points)
        .attr("d", lineGenerator)
        .style("fill", "none")
        .style("stroke", "#cdcdcd")
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round");
}

function drawImperfectVerticalLine(svg, yStart, yEnd, x, dashArr, color = "#cdcdcd") {
    let points = [];

    // generate points
    for (var i = yStart; i <= yEnd; i += 50) {
        let direction = Math.floor(Math.random() * 2) == 0 ? -1 : 1;
        let offset = Math.floor(Math.random() * 3);

        points.push({
            "x": x + offset * direction,
            "y": i
        });
    }

    points.push({ "x": x, "y": yEnd });

    let lineGenerator = d3.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .curve(d3.curveMonotoneX);

    svg.append("path")
        .datum(points)
        .attr("d", lineGenerator)
        .style("fill", "none")
        .style("stroke", color)
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", function() {
            return (dashArr == dashArray[3]) ? null : "round";
        })
        .style("stroke-dasharray", dashArr);
}