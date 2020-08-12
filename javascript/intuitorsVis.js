let mWidth = 300;
let mHeight = 175;
let iconDim = 100;
let communicationList = ["b1", "b2", "b3", "b8", "b9"];
let isfjActList = ["b6", "b7"];
// excluding rest, self-care, eating and drinking
let exclusionList = ["i8:", "i3:", "i9:"];

function drawIntuitorsVis(svgClass, everyoneData, personalityData, typesData) {
    let svg = d3.select(svgClass);
    let tooltip = addTooltip("intuitorTooltip");

    // console.log(typesData);
    let infjData = getDataByPType(everyoneData, typesData, "INFJ", "b4", getPersonDataByActivity);
    displayPersonalityTitle(svg, width * 0.3, 100, "INFJ: Creative");
    displayerPersonalityIcon(svg, width * 0.3, 100, "INFJ");
    drawSingleYIcon(svg, width * 0.3, 100, "b4");
    setUpSingleLineGraph(svg, width * 0.3, 100, "INFJ", infjData, tooltip, "% of records that are creative: ", "% of records");

    let intjData = getDataByPType(everyoneData, typesData, "INTJ", "b5", getPersonDataByActivity);
    displayPersonalityTitle(svg, width * 0.7, 100, "INTJ: Hard-working & Determined");
    displayerPersonalityIcon(svg, width * 0.7, 100, "INTJ");
    drawSingleYIcon(svg, width * 0.7, 100, "b5");
    setUpSingleLineGraph(svg, width * 0.7, 100, "INTJ", intjData, tooltip, "% of records that are intellectual: ", "% of records");

    let enfpData = getDataByPType(everyoneData, typesData, "ENFP", "i", getPersonDataByActivityType);
    displayPersonalityTitle(svg, width * 0.3, 450, "ENFP: Knows how to relax & Curious");
    displayerPersonalityIcon(svg, width * 0.3, 450, "ENFP");
    drawSingleYIcon(svg, width * 0.3, 450, "i10");
    setUpSingleLineGraph(svg, width * 0.3, 450, "ENFP", enfpData, tooltip, "% of records that are inflow activities: ", "% of records");

    let entpData = getDataByPTypeValue(everyoneData, typesData, "ENTP", "Understanding and advancing the welfare of all people");
    displayPersonalityTitle(svg, width * 0.7, 450, "ENTP: Knowledgable");
    displayerPersonalityIcon(svg, width * 0.7, 450, "ENTP");
    drawSingleYIcon(svg, width * 0.7, 450, "welfare");
    setUpSingleLineGraph(svg, width * 0.7, 450, "ENTP", entpData, tooltip, "% of participants who value understanding and advancing the welfare of all people: ", "% of participants");

    setUpLeftPersonalityTitleIcon(svg, "intuitors", "The Intuitors");
}

function drawFeelerThinkerVis(svgClass, everyoneData, personalityData, typesData) {
    let svg = d3.select(svgClass);
    let tooltip = addTooltip("feelerthinkerTooltip");

    let isfpData = getDataByPType(everyoneData, typesData, "ISFP", communicationList, getPersonDataByActivities)
    displayPersonalityTitle(svg, width * 0.15, 100, "ISFP: Fiercely Independent");
    displayerPersonalityIcon(svg, width * 0.15, 100, "ISFP");
    drawMultipleYIcons(svg, width * 0.15, 100, communicationList);
    setUpSingleLineGraph(svg, width * 0.15, 100, "ISFP", isfpData, tooltip, "% of records that are considered a form of communication: ", "% of records");

    let infpData = getDataByPTypeValue(everyoneData, typesData, "INFP", "Enjoying life");
    displayPersonalityTitle(svg, width * 0.55, 100, "INFP: Open-Minded & Flexible");
    displayerPersonalityIcon(svg, width * 0.55, 100, "INFP");
    drawSingleYIcon(svg, width * 0.55, 100, "enjoying life");
    setUpSingleLineGraph(svg, width * 0.55, 100, "INFP", infpData, tooltip, "% of participants who value exploring and enjoying life: ", "% of participants");

    let esfjDataBad = getDataByPType(everyoneData, typesData, "ESFJ", communicationList, getPersonDataByActivitiesAndMood, ["Bad"])
    let esfjDataAwful = getDataByPType(everyoneData, typesData, "ESFJ", communicationList, getPersonDataByActivitiesAndMood, ["Awful"])
    displayPersonalityTitle(svg, width * 0.15, 450, "ESFJ: Sensitive & Warm");
    displayerPersonalityIcon(svg, width * 0.15, 450, "ESFJ");
    drawMultipleYIcons(svg, width * 0.15, 450, communicationList);
    setUpMultipleLinesGraph(svg, width * 0.15, 450, "ESFJ", esfjDataBad, esfjDataAwful, tooltip, " % of records that are “bad” or “awful” for any form of communication: ", "% of records");
    console.log(esfjDataBad);
    console.log(esfjDataAwful);

    let enfjData = getDataByPTypePData(everyoneData, typesData, personalityData, "ENFJ", "Do you prefer breadth or depth in life?", "Depth");
    displayPersonalityTitle(svg, width * 0.55, 450, "ENFJ: Tolerant & Reliable");
    displayerPersonalityIcon(svg, width * 0.55, 450, "ENFJ");
    drawSingleYIcon(svg, width * 0.55, 450, "Depth");
    setUpSingleLineGraph(svg, width * 0.55, 450, "ENFJ", enfjData, tooltip, "% of participants who prefer depth over breadth: ", "% of participants");

    setUpLeftPersonalityTitleIcon(svg, "feelers", "The Feelers");
    setUpRightPersonalityTitleIcon(svg, "thinkers", "The Thinkers");
}

