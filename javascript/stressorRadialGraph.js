function drawStressorRadialGraphSetup(svg, center, circleRadius, circleRadiusIncrement) {
    let titleAttr = {
        fontSize: 25,
        fontFamily: "Courier new",
        textAnchor: "middle",
        alignment: "middle"
    };

    svg.append("text")
        .attr("x", center.x)
        .attr("y", center.y)
        .text("Stressors")
        .style("font-family", titleAttr.fontFamily)
        .style("font-size", titleAttr.fontSize)
        .style("fill", textColor)
        .style("text-anchor", titleAttr.textAnchor)
        .style("alignment-baseline", titleAttr.alignment);

    svg.append("text")
        .attr("x", center.x)
        .attr("y", center.y + circleRadius + circleRadiusIncrement - 12)
        .text("short-term")
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

    drawImperfectCircle(svg, center, circleRadius + circleRadiusIncrement, { strokeWidth: 1.5 });

    svg.append("text")
        .attr("x", center.x)
        .attr("y", center.y + circleRadius + circleRadiusIncrement * 2 - 12)
        .text("long-term")
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

    drawImperfectCircle(svg, center, circleRadius + circleRadiusIncrement * 2, { strokeWidth: 1.5 });
}

/**
 *   svgClass: tag for svg class, must include the "."
 *   categoryMap: map of short activity keys ("b5") to frequency 
 *   categoryFullMap: map of full activity keys ("Intellectual") to frequency
 *   title: title of graph
 *   personData: list of data entries
 *   returns void, draws data vis for line bar chart
 */
