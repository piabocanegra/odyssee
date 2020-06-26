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
				dataForGraph.push({"x": (key+":have to"), "y": haveToPercent, "avg": haveToAvg});
			} 

			if (!Number.isNaN(wantToPercent)) {
				dataForGraph.push({"x": (key+":want to"), "y": wantToPercent, "avg": wantToAvg});
			}			
		}
		avgStdDataForGraph.push({
			"x": (key+":have to"), 
			"y": (totalHaveToPercent/haveToList.length), 
			"avg": (totalHaveToAvg/haveToList.length),
			"std": calcualateStdDev(haveToList, (totalHaveToPercent/haveToList.length))
		});

		avgStdDataForGraph.push({
			"x": (key+":want to"), 
			"y": (totalWantToPercent/wantToList.length), 
			"avg": (totalWantToAvg/wantToList.length),
			"std": calcualateStdDev(wantToList, (totalWantToPercent/wantToList.length))
		});

	}
	console.log(avgStdDataForGraph)

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
            .attr('x', xScale(category)-10)
            .attr('y', yScale(0)+40)
            .attr('width', iconWidth-10)
            .attr('height', iconWidth-10);
	}

	//add y axis text
	svg.append("text")
		.attr("x", padding*2.2)
		.attr("y", yScale(1))
		.text("% of time spent")
		.style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "end")
        .style("font-size", 11);

    // add avg line + std legend
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

    //add attitude legend
    svg.append("text")
    	.attr("x", width * 0.6)
    	.attr("y", height - padding * 2.5 + 15)
    	.text("Attitude")
    	.style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("line")
        .attr("x1", width * 0.55)
        .attr("x2", width * 0.55)
        .attr("y1", height - padding * 2.5 + padding * 1.2)
        .attr("y2", height - padding * 2.5 + 35)
        .attr("stroke", textColor)
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-dasharray", function(d, i) { return dashArray["I want to"]; });
    svg.append("line")
        .attr("x1", width * 0.65)
        .attr("x2", width * 0.65)
        .attr("y1", height - padding * 2.5 + padding * 1.2)
        .attr("y2", height - padding * 2.5 + 35)
        .attr("stroke", textColor)
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-dasharray", function(d, i) { return dashArray["I have to"]; });
    svg.append("text")
    	.attr("x", width * 0.55)
    	.attr("y", height - padding * 2.5 + padding * 1.65)
    	.text("want to")
    	.style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);
    svg.append("text")
    	.attr("x", width * 0.65)
    	.attr("y", height - padding * 2.5 + padding * 1.65)
    	.text("have to")
    	.style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

	// add title
    drawTitle(svg, "Balanced vs. Unbalanced");
    drawMoodHalfLegend(svgClass, "Most frequent mood");


}