function drawObserverVis(svgClass, everyoneData, personalityData, typesData) {
    let svg = d3.select(svgClass);
    // excluding rest, self-care, eating and drinking
    let exclusionList = ["i8:", "i3:", "i9:"];
    let tooltip = addTooltip("observerTooltip");


    let istjData = getDataByPTypePData(everyoneData, typesData, personalityData, "ISTJ", "What do you spend most of your time doing?", "Working for a company");
    displayPersonalityTitle(svg, width * 0.3, 100, "ISTJ: Loyal to structured organizations");
    displayerPersonalityIcon(svg, width * 0.3, 100, "ISTJ");
    drawSingleYIcon(svg, width * 0.3, 100, "Company");
    setUpSingleLineGraph(svg, width * 0.3, 100, "ISTJ", istjData, tooltip, "% of participants who work at a company: ", "% of participants");


    let isfjDataGood = getDataByPType(everyoneData, typesData, "ISFJ", isfjActList, getPersonDataByActivitiesAndMood, ["Good"]);
    let isfjDataOk = getDataByPType(everyoneData, typesData, "ISFJ", isfjActList, getPersonDataByActivitiesAndMood, ["Ok"]);
    displayPersonalityTitle(svg, width * 0.7, 100, "ISFJ: Practical & Altruistic");
    displayerPersonalityIcon(svg, width * 0.7, 100, "ISFJ");
    drawSingleYIcon(svg, width * 0.68, 100, isfjActList[0]);
    drawSingleYIcon(svg, width * 0.72, 100, isfjActList[1]);
    setUpMultipleLinesGraph(svg, width * 0.7, 100, "ISFJ", isfjDataGood, isfjDataOk, tooltip, "% of “good” and “ok” records for manual work and logistical activities: ", "% of records");

    displayPersonalityTitle(svg, width * 0.3, 450, "ESTP: Not found in the data");
    svg.append("image")
        .attr('xlink:href', 'images/ESTP.svg')
        .attr("x", width * 0.3 + mWidth / 2 - (iconDim / 2))
        .attr("y", 450 + 10)
        .attr("width", iconDim)
        .attr("height", iconDim);

    let esfpData = getDataByPTypeValue(everyoneData, typesData, "ESFP", "Adhering to my culture or religion");
    displayPersonalityTitle(svg, width * 0.7, 450, "ESFP: Bold");
    displayerPersonalityIcon(svg, width * 0.7, 450, "ESFP");
    drawSingleYIcon(svg, width * 0.7, 450, "religion");
    setUpSingleLineGraph(svg, width * 0.7, 450, "ESFP", esfpData, tooltip, "% of participants who value adherence to a culture or religion: ", "% of participants");

    setUpLeftPersonalityTitleIcon(svg, "observers", "The Observers");
}