function drawStressorRadialGraph(svgClass, everyoneData, personalityData) {
    let svg = d3.select(svgClass);
    let height = svg.attr("height");
    let width = svg.attr("width");
    console.log(personalityData);
    console.log(everyoneData);

    let circleRadius = 160;
    let circleRadiusIncrement = 100;

    let center = {
        x: width / 2,
        y: (height - padding * 2.5) / 2
    };

    // Setup scales.
    let radialScale = d3.scaleBand()
        .domain(categories)
        .range([0, Math.PI * 2]);

    let longTermScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, circleRadiusIncrement * 2]);

    let shortTermScale = d3.scaleLinear()
        .domain([0, 1])
        .range([0, circleRadiusIncrement]);

    drawStressorRadialGraphSetup(svg, center, circleRadius, circleRadiusIncrement);

    // For each category stressor tagged by user in personalityData, look through the activity with highest 
    // percentage of bad and awful records. These will be the activities that fall into the group.
    let categoryActivityCountMap = {};
    let categoryActivityMap = {};
    let categoryReasonMap = {};
    let categoryMoodMap = {};

    // Setup categoryActivityCountMap.
    // Structure - { category: { short: { activity: negative mood count }, long: { ... }} }
    categories.forEach(category => {
        let activityCountMap = {};
        let reasonCountMap = {};
        let moodCountMap = {};
        let countMaps = [activityCountMap, reasonCountMap, moodCountMap];
        initializeCountMaps(countMaps);

        let longTermEmailList = getEmailListForCategory(personalityData, category, keys.personality.longTermStressor);
        let shortTermEmailList = getEmailListForCategory(personalityData, category, keys.personality.shortTermStressor);
        let longTermRecords = everyoneData.filter(record => { return longTermEmailList.includes(record[keys.everyone.email]) });
        let shortTermRecords = everyoneData.filter(record => { return shortTermEmailList.includes(record[keys.everyone.email]) });

        updateCountMapFromRecords(longTermRecords, "long", activityCountMap, reasonCountMap, moodCountMap);
        updateCountMapFromRecords(shortTermRecords, "short", activityCountMap, reasonCountMap, moodCountMap);

        categoryActivityCountMap[category] = activityCountMap;
        categoryReasonMap[category] = reasonCountMap;
        categoryMoodMap[category] = moodCountMap;
        categoryActivityMap[category] = {};
    });

    function updateActivityCountPercentage(category, type, categoryPercentMap) {
        let activityCountMap = categoryActivityCountMap[category][type];
        let totalCount = Object.keys(activityCountMap).reduce((acc, key) => {
            return acc + activityCountMap[key];
        }, 0);
        let maxNegativeActivityCount = d3.max(Object.keys(activityCountMap), key => { return activityCountMap[key]; });
        let negativePercentage = maxNegativeActivityCount / totalCount;
        categoryPercentMap[category][type] = negativePercentage;
    }

    // Calculate bad/awful activity percentage of category.
    let categoryPercentMap = {};
    categories.forEach(category => {
        categoryPercentMap[category] = {};
        updateActivityCountPercentage(category, "long", categoryPercentMap);
        updateActivityCountPercentage(category, "short", categoryPercentMap);
    });

    function updateCategoryMaxValue(category, type, countMap, updateMap = countMap) {
        let map = countMap[category][type];
        let maxNegativeCount = d3.max(Object.keys(map), key => { return map[key]; });
        let maxNegativeValue = Object.keys(map).find(key => {
            return map[key] == maxNegativeCount;
        });
        updateMap[category][type] = maxNegativeValue;
    }

    function updateCategoryNominalValues(category, type) {
        updateCategoryMaxValue(category, type, categoryReasonMap);
        updateCategoryMaxValue(category, type, categoryMoodMap);
        updateCategoryMaxValue(category, type, categoryActivityCountMap, categoryActivityMap);
    }

    // Convert countMaps to point to value most apparent to negative feelings across all activities, but within the same category.
    categories.forEach(category => {
        updateCategoryNominalValues(category, "long");
        updateCategoryNominalValues(category, "short");
    })

    console.log("Activity Maps: ");
    console.log(categoryActivityCountMap);
    console.log(categoryActivityMap);
    console.log("Reason Map: ");
    console.log(categoryReasonMap);
    console.log("Mood Map: ");
    console.log(categoryMoodMap);

    // Adjust percentages amongst all categories so that the category with max negative activity percentage is 1.
    let longTermMaxPercent = d3.max(categories, category => { return categoryPercentMap[category]["long"]; });
    let shortTermMaxPercent = d3.max(categories, category => { return categoryPercentMap[category]["short"]; });

    categories.forEach(category => {
        let adjustedPercent = {
            long: categoryPercentMap[category]["long"] / longTermMaxPercent,
            short: categoryPercentMap[category]["short"] / shortTermMaxPercent
        };
        console.log(category + ": ")
        console.log(categoryPercentMap[category])
        console.log(adjustedPercent)

        let innerRadius = circleRadius;
        let outerRadius = {
            long: circleRadius + longTermScale(adjustedPercent.long),
            short: circleRadius + shortTermScale(adjustedPercent.short)
        };

        let iconSize = 48;

        // Calculate angle in degrees.
        let angle = radialScale(category) * 180 / Math.PI - 225;

        // Add zigzag arc.
        let zigzagPadding = 14;
        let zigzagRadius = circleRadius - iconSize / 2; // Center arc with respect to icons.
        let zigzagAttr = {
            strokeWidth: 1.5,
            stroke: colorHexArray["Awful"],
            maxOffset: 8,
            minAngle: angle + zigzagPadding,
            maxAngle: angle + 90 - zigzagPadding,
        }

        drawZigzagArc(svg, center, zigzagRadius, zigzagAttr);

        // Add text.
        let textAttr = {
            fontSize: 12,
            fontFamily: "Courier new",
            textAnchor: "middle",
            alignment: "middle",
            x: center.x + (innerRadius - 12 - iconSize) * Math.cos(radialScale(category) + Math.PI / 4),
            y: center.y + (innerRadius - 12 - iconSize) * Math.sin(radialScale(category) + Math.PI / 4)
        };

        // Fix angle so that text is oriented upright.
        angle = angle < -45 ? angle + 180 : angle;
        let transform = "rotate(" + angle + " " + (textAttr.x) + " " + (textAttr.y) + ")";

        svg.append("text")
            .attr("x", textAttr.x)
            .attr("y", textAttr.y)
            .style("font-family", textAttr.fontFamily)
            .style("font-size", textAttr.fontSize)
            .style("fill", textColor)
            .style("text-anchor", textAttr.textAnchor)
            .style("alignment-baseline", textAttr.alignment)
            .text(category)
            .attr("transform", transform)

        let constants = {
            svg: svg,
            center: center,
            innerRadius: innerRadius,
            outerRadius: outerRadius,
            radialScale: radialScale,
            category: category,
            categoryMoodMap: categoryMoodMap,
            categoryReasonMap: categoryReasonMap,
            categoryActivityMap: categoryActivityMap,
            iconSize: iconSize
        }

        // Add icons and radial lines.
        drawStressorRadialGraphBar(constants, "long");
        drawStressorRadialGraphBar(constants, "short");
    });

    // Add legend.
    drawStressorRadialGraphLegend(svg, categoryActivityMap, categoryPercentMap);
}

