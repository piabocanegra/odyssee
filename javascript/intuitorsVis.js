let mWidth = 300; 
let mHeight = 175;
let iconDim = 100;
let communicationList = ["b1", "b2", "b3", "b8", "b9"];
let isfjActList = ["b6", "b7"];

function drawIntuitorsVis(svgClass, everyoneData, personalityData, typesData) {
	let svg = d3.select(svgClass);
	// console.log(typesData);
	let infjData = getDataByPType(everyoneData, typesData, "INFJ", "b4", getPersonDataByActivity);
	displayPersonalityTitle(svg, width*0.3, 100, "INFJ: Creative");
	displayerPersonalityIcon(svg, width*0.3, 100, "INFJ");
	drawSingleYIcon(svg, width*0.3, 100, "b4");
	setUpSingleLineGraph(svg, width*0.3, 100, "INFJ", infjData, "% of records");
	console.log("infj");
	console.log(infjData);
	
	let intjData = getDataByPType(everyoneData, typesData, "INTJ", "b5", getPersonDataByActivity);
	displayPersonalityTitle(svg, width*0.7, 100, "INTJ: Hard-working & Determined");
	displayerPersonalityIcon(svg, width*0.7, 100, "INTJ");
	drawSingleYIcon(svg, width*0.7, 100, "b5");
	setUpSingleLineGraph(svg, width*0.7, 100, "INTJ", intjData, "% of records");
	console.log("intj");
	console.log(intjData);
	
	let enfpData = getDataByPType(everyoneData, typesData, "ENFP", "i", getPersonDataByActivityType);
	displayPersonalityTitle(svg, width*0.3, 450, "ENFP: Knows how to relax & Curious");
	displayerPersonalityIcon(svg, width*0.3, 450, "ENFP");
	drawSingleYIcon(svg, width*0.3, 450, "i10");
	setUpSingleLineGraph(svg, width*0.3, 450, "ENFP", enfpData, "% of records");
	console.log("enfp");
	console.log(enfpData);
	
	let entpData = getDataByPTypeValue(everyoneData, typesData, "ENTP", "Understanding and advancing the welfare of all people");
	displayPersonalityTitle(svg, width*0.7, 450, "ENTP: Knowledgable");
	displayerPersonalityIcon(svg, width*0.7, 450, "ENTP");
	drawSingleYIcon(svg, width*0.7, 450, "welfare");
	setUpSingleLineGraph(svg, width*0.7, 450, "ENTP", entpData, "% of participants");
	console.log("entp");
	console.log(entpData);
	
	setUpLeftPersonalityTitleIcon(svg, "intuitors", "The Intuitors");
}

function drawFeelerThinkerVis(svgClass, everyoneData, personalityData, typesData) {
	let svg = d3.select(svgClass);
	// console.log(typesData);
	
	let isfpData = getDataByPType(everyoneData, typesData, "ISFP", communicationList, getPersonDataByActivities)
	displayPersonalityTitle(svg, width*0.15, 100, "check - ISFP: Fiercely Independent");
	displayerPersonalityIcon(svg, width*0.15, 100, "ISFP");
	drawMultipleYIcons(svg, width*0.15, 100, communicationList);
	setUpSingleLineGraph(svg, width*0.15, 100, "ISFP", isfpData, "% of records");
	console.log("isfp");
	console.log(isfpData);

	let infpData = getDataByPTypeValue(everyoneData, typesData, "INFP", "Enjoying life");
	displayPersonalityTitle(svg, width*0.55, 100, "INFP: Open-Minded & Flexible");
	displayerPersonalityIcon(svg, width*0.55, 100, "INFP");
	drawSingleYIcon(svg, width*0.55, 100, "enjoying life");
	setUpSingleLineGraph(svg, width*0.55, 100, "INFP", infpData, "% of participants");
	console.log("infp");
	console.log(infpData);

	let esfjDataBad = getDataByPType(everyoneData, typesData, "ESFJ", communicationList, getPersonDataByActivitiesAndMood, ["Bad"])
	let esfjDataAwful = getDataByPType(everyoneData, typesData, "ESFJ", communicationList, getPersonDataByActivitiesAndMood, ["Awful"])
	displayPersonalityTitle(svg, width*0.15, 450, "check - ESFJ: Sensitive & Warm");
	displayerPersonalityIcon(svg, width*0.15, 450, "ESFJ");
	drawMultipleYIcons(svg, width*0.15, 450, communicationList);
	setUpMultipleLinesGraph(svg, width*0.15, 450, "ESFJ", esfjDataBad, esfjDataAwful, "% of records");
	console.log("esfj");
	console.log(esfjDataBad);
	console.log(esfjDataAwful);


	displayPersonalityTitle(svg, width*0.55, 450, "wip - ENFJ: Tolerant & Reliable");
	displayerPersonalityIcon(svg, width*0.55, 450, "ENFJ");

	setUpLeftPersonalityTitleIcon(svg, "feelers", "The Feelers");
	setUpRightPersonalityTitleIcon(svg, "thinkers", "The Thinkers");
}

