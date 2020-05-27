function getPersonDataByKey(key) {
    console.log(personData)
    return personData.filter(d => d['Activity'].substring(0, 2) == key);
}

/**
 *   svgClass: tag for svg clas, must include the '.'
 *   categoryMap: map of short activity keys ("b5") to frequency 
 *   categoryFullMap: map of full activity keys ("Intellectual") to frequency
 *   title: title of graph
 *   personData: list of data entries
 *   returns void, draws data vis for line bar chart
 */
function drawIndActivityFlower(svgClass, categoryMap, categoryFullMap, title, personData) {
    let svg = d3.select(svgClass);

    // Show top 7 activities or activities with more than 5 records, whichever is fewer.
    let numIcons = 7;
    let keyList = Array.from(categoryMap.keys()).slice(0, numIcons);
    let keyListFiltered = keyList.filter(k => { return categoryMap.get(k) > 5 });
    keyList = keyListFiltered.length != 0 && keyListFiltered.length < keyList.length ? keyListFiltered : keyList;

    let keyList2 = Array.from(categoryFullMap.keys()).slice(0, numIcons);
    let keyList2Filtered = keyList2.filter(k => { return categoryFullMap.get(k) > 5 });
    keyList2 = keyList2Filtered.length != 0 && keyList2Filtered.length < keyList2.length ? keyList2Filtered : keyList2;

    console.log(categoryFullMap)
    console.log(keyList);
    console.log(keyList2);

    let reasonByActivity = getFrequencyByKeys("Activity", "Reason", personData);
    let feelingByActivity = getFrequencyByKeys("Activity", "Feeling", personData);

    let reasonMap = findMode(keyList, reasonByActivity);
    let feelingMap = findMode(keyList, feelingByActivity);
    let avgMap = findAvgMood(keyList, feelingByActivity);

    // Setup scales.
    let graphWidth = width - padding * 2.5;
    let xScale = d3.scaleBand()
        .domain(keyList)
        .range([padding * 2.5, width]);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(keyList, function(d) {
            return categoryMap.get(d)
        })])
        .range([height - padding * 5, padding * 2]);

    // Add title.
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', 50)
        .text(title)
        .style("font-family", "Courier new")
        .style("font-size", 25)
        .style("fill", textColor)
        .style("text-anchor", "middle");

    // add tooltip
    let tooltip = d3.select("body")
        .append("div")
        .style("padding", 10)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .attr("white-space", "pre-line")
        .style("background-color", backgroundColor)
        .style("border-radius", "15px")
        .style("border", "1px solid #cdcdcd");

    function drawFlower(svgClass, data, centerX, centerY, length) {
        let svg = d3.select(svgClass);

        // n: Number of petals.
        let n = data.length;

        let innerRadius = 0;
        let outerRadius = innerRadius + length;

        // Setup scales.
        let radialScale = d3.scaleLinear()
            .domain([0, n])
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
    // add icons
    keyList.forEach(function(d, i) {

        let data = getPersonDataByKey(d);

        let n = data.length; // n: Number of petals.
        let l = 27; // l: Multiplier constant for length.

        let length = data.length <= 5 ? l : n * l / 5;
        let flowerCenter = { x: xScale(keyList[i]), y: yScale(0) + 10 - length };

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
            .style('filter', function() { return 'url(#Grey)'; })
            .on("mousemove", function() {
                var tooltipText = "<b>ACTIVITY:</b> " + keyList2[i].split("(")[0].toLowerCase() + "</br></br><b>FREQUENCY: </b>" + categoryMap.get(d) + "</br></br><b>AVERAGE MOOD: </b>" + moodList[avgMap[keyList[i]]].toLowerCase() +
                    "</br></br><b>MOST FREQUENT ATTITUDE: </b>" + attitudeLongtoShort[reasonMap[keyList[i]]];
                tooltip
                    .html(tooltipText)
                    .style("font-family", "Courier new")
                    .style("font-size", 12)
                    .style("text-align", "left")
                    .style("color", textColor)
                    .style("visibility", "visible")
                    .style("max-width", 250)
                    .style("top", event.pageY + 20)
                    .style("left", function() {
                        if (d3.event.clientX < 750) {
                            return event.pageX + 20 + "px";
                        } else {
                            return event.pageX - 250 + "px";
                        }
                    });
            }).on("mouseout", function(d) {
                tooltip.style("visibility", "hidden");
            });

        // Draw flower.
        drawFlower(svgClass, getPersonDataByKey(d), flowerCenter.x, flowerCenter.y, length);
    });

    //add mood legend
    let moodLegend = d3.select(svgClass)
        .append("g")
        .attr("class", "moodLegend")
        .attr("transform", "translate(" + (padding * 2) + "," + (height - padding * 2.5) + ")");
    moodLegend.append("text")
        .attr("x", 2 * padding * 1.75)
        .attr("y", 15)
        .text("Average mood")
        // .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);
    moodLegend.selectAll(".moodDots")
        .data(moodList)
        .enter()
        .append('circle')
        .attr("cx", function(d, i) {
            return i * padding * 1.75;
        })
        .attr("cy", padding * 1)
        .attr("r", 5)
        .style("fill", function(d) {
            return colorHexArray[d];
        });
    moodLegend.selectAll(".moodText")
        .data(moodList)
        .enter()
        .append('text')
        .attr("x", function(d, i) {
            return i * padding * 1.75;
        })
        .attr("y", padding * 1.65)
        .text(function(d) {
            return d;
        })
        // .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

    // add attitude legend
    let attitudeLegend = d3.select(svgClass)
        .append("g")
        .attr("class", "attitudeLegend")
        .attr("transform", "translate(" + (width - padding * 9) + "," + (height - padding * 2.5) + ")");
    attitudeLegend.append("text")
        .attr("x", 2.5 * padding * 1.75 + padding)
        .attr("y", 15)
        .text("Most frequent attitude")
        // .style("font-weight", "bold")
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("fill", textColor)
        .style("font-size", 12);
    attitudeLegend.selectAll(".attText")
        .data(attitudeList)
        .enter()
        .append('text')
        .attr("x", function(d, i) {
            return i * padding * 1.75 + padding;
        })
        .attr("y", padding * 1.65)
        .text(function(d) {
            return d;
        })
        .style("text-anchor", "middle")
        // .style("font-weight", "bold")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);
    attitudeLegend.selectAll(".attLine")
        .data(attitudeList)
        .enter()
        .append('line')
        .attr("x1", function(d, i) {
            return i * padding * 1.75 + padding;
        })
        .attr("x2", function(d, i) {
            return i * padding * 1.75 + padding;
        })
        .attr("y1", padding * 1.2)
        .attr("y2", 35)
        .attr("stroke", textColor)
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-dasharray", function(d, i) {
            return dashArray2[i];
        });
}