let dashArrayForBursts = {
    "I want to": "0.25 4",
    "I have to": "3 4",
    "I want to and have to": "0.25 4 3 4",
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


    let maxTicks = 0;
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
        .attr("transform", "translate(" + (padding) + ", 0)")
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

    // add avg line + std legend
    svg.append("line")
        .attr("x1", width*0.8)
        .attr("x2", width*0.8)
        .attr("y1", height-padding*1.75)
        .attr("y2", height-padding*0.1)
        .attr("stroke", "#cdcdcd")
        .attr("stroke-width", 2.5)
        .style("opacity", 0.4)
        .style("stroke-linecap", "round");
    svg.append("circle")
        .attr("cx", width*0.8)
        .attr("cy", height-padding*1.15)
        .attr("r", 6)
        .style("fill", textColor);
    svg.append("text")
        .attr("x", width*0.78)
        .attr("y", height-padding*1.15-15)
        .text("average")
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("text")
        .attr("x", width*0.78)
        .attr("y", height-padding*1.15)
        .text("mood")
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("text")
        .attr("x", width*0.81)
        .attr("y", height-padding*0.1-15)
        .text("standard")
        .style("font-family", "Courier new")
        .style("text-anchor", "start")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("text")
        .attr("x", width*0.81)
        .attr("y", height-padding*0.1)
        .text("deviation")
        .style("font-family", "Courier new")
        .style("text-anchor", "start")
        .style("fill", textColor)
        .style("font-size", 12);

    // add attitude legend
    svg.append("text")
        .attr("x", padding*3 + width*0.22)
        .attr("y", height-padding*1.75)
        .text("one tick represents " + Math.ceil(maxTicks/30) + " ticks")
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("fill", textColor)
        .style("font-size", 12);
    let attitudeLegend = svg.append("g")
        .attr("class", "attitudeLegend")
        .attr("width", width*0.44)
        .attr("transform", "translate(" + padding*3 + "," + (height-padding*1.75) + ")");
    drawAttitudeLegendData(attitudeLegend);
}