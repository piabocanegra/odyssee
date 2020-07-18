function drawIntuitorsVis(svgClass, everyoneData, personalityData, typesData) {
	let svg = d3.select(svgClass);
	// console.log(typesData);
	let infjData = getDataByPType(everyoneData, typesData, "INFJ", "b4", getPersonDataByActivity);
	setUpType(svg, width*0.3, 100, "INFJ", "INFJ: Creative", "b4", infjData, "% of records");
	let intjData = getDataByPType(everyoneData, typesData, "INTJ", "b5", getPersonDataByActivity);
	setUpType(svg, width*0.7, 100, "INTJ", "INTJ: Hard-working & Determined", "b5", intjData, "% of records");
	let enfpData = getDataByPType(everyoneData, typesData, "ENFP", "i", getPersonDataByActivityType);
	setUpType(svg, width*0.3, 450, "ENFP", "ENFP: Knows how to relax & Curious", "i10", enfpData, "% of records")
	let entpData = getDataByPTypeValue(everyoneData, typesData, "ENTP", "Understanding and advancing the welfare of all people");
	setUpType(svg, width*0.7, 450, "ENTP", "ENTP: Knowledgable", "welfare", entpData, "% of participants");
	
	//Understanding and advancing the welfare of all people
	setUpTitleIcon(svg, "intuitors", "The Intuitors");
}

// num of records with creative


function setUpType(svg, x, y, personality, title, icon, data, yLabel = "") {
	let mWidth = 300; 
	let mHeight = 175;
	let iconDim = 100;
	console.log(data);
	// add title
	svg.append("text")
		.attr("x", x+mWidth/2)
		.attr("y", y)
		.text(title)
		.style("font-family", "Courier new")
		.style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 11);

    // add personality icon
    svg.append("image")
    	.attr('xlink:href', 'images/' + personality + '.svg')
    	.attr("x", x + mWidth/4)
    	.attr("y", y + mHeight)
    	.attr("width", iconDim)
    	.attr("height", iconDim);

   	// add group label
   	svg.append("text")
		.attr("x", x+mWidth*0.7)
		.attr("y", y + mHeight + 15)
		.text("group")
		.style("font-family", "Courier new")
		.style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 11);

    // display y axis label
    svg.append("text")
		.attr("x", x + mWidth*0.25)
		.attr("y", y + 30)
		.text(yLabel)
		.style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("font-size", 10);

    // display y icon
    svg.append("image")
    	.attr('xlink:href', 'images/' + icon + '.svg')
    	.attr("x", x +mWidth*0.05)
    	.attr("y", y + mHeight/2)
    	.attr("width", iconDim/2)
    	.attr("height", iconDim/2)
    	.style("filter", "url(#Grey)");

    let yScale = d3.scaleLinear()
        .domain([0, data[0].percent])
        .range([y + mHeight - 10, y + 30]);

   	// draw line 
   	svg.selectAll('.bars')
   		.data(data)
   		.enter()
   		.append("line")
   		.attr("x1", function(d, i) {
   			return x + mWidth/4 + iconDim/2 + mWidth*0.3*i - 5;
   		})
   		.attr("x2", function(d, i) {
   			return x + mWidth/4 + iconDim/2 + mWidth*0.3*i - 5;
   		})
   		.attr("y1", yScale(0))
   		.attr("y2", function(d) {
   			return yScale(d.percent);
   		})
        .style("stroke", function(d) {
        	return colorHexArray[d.fMood];
        })
        .style("stroke-dasharray", function(d) {
        	return dashArray[d.fAttitude];
        })
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round");

}

function setUpTitleIcon(svg, img, title) {
	svg.append("text")
		.attr("x", width*0.07)
		.attr("y", height*0.5)
		.text(title)
		.style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", 12);

    svg.append("image")
    	.attr('xlink:href', 'images/' + img + '.svg')
    	.attr("x", width*0.03)
    	.attr("y", height*0.53)
    	.attr("width", 75)
    	.attr("height", 75);
}