function drawPersonalityKey(svgClass) {
    let svg = d3.select(svgClass);

    svg.append("text")
        .attr("x", width * 0.3)
        .attr("y", height * 0.25)
        .text("PERSONALITY DIMENSIONS")
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);

    svg.append("image")
        .attr('xlink:href', 'images/Thinking.svg')
        .attr("x", width * 0.05)
        .attr("y", height * 0.35)
        .attr("width", 100)
        .attr("height", 100);
    addTextLabel(svg, width * 0.05 + 50, height * 0.35 + 100 + 20, "thinking");

    svg.append("image")
        .attr('xlink:href', 'images/Feeling.svg')
        .attr("x", width * 0.20)
        .attr("y", height * 0.35)
        .attr("width", 100)
        .attr("height", 100);
    addTextLabel(svg, width * 0.20 + 50, height * 0.35 + 100 + 20, "feeling");


    svg.append("image")
        .attr('xlink:href', 'images/Intuition.svg')
        .attr("x", width * 0.35)
        .attr("y", height * 0.35)
        .attr("width", 100)
        .attr("height", 100);
    addTextLabel(svg, width * 0.35 + 100 + 20, height * 0.35 + 50, "intuition", false);

    svg.append("image")
        .attr('xlink:href', 'images/Perceiving.svg')
        .attr("x", width * 0.05)
        .attr("y", height * 0.57)
        .attr("width", 100)
        .attr("height", 100);
    addTextLabel(svg, width * 0.05 + 50, height * 0.57 + 100 + 20, "perceiving");

    svg.append("image")
        .attr('xlink:href', 'images/Judging.svg')
        .attr("x", width * 0.20)
        .attr("y", height * 0.57)
        .attr("width", 100)
        .attr("height", 100);
    addTextLabel(svg, width * 0.20 + 50, height * 0.57 + 100 + 20, "judging");

    svg.append("image")
        .attr('xlink:href', 'images/Observing.svg')
        .attr("x", width * 0.35)
        .attr("y", height * 0.47)
        .attr("width", 100)
        .attr("height", 100);
    addTextLabel(svg, width * 0.35 + 100 + 20, height * 0.47 + 50, "observing", false);

    svg.append("image")
        .attr('xlink:href', 'images/Introversion.svg')
        .attr("x", width * 0.355)
        .attr("y", height * 0.63)
        .attr("width", 25)
        .attr("height", 25);
    svg.append("image")
        .attr('xlink:href', 'images/Extroversion.svg')
        .attr("x", width * 0.405)
        .attr("y", height * 0.63)
        .attr("width", 25)
        .attr("height", 25);
    addTextLabel(svg, width * 0.34, height * 0.6, "introversion", false);
    addTextLabel(svg, width * 0.4, height * 0.7, "extroversion", false);

    svg.append("image")
        .attr('xlink:href', 'images/ESTP.svg')
        .attr("x", width * 0.3 - 75)
        .attr("y", height * 0.85)
        .attr("width", 150)
        .attr("height", 150);
    addTextLabel(svg, width * 0.2 - 20, height * 0.85, "example:", false);
    addTextLabel(svg, width * 0.2 - 20, height * 0.85 + 15, "ESTP", false);

    addTextLabel(svg, width * 0.7, height * 0.53, "We categorized personality types by", false);
    addTextLabel(svg, width * 0.7, height * 0.53 + 15, "their dominant function.", false);
}

function addTextLabel(svg, x, y, text, isMiddle = true) {
    svg.append("text")
        .attr("x", x)
        .attr("y", y)
        .text(text)
        .style("font-family", "Courier new")
        .style("text-anchor", function() {
            if (isMiddle) return "middle"
            return "left"
        })
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);
}

function setUpSingleLineGraph(svg, x, y, personality, data, tooltip, tooltipText, yLabel = "") {
    // add group label
    svg.append("text")
        .attr("x", x + mWidth * 0.7)
        .attr("y", y + mHeight + 15)
        .text("group")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 11)
        .style("fill", textColor);

    // display y axis label
    svg.append("text")
        .attr("x", x + mWidth * 0.25)
        .attr("y", y + 30)
        .text(yLabel)
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("font-size", 10)
        .style("fill", textColor);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max([data[0].percent, data[1].percent])])
        .range([y + mHeight - 10, y + 30]);

    // draw line 
    svg.selectAll('.bars')
        .data(data)
        .enter()
        .append("line")
        .attr("x1", function(d, i) {
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i - 5;
        })
        .attr("x2", function(d, i) {
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i - 5;
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

    // draw tooltip areas
    svg.selectAll('.tooltip')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', function(d, i) {
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i - 5 - 10;
        })
        .attr('y', function(d) {
            return yScale(d.percent);
        })
        .attr('width', 20)
        .attr('height', function(d) {
            return yScale(0) - yScale(d.percent);
        })
        .style('opacity', 0)
        .on("mousemove", function(d, i) {
            let titleText = (i == 0) ? personality : "GROUP";
            let text = "<b>" + titleText + "</b></br></br>" +
                tooltipText + (d.percent * 100).toFixed(2) + "%";
            setTooltipText(tooltip, text, 20, 270, "uppercase");
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });
}