function drawObserverVis(svgClass, everyoneData, personalityData, typesData) {
	let svg = d3.select(svgClass);

	displayPersonalityTitle(svg, width*0.3, 100, "wip - ISTJ: Jack-of-all-trades");
	displayerPersonalityIcon(svg, width*0.3, 100, "ISTJ");


	let isfjDataGood = getDataByPType(everyoneData, typesData, "ESFJ", isfjActList, getPersonDataByActivitiesAndMood, ["Good"])
	let isfjDataOk = getDataByPType(everyoneData, typesData, "ESFJ", isfjActList, getPersonDataByActivitiesAndMood, ["Ok"])
	displayPersonalityTitle(svg, width*0.7, 100, "ISFJ: Practical & Altruistic");
	displayerPersonalityIcon(svg, width*0.7, 100, "ISFJ");
	drawSingleYIcon(svg, width*0.68, 100, isfjActList[0]);
	drawSingleYIcon(svg, width*0.72, 100, isfjActList[1]);
	setUpMultipleLinesGraph(svg, width*0.7, 100, "ISFJ", isfjDataGood, isfjDataOk, "% of records");
	console.log("isfj");
	console.log(isfjDataGood);
	console.log(isfjDataOk);


	displayPersonalityTitle(svg, width*0.3, 450, "ESTP: Not found in the data");
	svg.append("image")
        .attr('xlink:href', 'images/ESTP.svg')
        .attr("x", width*0.3 + mWidth/2 - (iconDim/2))
        .attr("y", 450 + 10)
        .attr("width", iconDim)
        .attr("height", iconDim);


	let esfpData = getDataByPTypeValue(everyoneData, typesData, "ESFP", "Adhering to my culture or religion");
	displayPersonalityTitle(svg, width*0.7, 450, "check - ESFP: Bold");
	displayerPersonalityIcon(svg, width*0.7, 450, "ESFP");
	drawSingleYIcon(svg, width*0.7, 450, "religion");
	setUpSingleLineGraph(svg, width*0.7, 450, "ESFP", esfpData, "% of participants");
	console.log("esfp");
	console.log(esfpData);


	setUpLeftPersonalityTitleIcon(svg, "observers", "The Observers");
}

function setUpSingleLineGraph(svg, x, y, personality, data, yLabel = "") {
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

function setUpMultipleLinesGraph(svg, x, y, personality, data1, data2, yLabel = "") {
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

    let yScale = d3.scaleLinear()
        .domain([0, Math.max(0.02, data1[0].percent)])
        .range([y + mHeight - 10, y + 30]);

    // draw data1 lines 
    svg.selectAll('.bars')
        .data(data1)
        .enter()
        .append("line")
        .attr("x1", function(d, i) {
            return x + mWidth/4 + iconDim/2 + mWidth*0.3*i - 10;
        })
        .attr("x2", function(d, i) {
            return x + mWidth/4 + iconDim/2 + mWidth*0.3*i - 10;
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

    // draw data2 lines 
    svg.selectAll('.bars')
        .data(data2)
        .enter()
        .append("line")
        .attr("x1", function(d, i) {
            return x + mWidth/4 + iconDim/2 + mWidth*0.3*i;
        })
        .attr("x2", function(d, i) {
            return x + mWidth/4 + iconDim/2 + mWidth*0.3*i;
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

function setUpLeftPersonalityTitleIcon(svg, img, title) {
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

function setUpRightPersonalityTitleIcon(svg, img, title) {
    svg.append("text")
        .attr("x", width*0.95)
        .attr("y", height*0.5)
        .text(title)
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", 12);

    svg.append("image")
        .attr('xlink:href', 'images/' + img + '.svg')
        .attr("x", width*0.91)
        .attr("y", height*0.53)
        .attr("width", 75)
        .attr("height", 75);
}

function displayPersonalityTitle(svg, x, y, title) {
	svg.append("text")
        .attr("x", x+mWidth/2)
        .attr("y", y)
        .text(title)
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 11);
}
    
function displayerPersonalityIcon(svg, x, y, personality) {
	svg.append("image")
        .attr('xlink:href', 'images/' + personality + '.svg')
        .attr("x", x + mWidth/4)
        .attr("y", y + mHeight)
        .attr("width", iconDim)
        .attr("height", iconDim);
}

function drawSingleYIcon(svg, x, y, icon) {
    svg.append("image")
        .attr('xlink:href', 'images/' + icon + '.svg')
        .attr("x", x +mWidth*0.05)
        .attr("y", y + mHeight/2)
        .attr("width", iconDim/2)
        .attr("height", iconDim/2)
        .style("filter", "url(#Grey)");
}

function drawMultipleYIcons(svg, x, y, list) {
	//top row
	for (var i = 0; i < 3; i++) {
		svg.append("image")
        .attr('xlink:href', 'images/' + list[i] + '.svg')
        .attr("x", x +mWidth*(0.01+i*0.08))
        .attr("y", y + mHeight/3)
        .attr("width", iconDim/3)
        .attr("height", iconDim/3)
        .style("filter", "url(#Grey)");
	}

	for (var i = 3; i < 5; i++) {
		svg.append("image")
        .attr('xlink:href', 'images/' + list[i] + '.svg')
        .attr("x", x +mWidth*(0.01+(i-2)*0.08))
        .attr("y", y + mHeight/3 + iconDim/3)
        .attr("width", iconDim/3)
        .attr("height", iconDim/3)
        .style("filter", "url(#Grey)");
	}
}