function drawStressorRadialGraphBar(constants, type) {
    // Unwrap constants.
    let svg = constants.svg;
    let center = constants.center;
    let innerRadius = constants.innerRadius;
    let outerRadius = constants.outerRadius;
    let radialScale = constants.radialScale;
    let category = constants.category;
    let categoryMoodMap = constants.categoryMoodMap;
    let categoryReasonMap = constants.categoryReasonMap;
    let categoryActivityMap = constants.categoryActivityMap;
    let iconSize = constants.iconSize;

    let angleOffset = 6 * Math.PI / 180;
    angleOffset = type == "long" ? -angleOffset : angleOffset;

    // Add icons.
    let imagePadding = iconSize / 2;

    let imageAttr = {
        x: center.x + (innerRadius - imagePadding) * Math.cos(radialScale(category) + Math.PI / 4 + angleOffset),
        y: center.y + (innerRadius - imagePadding) * Math.sin(radialScale(category) + Math.PI / 4 + angleOffset),
    };

    let lineAttr = {
        x1: center.x + innerRadius * Math.cos(radialScale(category) + Math.PI / 4 + angleOffset),
        y1: center.y + innerRadius * Math.sin(radialScale(category) + Math.PI / 4 + angleOffset),
        x2: center.x + outerRadius[type] * Math.cos(radialScale(category) + Math.PI / 4 + angleOffset),
        y2: center.y + outerRadius[type] * Math.sin(radialScale(category) + Math.PI / 4 + angleOffset)
    };

    let angle = Math.atan((lineAttr.y2 - lineAttr.y1) / (lineAttr.x2 - lineAttr.x1)) * 180 / Math.PI - 90;
    if (category == "health" || category == "logistical") {
        angle += 180;
    }
    let transform = "rotate(" + angle + " " + (imageAttr.x) + " " + (imageAttr.y) + ")";

    svg.append("image")
        .attr("xlink:href", "images/" + categoryActivityMap[category][type] + ".svg")
        // .attr("xlink:href", "images/" + "b1" + ".svg")
        .attr("x", imageAttr.x - iconSize / 2)
        .attr("y", imageAttr.y - iconSize / 2)
        .attr("width", iconSize)
        .attr("height", iconSize)
        .style("filter", function() { return "url(#" + categoryMoodMap[category][type] + ")"; })
        .attr("transform", transform);

    svg.append("line")
        .attr("x1", lineAttr.x1)
        .attr("x2", lineAttr.x2)
        .attr("y1", lineAttr.y1)
        .attr("y2", lineAttr.y2)
        .attr("stroke", colorHexArray[categoryMoodMap[category][type]])
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-dasharray", dashArray[categoryReasonMap[category][type]]);
}