function setUpMultipleLinesGraph(svg, x, y, personality, data1, data2, tooltip, tooltipText, yLabel = "") {
    // add group label
    svg.append("text")
        .attr("x", x + mWidth * 0.7)
        .attr("y", y + mHeight + 15)
        .text("group")
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 11)
        .style("fill", textColor);

    // display y axis label
    svg.append("text")
        .attr("x", x + mWidth * 0.25)
        .attr("y", y + 30)
        .text(yLabel)
        .style("font-family", "Courier new")
        .style("text-anchor", "end")
        .style("font-size", 10)
        .style("fill", textColor);

    let yScale = d3.scaleLinear()
        .domain([0, d3.max(data1.concat(data2), function(d) { return d.percent; })])
        .range([y + mHeight - 10, y + 30]);

    // draw data1 lines 
    svg.selectAll('.bars')
        .data(data1)
        .enter()
        .append("line")
        .attr("x1", function(d, i) {
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i - 10;
        })
        .attr("x2", function(d, i) {
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i - 10;
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
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i;
        })
        .attr("x2", function(d, i) {
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 * i;
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

    // tooltip for group
    svg.append('rect')
        .attr('x', function(d, i) {
            return x + mWidth / 4 + iconDim / 2 + mWidth * 0.3 - 15;
        })
        .attr('y', function(d) {
            return yScale(Math.max(0.02, data1[1].percent));
        })
        .attr('width', 20)
        .attr('height', function(d) {
            return yScale(0) - yScale(Math.max(0.02, data1[1].percent));
        })
        .style('opacity', 0)
        .on("mousemove", function() {
            let titleText = "GROUP";
            let text = "<b>" + titleText + "</b></br></br>" +
                tooltipText + ((data1[1].percent + data2[1].percent) * 100).toFixed(2) + "%";
            setTooltipText(tooltip, text, 20, 270);
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });

    // tooltip for personality
    svg.append('rect')
        .attr('x', function(d, i) {
            return x + mWidth / 4 + iconDim / 2 - 15;
        })
        .attr('y', function(d) {
            return yScale(Math.max(0.02, data1[0].percent));
        })
        .attr('width', 20)
        .attr('height', function(d) {
            return yScale(0) - yScale(Math.max(0.02, data1[0].percent));
        })
        .style('opacity', 0)
        .on("mousemove", function() {
            let titleText = personality;
            let text = "<b>" + titleText + "</b></br></br>" +
                tooltipText + ((data1[0].percent + data2[0].percent) * 100).toFixed(2) + "%";
            setTooltipText(tooltip, text, 20, 270);
        }).on("mouseout", function(d) {
            tooltip.style("visibility", "hidden");
        });


}

function setUpLeftPersonalityTitleIcon(svg, img, title) {
    svg.append("text")
        .attr("x", width * 0.07)
        .attr("y", height * 0.5)
        .text(title)
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);

    svg.append("image")
        .attr('xlink:href', 'images/' + img + '.svg')
        .attr("x", width * 0.03)
        .attr("y", height * 0.53)
        .attr("width", 75)
        .attr("height", 75);
}

function setUpRightPersonalityTitleIcon(svg, img, title) {
    svg.append("text")
        .attr("x", width * 0.95)
        .attr("y", height * 0.5)
        .text(title)
        .style("font-family", "Courier new")
        .style("text-anchor", "middle")
        .style("font-weight", "bold")
        .style("font-size", 12)
        .style("fill", textColor);

    svg.append("image")
        .attr('xlink:href', 'images/' + img + '.svg')
        .attr("x", width * 0.91)
        .attr("y", height * 0.53)
        .attr("width", 75)
        .attr("height", 75);
}

function displayPersonalityTitle(svg, x, y, title) {
    svg.append("text")
        .attr("x", x + mWidth / 2)
        .attr("y", y)
        .text(title)
        .style("font-family", "Courier new")
        .style("font-weight", "bold")
        .style("text-anchor", "middle")
        .style("font-size", 11)
        .style("fill", textColor);
}

function displayerPersonalityIcon(svg, x, y, personality) {
    svg.append("image")
        .attr('xlink:href', 'images/' + personality + '.svg')
        .attr("x", x + mWidth / 4)
        .attr("y", y + mHeight)
        .attr("width", iconDim)
        .attr("height", iconDim);
}

function drawSingleYIcon(svg, x, y, icon) {
    svg.append("image")
        .attr('xlink:href', 'images/' + icon + '.svg')
        .attr("x", x + mWidth * 0.05)
        .attr("y", y + mHeight / 2)
        .attr("width", iconDim / 2)
        .attr("height", iconDim / 2)
        .style("filter", "url(#Grey)");
}

function drawMultipleYIcons(svg, x, y, list) {
    //top row
    for (var i = 0; i < 3; i++) {
        svg.append("image")
            .attr('xlink:href', 'images/' + list[i] + '.svg')
            .attr("x", x + mWidth * (0.01 + i * 0.08))
            .attr("y", y + mHeight / 3)
            .attr("width", iconDim / 3)
            .attr("height", iconDim / 3)
            .style("filter", "url(#Grey)");
    }

    for (var i = 3; i < 5; i++) {
        svg.append("image")
            .attr('xlink:href', 'images/' + list[i] + '.svg')
            .attr("x", x + mWidth * (0.01 + (i - 2) * 0.08))
            .attr("y", y + mHeight / 3 + iconDim / 3)
            .attr("width", iconDim / 3)
            .attr("height", iconDim / 3)
            .style("filter", "url(#Grey)");
    }
}