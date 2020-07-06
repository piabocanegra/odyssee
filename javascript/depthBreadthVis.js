function drawDepthBreadthPlot(svgClass, everyoneData, personalityData) {
	let svg = d3.select(svgClass);
    
    let dbData = groupMapByValue(createMapFromPersonality(personalityData, "Do you prefer breadth or depth in life?"));

    let depthActivityList = [];
    let breadthActivityList = [];
    // excluding rest, self-care, eating and drinking
    let exclusionList = ["i8:", "i3:", "i9:"];

    // create aggregate lists for depth/breadth groups
    for (var email of dbData["Depth"]) {
    	var personData = getPersonData(everyoneData, email);
    	depthActivityList = depthActivityList.concat(personData);
    }

    for (var email of dbData["Breadth"]) {
    	var personData = getPersonData(everyoneData, email);
    	breadthActivityList = breadthActivityList.concat(personData);
    }

    // get top activities
    let depthActivityData = getFrequencyByKey("Activity", depthActivityList);
    let depthTopThree = getTopThreeActivities(depthActivityData, exclusionList);
    let depthPercent = getPercentageOfActivities(depthTopThree, depthActivityList);
    let depthMood = (getFrequencyByKey("Feeling", depthActivityList)).keys().next().value;

    let breadthActivityData = getFrequencyByKey("Activity", breadthActivityList);
    let breadthTopThree = getTopThreeActivities(breadthActivityData, exclusionList);
    let breadthPercent = getPercentageOfActivities(breadthTopThree, breadthActivityList);
    let breadthMood = getFrequencyByKey("Feeling", breadthActivityList).keys().next().value;

    let depthDistinctActivities = getDistinctActivitiesWithExclusion(depthActivityData, exclusionList.concat(depthTopThree));
    let breadthDistinctActivities = getDistinctActivitiesWithExclusion(breadthActivityData, exclusionList.concat(breadthTopThree));
   

    let rootScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height*0.3, height]);

    let xRightLeafScale = d3.scaleLinear()
        .domain([1, 10])
        .range([padding*7, padding*7.5]);

    let xLeftLeafScale = d3.scaleLinear()
        .domain([1, 10])
        .range([padding*7, padding*6.5]);

    let yLeafScale = d3.scaleLinear()
        .domain([0, 1])
        .range([height*0.67, height*0.65]);

    let rightLeafGenerator = d3.line()
	    .y(function(d) { return yLeafScale(d.y); })
	    .x(function(d) { return xRightLeafScale(d.x); })
	    .curve(d3.curveMonotoneX);

	let leftLeafGenerator = d3.line()
	    .y(function(d) { return yLeafScale(d.y); })
	    .x(function(d) { return xLeftLeafScale(d.x); })
	    .curve(d3.curveMonotoneX);

	let tooltip = addTooltip("#depthBreadthTooltip");

	// draw ground
    drawImperfectHorizontalLine(svg, padding*2, width-padding*2, rootScale(0));

    // draw plants
    svg.append("image")
    	.attr('xlink:href', 'images/depth_plant.svg')
        .attr('x', width*0.55)
        .attr('y', height*0.1)
        .attr('width', 300)
        .attr('height', 300)
        .on("mousemove", function() {
        	let text = "<b>% TIME SPENT:</b> " + Math.trunc(depthPercent*100) 
        	+ "%</br></br><b># OF DISTINCT ACTIVITIES: </b>" + depthDistinctActivities.size
        	+ "</br></br><b>MODE ACTIVITY FLOW: </b>bi-directional" 
        	+ "</br></br><b>MOST FREQUENT MOOD: </b>" + depthMood.toLowerCase();
        	setTooltipText(tooltip, text, 20, 250);
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });
    svg.append("image")
    	.attr('xlink:href', 'images/breadth_plant.svg')
        .attr('x', width*0.15)
        .attr('y', height*0.12)
        .attr('width', 300)
        .attr('height', 300)
        .on("mousemove", function() {
        	let text = "<b>% TIME SPENT:</b> " + Math.trunc(breadthPercent*100) 
        	+ "%</br></br><b># OF DISTINCT ACTIVITIES: </b>" + breadthDistinctActivities.size
        	+ "</br></br><b>MODE ACTIVITY FLOW: </b>bi-directional" 
        	+ "</br></br><b>MOST FREQUENT MOOD: </b>" + breadthMood.toLowerCase();
        	setTooltipText(tooltip, text, 20, 250);
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });

    // pseduo plant data
    let dataset = [
    	{"x": 1, "y": 0},
    	{"x": 2, "y": 0.301},
    	{"x": 3, "y": 0.477},
    	{"x": 4, "y": 0.602},
    	{"x": 5, "y": 0.699},
    	{"x": 6, "y": 0.778},
    	{"x": 7, "y": 0.845},
    	{"x": 8, "y": 0.903},
    	{"x": 9, "y": 0.954},
    	{"x": 10, "y": 1}
    ];

    // mode activity legend
    svg.append("text")
    	.attr("x", padding * 1.5)
    	.attr("y", height*0.6)
    	.text("Mode activity flow type")
    	.style("font-family", "Courier new")
        .style("font-size", 12);
    svg.append("line")
    	.attr("x1", padding*2)
    	.attr("x2", padding*2)
    	.attr("y1", height*0.65)
    	.attr("y2", height*0.7)
    	.attr("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("line")
    	.attr("x1", padding*4)
    	.attr("x2", padding*4)
    	.attr("y1", height*0.65)
    	.attr("y2", height*0.7)
    	.attr("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("text")
    	.attr("x", padding*2)
    	.attr("y", height*0.73)
    	.text("inflow")
    	.style("font-family", "Courier new")
    	.style("text-anchor", "middle")
        .style("font-size", 12);
    svg.append("text")
    	.attr("x", padding*4)
    	.attr("y", height*0.73)
    	.text("bi-directional")
    	.style("text-anchor", "middle")
    	.style("font-family", "Courier new")
        .style("font-size", 12);
    svg.append("text")
    	.attr("x", padding*3)
    	.attr("y", height*0.76)
    	.text("each shape represents")
    	.style("text-anchor", "middle")
    	.style("font-family", "Courier new")
        .style("font-size", 12);
    svg.append("text")
    	.attr("x", padding*3)
    	.attr("y", height*0.78)
    	.text("a distinct activity*")
    	.style("text-anchor", "middle")
    	.style("font-family", "Courier new")
        .style("font-size", 12);

    // symbols for legend
    drawArrow(svg, 2, 0.656);
    drawArrow(svg, 2, 0.667);
    drawArrow(svg, 2, 0.677);
    drawArrow(svg, 2, 0.687);
    drawDiamond(svg, 4, 0.654);
    drawDiamond(svg, 4, 0.668);
    drawDiamond(svg, 4, 0.682);

    // plant legend
    svg.append("line")
    	.attr("x1", padding*7)
    	.attr("x2", padding*7)
    	.attr("y1", height*0.67)
    	.attr("y2", height*0.7)
    	.attr("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("path")
    	.datum(dataset)
    	.attr("d", rightLeafGenerator)
    	.style("fill", "none")
    	.style("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("path")
    	.datum(dataset)
    	.attr("d", leftLeafGenerator)
    	.style("fill", "none")
    	.style("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("text")
    	.attr("x", padding*7.9)
    	.attr("y", height*0.63)
    	.text("length of root")
    	.style("font-family", "Courier new")
        .style("font-size", 12);
    svg.append("text")
    	.attr("x", padding*7.9)
    	.attr("y", height*0.65)
    	.text("and width of plant represents")
    	.style("font-family", "Courier new")
        .style("font-size", 12);
    svg.append("text")
    	.attr("x", padding*7.9)
    	.attr("y", height*0.67)
    	.text("% of time spent on a specific")
    	.style("font-family", "Courier new")
        .style("font-size", 12);
    svg.append("text")
    	.attr("x", padding*7.9)
    	.attr("y", height*0.69)
    	.text("number of activities*")
    	.style("font-family", "Courier new")
        .style("font-size", 12);

    // most frequent mood legend
    svg.append("text")
    	.attr("x", padding * 1.5)
    	.attr("y", height - 15)
    	.text("*excludes activities such as: rest, self-care, eating and drinking")
    	.style("font-family", "Courier new")
        .style("font-size", 10);
    drawMoodHalfLegend(svgClass, "Most frequent mood");

    // add title
    drawTitle(svg, "Breadth vs. Depth");
}

function drawArrow(svg, xFactor, yFactor) {
	svg.append("line")
    	.attr("x1", padding*xFactor)
    	.attr("x2", padding*(xFactor-0.1))
    	.attr("y1", height*yFactor)
    	.attr("y2", height*(yFactor+0.007))
    	.attr("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("line")
    	.attr("x1", padding*xFactor)
    	.attr("x2", padding*(xFactor+0.1))
    	.attr("y1", height*yFactor)
    	.attr("y2", height*(yFactor+0.007))
    	.attr("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
}

function drawDiamond(svg, xFactor, yFactor) {
	svg.append("line")
    	.attr("x1", padding*xFactor)
    	.attr("x2", padding*(xFactor-0.1))
    	.attr("y1", height*yFactor)
    	.attr("y2", height*(yFactor+0.007))
    	.attr("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("line")
    	.attr("x2", padding*xFactor)
    	.attr("x1", padding*(xFactor-0.1))
    	.attr("y1", height*(yFactor+0.007))
    	.attr("y2", height*(yFactor+0.014))
    	.attr("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("line")
    	.attr("x1", padding*xFactor)
    	.attr("x2", padding*(xFactor+0.1))
    	.attr("y1", height*yFactor)
    	.attr("y2", height*(yFactor+0.007))
    	.attr("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    svg.append("line")
    	.attr("x2", padding*xFactor)
    	.attr("x1", padding*(xFactor+0.1))
    	.attr("y1", height*(yFactor+0.007))
    	.attr("y2", height*(yFactor+0.014))
    	.attr("stroke", textColor)
    	.attr("stroke-width", 2)
        .style("stroke-linecap", "round");
}