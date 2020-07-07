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
            "count": haveToList.length,
            "min": d3.extent(haveToList)[0],
            "max": d3.extent(haveToList)[1],
            "avg": (totalHaveToAvg / haveToList.length),
            "std": calculateStdDev(haveToList, (totalHaveToPercent / haveToList.length))
        });

        avgStdDataForGraph.push({
            "x": (key + ":want to"),
            "y": (totalWantToPercent / wantToList.length),
            "count": wantToList.length,
            "min": d3.extent(wantToList)[0],
            "max": d3.extent(wantToList)[1],
            "avg": (totalWantToAvg / wantToList.length),
            "std": calculateStdDev(wantToList, (totalWantToPercent / wantToList.length))
        });

    }
    let xScale = d3.scaleBand()
        .domain(balanceKeys)
        .range([padding * 2.5, width]);

    let yScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height - padding * 5.75, 0]);

    let tooltip = addTooltip("#balanceTooltip");

    // add tooltip highlight
    svg.selectAll(".balanceRect")
    	.data(avgStdDataForGraph)
    	.enter()
    	.append("rect")
    	.attr("id", function(d) {
    		return d.x;
    	})
    	.attr('x', function(d) {
            var key1 = (d.x).split(":")[0];
            var key2 = (d.x).split(":")[1];
            var offset = key2 == "want to" ? 15 : -25;
            return xScale(key1) - offset;
        })
        .attr('y', yScale(0.82))
        .attr('height', yScale(0)-yScale(0.82))
        .attr('width', 30)
        .attr('fill', '#c4c4c41a')
        .attr('opacity', 0)
        .attr('rx', 4)
        .attr('stroke', 'lightgrey')
        .attr('stroke-width', 1)
        .on("mousemove", function(d){
        	let attitude = (d.x).split(":")[1];
			let tooltipText = "<b>ATTITUDE:</b> " + attitude 
			+ "</br></br><b>FREQUENCY: </b>" + d.count 
			+ "</br></br><b>AVERAGE TIME SPENT: </b>" + Math.trunc(d.y*100) + "%" 
			+"</br></br><b>MIN TIME SPENT: </b>" + Math.trunc(d.min*100) + "%"
			+"</br></br><b>MAX TIME SPENT: </b>" + Math.trunc(d.max*100) + "%";
        	setTooltipText(tooltip, tooltipText, 20, 220);
        	event.target.style.opacity = 1;
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
            event.target.style.opacity = 0;
        });

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
            .attr('y', yScale(0) + 10)
            .attr('width', iconWidth-10)
            .attr('height', iconWidth-10);
        svg.append('text')
            .attr('x', xScale(category) + (iconWidth/2) - 15)
            .attr('y', yScale(0) + iconWidth + 10)
            .text(balanceShortToLong1[category])
            .style("font-family", "Courier new")
	        .style("text-anchor", "middle")
	        .style("font-size", 11);
	    svg.append('text')
            .attr('x', xScale(category) + (iconWidth/2) - 15)
            .attr('y', yScale(0) + iconWidth + 25)
            .text(balanceShortToLong2[category])
            .style("font-family", "Courier new")
	        .style("text-anchor", "middle")
	        .style("font-size", 11);
    }

    //add x axis label
    svg.append("text")
        .attr("x", width*0.48)
        .attr("y", yScale(0) + iconWidth + 50)
        .text("Do you think your life is balanced?")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 12);

    //add y axis text
    svg.append("text")
        .attr("x", padding * 2)
        .attr("y", yScale(0.85))
        .text("% of time spent")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "end")
        .style("font-size", 11);
    let yAxis = d3.select(svgClass)
        .append("g")
        .attr("class", "y_axis")
        .attr("transform", "translate(" + (padding * 1.5) + ", 0)")
        .call(d3.axisRight(yScale).ticks(5).tickFormat(function(d, i, n) {
            return n[i + 1] ? d*100 : "";
        }));
    yAxis.selectAll("text")
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("fill", textColor)
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