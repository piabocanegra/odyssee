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

    svg.append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("r", circleRadius)

    svg.append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("r", circleRadius + circleRadiusIncrement)

    svg.append("circle")
        .attr("cx", center.x)
        .attr("cy", center.y)
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("r", circleRadius + circleRadiusIncrement * 2)

    svg.append("text")
        .attr("x", center.x)
        .attr("y", center.y + circleRadius + circleRadiusIncrement - 12)
        .text("short-term")
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

    svg.append("text")
        .attr("x", center.x)
        .attr("y", center.y + circleRadius + circleRadiusIncrement * 2 - 12)
        .text("long-term")
        .style("text-anchor", "middle")
        .style("font-family", "Courier new")
        .style("fill", textColor)
        .style("font-size", 12);

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

    let circleRadius = 180;
    let circleRadiusIncrement = 120;

    let categories = ["relationships", "health", "work", "logistical"]

    let categoryShortToLongMap = {
        "work": "Work/School",
        "health": "Health & well-being",
        "relationships": "Relationships",
        "logistical": "Logistical"
    }

    let negativeMoods = ["Awful", "Bad"]

    let personalityDataEmailKey = "What's your email?";
    let everyoneDataEmailKey = "Email";
    let dailyStressorKey = "Which of the following daily stressors is most significant for you?";
    let longTermStressorKey = "Which of the following long-term stressors is most significant for you?";

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

    let center = {
        x: width / 2,
        y: height / 2
    }

    drawStressorRadialGraphSetup(svg, center, circleRadius, circleRadiusIncrement);

    // For each category stressor tagged by user in personalityData, look through the activity with highest 
    // percentage of bad and awful records. These will be the activities that fall into the group.
    let categoryActivityCountMap = {}
    let categoryActivityMap = {}
    let categoryReasonMap = {}
    let categoryMoodMap = {}

    function getEmailListForCategory(category, personalityDataKey) {
        return personalityData.filter(p => {
            return p[personalityDataKey].includes(categoryShortToLongMap[category]);
        }).map(p => {
            return p[personalityDataEmailKey];
        })
    }

    function updateCategorySubMapCount(map, type, key) {
        let count = map[type][key];
        map[type][key] = count == null ? 1 : count + 1;
    }

    function initializeCountMaps(countMaps) {
        countMaps.forEach(map => {
            map["long"] = {};
            map["short"] = {};
        });
    }

    function updateCountMapFromRecords(records, type, activityCountMap, reasonCountMap, moodCountMap) {
        records.forEach(record => {
            // Only update category maps if record has Bad or Awful for Feeling.
            if (negativeMoods.includes(record["Feeling"])) {
                let activity = record["Activity"].substring(0, 2);
                let reason = record["Reason"];
                let mood = record["Feeling"];

                updateCategorySubMapCount(activityCountMap, type, activity);
                updateCategorySubMapCount(reasonCountMap, type, reason);
                updateCategorySubMapCount(moodCountMap, type, mood);
            }
        });
    }

    // Setup categoryActivityCountMap.
    // Structure - { category: { short: { activity: negative mood count }, long: { ... }} }
    categories.forEach(category => {
        let activityCountMap = {};
        let reasonCountMap = {};
        let moodCountMap = {};
        let countMaps = [activityCountMap, reasonCountMap, moodCountMap];
        initializeCountMaps(countMaps);

        let longTermEmailList = getEmailListForCategory(category, longTermStressorKey);
        let shortTermEmailList = getEmailListForCategory(category, dailyStressorKey);
        let longTermRecords = everyoneData.filter(record => { return longTermEmailList.includes(record[everyoneDataEmailKey]) });
        let shortTermRecords = everyoneData.filter(record => { return shortTermEmailList.includes(record[everyoneDataEmailKey]) });

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

        let innerRadius = circleRadius;
        let outerRadius = {
            long: circleRadius + longTermScale(adjustedPercent.long),
            short: circleRadius + shortTermScale(adjustedPercent.short)
        };
        let iconSize = 48;

        let textAttr = {
            fontSize: 12,
            fontFamily: "Courier new",
            textAnchor: "middle",
            alignment: "middle",
            x: center.x + (innerRadius - 12 - iconSize) * Math.cos(radialScale(category) + Math.PI / 4),
            y: center.y + (innerRadius - 12 - iconSize) * Math.sin(radialScale(category) + Math.PI / 4)
        };

        let angle = radialScale(category) * 180 / Math.PI - 225;
        angle = angle < -45 ? angle + 180 : angle;
        let transform = 'rotate(' + angle + ' ' + (textAttr.x) + ' ' + (textAttr.y) + ')';

        svg.append("text")
            .attr("x", textAttr.x)
            .attr("y", textAttr.y)
            .style("font-family", textAttr.fontFamily)
            .style("font-size", textAttr.fontSize)
            .style("fill", textColor)
            .style("text-anchor", textAttr.textAnchor)
            .style("alignment-baseline", textAttr.alignment)
            .text(category)
            .attr('transform', transform)

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

        drawStressorRadialGraphBar(constants, "long");
        drawStressorRadialGraphBar(constants, "short");
    });
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
    let transform = 'rotate(' + angle + ' ' + (imageAttr.x) + ' ' + (imageAttr.y) + ')';

    svg.append('image')
        .attr('xlink:href', 'images/' + categoryActivityMap[category][type] + '.svg')
        .attr('x', imageAttr.x - iconSize / 2)
        .attr('y', imageAttr.y - iconSize / 2)
        .attr('width', iconSize)
        .attr('height', iconSize)
        .style('filter', function() { return 'url(#' + categoryMoodMap[category][type] + ')'; })
        .attr('transform', transform);

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