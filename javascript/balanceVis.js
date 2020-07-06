function drawBalanceGraph(svgClass, everyoneData, personalityData) {
    let svg = d3.select(svgClass);
    let balanceData = groupMapByValue(createMapFromPersonality(personalityData, "Balanced", balanceLongToShort));

    let balanceKeys = ["yes happy", "yes unhappy", "no happy", "no unhappy"];

    let dataForGraph = [];
    let avgStdDataForGraph = [];
    for (var key of balanceKeys) {
        var totalHaveToPercent = 0;
        var totalWantToPercent = 0;
        var totalHaveToAvg = 0;
        var totalWantToAvg = 0;
        var haveToList = [];
        var wantToList = [];
        var count = 0;

        for (var i = 0; i < balanceData[key].length; i++) {
            var email = balanceData[key][i];
            var personData = getPersonData(everyoneData, email);
            var frequencyMap = getFrequencyByKey("Reason", personData);

            var haveToPercent = calculatePercentageByKey(frequencyMap, "I have to");
            var wantToPercent = calculatePercentageByKey(frequencyMap, "I want to");

            var haveToAvg = findAvgMoodByKey(personData, "Reason", "I have to");
            var wantToAvg = findAvgMoodByKey(personData, "Reason", "I want to");

            // remove NaN values
            if (!Number.isNaN(haveToAvg)) {
                totalHaveToPercent += haveToPercent;
                totalHaveToAvg += haveToAvg;
                haveToList.push(haveToPercent);
            }

            if (!Number.isNaN(haveToAvg)) {
                totalWantToPercent += wantToPercent;
                totalWantToAvg += wantToAvg;
                wantToList.push(wantToPercent);
            }

            if (!Number.isNaN(haveToPercent)) {
                dataForGraph.push({ "x": (key + ":have to"), "y": haveToPercent, "avg": haveToAvg });
            }

            if (!Number.isNaN(wantToPercent)) {
                dataForGraph.push({ "x": (key + ":want to"), "y": wantToPercent, "avg": wantToAvg });
            }
        }
        avgStdDataForGraph.push({
            "x": (key + ":have to"),
            "y": (totalHaveToPercent / haveToList.length),
            "avg": (totalHaveToAvg / haveToList.length),
            "std": calculateStdDev(haveToList, (totalHaveToPercent / haveToList.length))
        });

        avgStdDataForGraph.push({
            "x": (key + ":want to"),
            "y": (totalWantToPercent / wantToList.length),
            "avg": (totalWantToAvg / wantToList.length),
            "std": calculateStdDev(wantToList, (totalWantToPercent / wantToList.length))
        });

    }
    let xScale = d3.scaleBand()
        .domain(balanceKeys)
        .range([padding * 2.5, width]);

    let yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - padding * 5, padding * 2]);

    // add std lines for each balance/reason category
    svg.selectAll(".balanceStdLines")
        .data(avgStdDataForGraph)
        .enter()
        .append("line")
        .attr("x1", function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 0 : 40;
            return xScale(key1) + offset;
        })
        .attr("x2", function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 0 : 40;
            return xScale(key1) + offset;
        })
        .attr("y1", function(d) {
            return yScale(d.y - d.std);
        })
        .attr("y2", function(d) {
            return yScale(d.y + d.std)
        })
        .attr("stroke", function(d) {
            return colorHexArray[moodList[Math.round(d.avg)]];
        })
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-dasharray", function(d) {
            return dashArray[attitudeShorttoLong[(d.x).split(":")[1]]];
        });


    // add dots for each user
    svg.selectAll(".userDots")
        .data(dataForGraph)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 0 : 40;
            return xScale(key1) + offset;
        })
        .attr("cy", function(d) {
            return yScale(d.y);
        })
        .attr("r", 4)
        .style("fill", function(d) {
            return colorHexArray[moodList[d.avg]];
        });

    // add dots for group avg of each category
    svg.selectAll(".balanceAvgDots")
        .data(avgStdDataForGraph)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 0 : 40;
            return xScale(key1) + offset;
        })
        .attr("cy", function(d) {
            return yScale(d.y);
        })
        .attr("r", 5);

    // add icons on x axis
    for (var category of balanceKeys) {
        svg.append('image')
            .attr('xlink:href', 'images/' + category + '.svg')
            .attr('x', xScale(category) - 10)
            .attr('y', yScale(0) + 40)
            .attr('width', iconWidth - 10)
            .attr('height', iconWidth - 10);
    }

    //add y axis text
    svg.append("text")
        .attr("x", padding * 2.2)
        .attr("y", yScale(1))
        .text("% of time spent")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "end")
        .style("font-size", 11);


    // add legends
    drawStdDevAvgLegend(svg);

    let attitudeLegendAttr = {
        x: width * 0.55,
        y: height - padding * 2.5,
        width: width * 0.1,
    };

    let attitudeLegend = svg.append("g")
        .attr("class", "attitudeLegend")
        .attr("width", attitudeLegendAttr.width)
        .attr("transform", "translate(" + attitudeLegendAttr.x + "," + attitudeLegendAttr.y + ")");

    drawAttitudeLegend(attitudeLegend, "Attitude", ["want to", "have to"]);
    drawMoodHalfLegend(svgClass, "Most frequent mood");

    // add title
    drawTitle(svg, "Balanced vs. Unbalanced");
}