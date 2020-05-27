/**
 *   svgClass: tag for svg class, must include the '.'
 *   categoryMap: map of short activity keys ("b5") to frequency 
 *   categoryFullMap: map of full activity keys ("Intellectual") to frequency
 *   title: title of graph
 *   personData: list of data entries
 *   returns void, draws data vis for line bar chart
 */
function drawIndActivityFlower(svgClass, categoryMap, categoryFullMap, title, personData) {
    let svg = d3.select(svgClass);
    let height = svg.attr('height');
    let width = svg.attr('width');

    // Show top 7 activities or activities with more than 5 records, whichever is fewer.
    let numIcons = 7;
    let keyList = Array.from(categoryMap.keys()).slice(0, numIcons);
    let keyListFiltered = keyList.filter(k => { return categoryMap.get(k) > 5 });
    keyList = keyListFiltered.length != 0 && keyListFiltered.length < keyList.length ? keyListFiltered : keyList;

    let keyList2 = Array.from(categoryFullMap.keys()).slice(0, numIcons);
    let keyList2Filtered = keyList2.filter(k => { return categoryFullMap.get(k) > 5 });
    keyList2 = keyList2Filtered.length != 0 && keyList2Filtered.length < keyList2.length ? keyList2Filtered : keyList2;

    // Setup scales.
    let xScale = d3.scaleBand()
        .domain(keyList)
        .range([padding * 2, width - padding * 2]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(keyList, function(d) {
            return categoryMap.get(d)
        })])
        .range([height - padding * 5, padding * 2]);

    // Add title.
    drawTitle(svg, title);

    // Function for drawing flower.
    function drawFlower(svgClass, data, centerX, centerY, length) {
        let svg = d3.select(svgClass);

        // n: Number of petals.
        let n = data.length;

        let innerRadius = 0;
        let outerRadius = innerRadius + length;

        // Setup scales.
        let radialScale = d3.scaleLinear()
            .domain([0, n - 1])
            .range([-Math.PI, 0]);

        let count = 0;

        // drawing lines for single burst
        data.forEach(d => {
            let mood = d['Feeling']

            console.log(Math.cos(radialScale(count)))
            console.log("x1: " + innerRadius)
            svg.append("line")
                .attr("x1", centerX + innerRadius * Math.cos(radialScale(count)))
                .attr("x2", centerX + outerRadius * Math.cos(radialScale(count)))
                .attr("y1", centerY + innerRadius * Math.sin(radialScale(count)))
                .attr("y2", centerY + outerRadius * Math.sin(radialScale(count)))
                .attr("stroke", colorHexArray[mood])
                .attr("stroke-width", 2.5)
                .style("stroke-linecap", "round")
                .style("stroke-dasharray", dashArray[d['Reason']])
            count += 1;
        });
    }

    // Draw flowers.
    // TODO: Account for activity with greater than 40 entries.
    keyList.forEach(function(d, i) {
        let data = getPersonDataByActivity(personData, d);

        let n = data.length; // n: Number of petals.
        let l = 27; // l: Multiplier constant for length.

        let length = data.length <= 5 ? l : n * l / 5;
        let centeringOffset = (width - 4 * padding) / keyList.length / 2
        let flowerCenter = { x: xScale(keyList[i]) + centeringOffset, y: yScale(0) + 10 - length };

        svg.append('filter')
            .attr('id', 'Grey')
            .append('feColorMatrix')
            .attr('type', 'matrix')
            .attr('color-interpolation-filters', 'sRGB')
            .attr('values', "0 0 0 0 0.8 0 0 0 0 0.8 0 0 0 0 0.8 0 0 0 1 0");

        svg.append('image')
            .attr('xlink:href', 'images/' + d + '.svg')
            .attr('x', flowerCenter.x - length / 2)
            .attr('y', flowerCenter.y)
            .attr('width', length)
            .attr('height', length)
            .style('filter', function() { return 'url(#Grey)'; });

        // Draw flower.
        drawFlower(svgClass, data, flowerCenter.x, flowerCenter.y, length);
    });

    // Add legends.
    let moodLegendAttr = {
        x: padding,
        y: height - padding * 2.5,
        width: width / 2 - (padding * 4)
    }
    let attitudeLegendAttr = {
        x: width / 2 + (padding * 3),
        y: height - padding * 2.5,
        width: width - (width / 2 + (padding * 3)) - padding
    }

    let moodLegend = svg.append("g")
        .attr("class", "moodLegend")
        .attr("width", moodLegendAttr.width)
        .attr("transform", "translate(" + moodLegendAttr.x + "," + moodLegendAttr.y + ")");
    let flowerLegend = svg.append("g")
        .attr("transform", "translate(" + (width / 2) + "," + (height - padding * 2.5) + ")");
    let attitudeLegend = svg.append("g")
        .attr("class", "attitudeLegend")
        .attr("width", attitudeLegendAttr.width)
        .attr("transform", "translate(" + attitudeLegendAttr.x + "," + attitudeLegendAttr.y + ")");

    drawMoodLegendData(moodLegend);
    drawFlowerLegend(flowerLegend);
    drawAttitudeLegendData(attitudeLegend);

    // Function for drawing flower legend.
    function drawFlowerLegend(flowerLegend) {
        let attitudes = ["I want to", "I have to", "I want to and have to", "of something else; I neither want to nor have to"];

        let flowerPadding = 12;
        let flowerCenter = { x: 0, y: padding * 1.65 - flowerPadding - 12 };
        let flowerPetalLength = 24;

        let count = 0;
        let innerRadius = 0;
        let outerRadius = innerRadius + flowerPetalLength;

        // Setup scales.
        let radialScale = d3.scaleLinear()
            .domain([0, attitudes.length - 1])
            .range([-Math.PI, 0]);

        // Add text.
        flowerLegend.append("text")
            .attr("x", 0)
            .attr("y", flowerCenter.y - flowerPetalLength - flowerPadding)
            .style("text-anchor", "middle")
            .style("font-family", "Courier new")
            .style("fill", textColor)
            .style("font-size", 12)
            .text("all records");

        // Add petals.
        attitudes.forEach(attitude => {
            flowerLegend.append("line")
                .attr("x1", flowerCenter.x + innerRadius * Math.cos(radialScale(count)))
                .attr("x2", flowerCenter.x + outerRadius * Math.cos(radialScale(count)))
                .attr("y1", flowerCenter.y + innerRadius * Math.sin(radialScale(count)))
                .attr("y2", flowerCenter.y + outerRadius * Math.sin(radialScale(count)))
                .attr("stroke", textColor)
                .attr("stroke-width", 2.5)
                .style("stroke-linecap", "round")
                .style("stroke-dasharray", dashArray[attitude])
            count += 1;
        });

        // Add text.
        flowerLegend.append("text")
            .attr("x", 0)
            .attr("y", padding * 1.65)
            .style("text-anchor", "middle")
            .style("font-family", "Courier new")
            .style("fill", textColor)
            .style("font-size", 12)
            .text("for an activity");
    }

}