function drawStressorRadialGraphLegend(svg, categoryActivityMap, categoryPercentMap) {
    let height = svg.attr("height");
    let width = svg.attr("width");
    let interLegendPadding = 24;

    // Draw most negative activity.
    let mostNegAttr = {
        x: padding,
        y: height - padding * 2.5,
        width: width / 3 / 2 - interLegendPadding,
    };
    let mostNegLegend = svg.append("g")
        .attr("width", mostNegAttr.width)
        .attr("transform", "translate(" + mostNegAttr.x + "," + mostNegAttr.y + ")");

    // Add text.
    mostNegLegend.append("text")
        .text("Most negative activity")
        .attr("x", mostNegAttr.width / 2)
        .attr("y", 15)
        .attr("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

    // Setup icon size and filter.
    let iconSize = 36;
    svg.append('filter')
        .attr('id', 'Text')
        .append('feColorMatrix')
        .attr('type', 'matrix')
        .attr('color-interpolation-filters', 'sRGB')
        .attr('values', "0 0 0 0 0.3 0 0 0 0 0.3 0 0 0 0 0.3 0 0 0 1 0");

    // Calculate most negative activity (long-term).
    let longTermMaxPercent = d3.max(categories, category => { return categoryPercentMap[category]["long"]; });

    categories.forEach(category => {
        if (categoryPercentMap[category]["long"] == longTermMaxPercent) {
            // Add icon.
            mostNegLegend.append("image")
                .attr("xlink:href", "images/" + categoryActivityMap[category]["long"] + ".svg")
                .attr("x", mostNegAttr.width / 2 - iconSize / 2)
                .attr("y", (padding * 2.5) / 2 - iconSize / 2 - 12)
                .attr("width", iconSize)
                .attr("height", iconSize)
                .style("filter", function() { return "url(#Text)"; });
        }
    });

    // Draw mood legend.
    let moodLegendAttr = {
        x: width / 3 / 2 + interLegendPadding + padding,
        y: height - padding * 2.5,
        width: width / 3 / 2 - interLegendPadding - padding,
    };
    let moodLegend = svg.append("g")
        .attr("class", "moodLegend")
        .attr("width", moodLegendAttr.width)
        .attr("transform", "translate(" + moodLegendAttr.x + "," + moodLegendAttr.y + ")");

    drawMoodLegend(moodLegend, "Most frequent mood", negativeMoods);

    // Draw line legend.
    let lineLegendAttr = {
        x: width / 3 + padding + interLegendPadding / 2,
        y: height - padding * 2.5,
        width: width / 3 - interLegendPadding,
        textStart: 48
    }

    let lineLegend = svg.append("g")
        .attr("width", lineLegendAttr.width)
        .attr("transform", "translate(" + lineLegendAttr.x + "," + lineLegendAttr.y + ")");

    // Setup curve data.
    let lineGenerator = d3.line()
        .curve(d3.curveCardinal);
    let lineLegendPoints = [
        [0, 0],
        [10, -3.75],
        [20, -5],
        [30, -3.75],
        [40, 0]
    ];
    let lineLegendCurve = lineGenerator(lineLegendPoints);

    // Add lines.
    lineLegend.append("path")
        .attr("d", lineLegendCurve)
        .attr("fill", "none")
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 2.5)
        .attr("transform", "translate(" + 0 + "," + 15 + ")");

    lineLegend.append("line")
        .attr("x1", (lineLegendAttr.textStart - 8) / 2)
        .attr("x2", (lineLegendAttr.textStart - 8) / 2)
        .attr("y1", 15 + 35)
        .attr("y2", 15 + 35 + 16 * 2)
        .attr("stroke", textColor)
        .attr("stroke-width", 2.5)
        .style("stroke-linecap", "round")
        .style("stroke-dasharray", dashArray["I have to"]);

    // Add text.
    lineLegend.append("text")
        .text("border represents ratio of 1")
        .attr("x", lineLegendAttr.textStart)
        .attr("y", 15)
        .attr("width", width / 3)
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);
    lineLegend.append("text")
        .text("length represents")
        .attr("x", lineLegendAttr.textStart)
        .attr("y", 15 + 35)
        .attr("width", width / 3)
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);
    lineLegend.append("text")
        .text("ratio of Bad/Awful records")
        .attr("x", lineLegendAttr.textStart)
        .attr("y", 15 + 35 + 16)
        .attr("width", width / 3)
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);
    lineLegend.append("text")
        .text("to total records")
        .attr("x", lineLegendAttr.textStart)
        .attr("y", 15 + 35 + 16 * 2)
        .attr("width", width / 3)
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

    // Draw attitude legend.
    let attitudeLegendAttr = {
        x: width / 3 * 2 + interLegendPadding / 2 + padding,
        y: height - padding * 2.5,
        width: width / 3 - interLegendPadding * 2 - padding,
    };
    let attitudeLegend = svg.append("g")
        .attr("class", "attitudeLegend")
        .attr("width", attitudeLegendAttr.width)
        .attr("transform", "translate(" + attitudeLegendAttr.x + "," + attitudeLegendAttr.y + ")");

    drawAttitudeLegend(attitudeLegend, "Most frequent attitude", attitudeList);
}