let dashArrayForBursts = {
    "I want to": "0.25 1",
    "I have to": "3 3",
    "I want to and have to": "0.25 2 3 2",
    "of something else; I neither want to nor have to": "1000"
};

/**
*   svgClass: tag for svg clas, must include the '.'
*   data: list of data entries from excel 
*   centerX: x location for center of burst
*   centerY: y location for center of burst
*   mood: mood that the burst represents, ie "Good" -- used for color of burst
*   returns void, handles drawing of one burst 
*/
function drawBurst(svgClass, data, centerX, centerY, mood, divisionFactor) {
    let svg = d3.select(svgClass);
    let lengthOfTick = 17;
    let totalTicks = getTotalFrequencyFromMap(data);

    let offset = totalTicks < 10 ? 1 : divisionFactor;
    let numVisibleTicks = Math.floor(totalTicks/offset);

    let innerRadius = numVisibleTicks < 10 ? 0 : (numVisibleTicks*lengthOfTick/10);
    let outerRadius = innerRadius + lengthOfTick;

    let radialScale = d3.scaleLinear()
        .domain([0, Math.floor(totalTicks / offset)])
        .range([0, 2 * Math.PI]);

    let count = 0;
    let keys = Object.keys(data);

    // drawing lines for single burst
    for (var i = 0; i < keys.length; i++) {
        let reason = keys[i];
        for (var j = 0; j < data[reason]; j += offset) {
            svg.append("line")
                .attr("x1", centerX + innerRadius * Math.cos(radialScale(count)))
                .attr("x2", centerX + outerRadius * Math.cos(radialScale(count)))
                .attr("y1", centerY + innerRadius * Math.sin(radialScale(count)))
                .attr("y2", centerY + outerRadius * Math.sin(radialScale(count)))
                .attr("stroke", colorHexArray[mood])
                .attr("stroke-width", 2.5)
                .style("stroke-linecap", "round")
                .style("stroke-dasharray", dashArray[reason]);
            count += 1;
        }
    }

}

/**
*   svgClass: tag for svg clas, must include the '.'
*   categoryMap: map of short activity keys ("b5") to frequency
*   title: title of graph
*   personData: list of data entries
*   returns void, handles drawing of entire vis 
*/
function drawMoodByActivityBursts(svgClass, categoryMap, personData, title) {
    let svg = d3.select(svgClass);

    let keyList = Array.from(categoryMap.keys()).slice(0, numIcons);
    // console.log(keyList);
    // console.log(personData);

    let reasonByActivity = getFrequencyByKeys("Activity", "Reason", personData);
    let feelingByActivity = getFrequencyByKeys("Activity", "Feeling", personData);
    let burstMap = getFrequencyByThreeKeys("Activity", "Feeling", "Reason", keyList, personData);
    // console.log(burstMap);

    let avgMap = findAvgMood(keyList, feelingByActivity, false);
    let stdDevMap = findStdDevMood(keyList, feelingByActivity, avgMap);

    let xScale = d3.scaleBand()
        .domain(keyList)
        .range([padding * 2.5, width]);

    let yScale = d3.scaleLinear()
        .domain([0, 4])
        .range([height - padding * 5, padding * 2]);

    // draw std dev lines per activity
    svg.selectAll(".stdDevLines")
        .data(keyList)
        .enter()
        .append("line")
        .attr("x1", function(d) {
            return xScale(d) + 10;
        })
        .attr("x2", function(d) {
            return xScale(d) + 10;
        })
        .attr("y1", function(d) {
            return yScale(avgMap[d] - stdDevMap[d]);
        })
        .attr("y2", function(d) {
            return yScale(avgMap[d] + stdDevMap[d])
        })
        .attr("stroke", "#cdcdcd")
        .attr("stroke-width", 2.5)
        .style("opacity", 0.4)
        .style("stroke-linecap", "round");

    // draw dots for average mood per activity
    svg.selectAll(".avgDots")
        .data(keyList)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            return xScale(d) + 10;
        })
        .attr("cy", function(d) {
            return yScale(avgMap[d]);
        })
        .attr("r", 5)
        .style("fill", function(d) {
            return colorHexArray[moodList[Math.round(avgMap[d])]];
        });


    keyList.forEach(function(activity, i) {
        // add icons
        svg.append('image')
            .attr('xlink:href', 'images/' + activity + '.svg')
            .attr('x', xScale(keyList[i]) - 25)
            .attr('y', yScale(0) + 40)
            .attr('width', iconWidth)
            .attr('height', iconWidth)
            .style('filter', function() {
                return 'url(#' + moodList[Math.round(avgMap[keyList[i]])] + ')';
            });

        //TODO:
        // - calculate max number of ticks and division factor
        // - 
        let maxTicks = 0;
        Object.keys(burstMap[activity]).forEach(function(mood) {
            let tempNumTicks = getTotalFrequencyFromMap(burstMap[activity][mood]);
            maxTicks = maxTicks < tempNumTicks ? tempNumTicks : maxTicks;
        });

        //draw bursts
        Object.keys(burstMap[activity]).forEach(function(mood) {
            let burstData = burstMap[activity][mood];
            drawBurst(svgClass, burstData, xScale(keyList[i]) + 10, yScale(moodList.indexOf(mood)), mood, Math.ceil(maxTicks/30));
        });
    });

    //add y axis
    let yAxis = d3.select(svgClass)
        .append("g")
        .attr("class", "y_axis")
        .attr("transform", "translate(" + (padding * 1.5) + ", 0)")
        .call(d3.axisRight(yScale).ticks(5).tickFormat(function(d) {
            return moodList[d];
        }));
    yAxis.selectAll("text")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "end")
        .style("fill", function(d) {
            return colorHexArray[moodList[d]];
        })
        .style("font-size", 12);

    // add title
    drawTitle(svg, title);
}