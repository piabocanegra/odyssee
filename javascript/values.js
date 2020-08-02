/**
 *   svgClass: tag for svg class, must include the '.'
 *   timeData: time data for records
 *   returns void, draws data vis for values.
 */
function drawValuesVis(svgClass, ikigaiData, typesData, everyoneData, personalityData) {
    let svg = d3.select(svgClass);
    let height = svg.attr("height");
    let width = svg.attr("width");
    let titleVerticalPadding = 70;
    let legendVerticalPadding = padding * 2.5;
    let verticalPadding = 72;
    let lineWidth = 2;
    let valueImageSize = 48;
    let imageSize = 56;
    let horizontalPadding = 24;

    console.log(personalityData);

    drawTitle(svg, "Values");
    console.log(typesData);
    console.log(ikigaiData);
    console.log(everyoneData);
    let valueCountMap = {};

    let personalityShorttoLong = {
        "I": "Introversion",
        "E": "Extroversion",
        "S": "Observing",
        "N": "Intuition",
        "T": "Thinking",
        "F": "Feeling",
        "J": "Judging",
        "P": "Prospecting",
    }

    let valueLongtoShort = {
        "Achieving stability of society, of relationships, and of self": "Stability",
        "Enjoying life": "enjoying life",
        "Looking out for my family, friends, and community": "Looking out",
        "Achieving personal success": "Personal Success",
    }

    function incrementMapCount(map, key) {
        let count = map[key];
        map[key] = count == null ? 1 : count + 1;
        return map;
    }

    function getPersonalityMultiples(totalData, usersOfGroup, traitKey, emailKey) {
        let countKey = "count"
        let countMap = {
            group: {},
            total: {}
        };

        totalData.forEach(d => {
            d[traitKey].split("").forEach(trait => {
                incrementMapCount(countMap.total, trait); // Increment total data.
                incrementMapCount(countMap.total, countKey);
                if (usersOfGroup.includes(d[emailKey])) {
                    incrementMapCount(countMap.group, trait); // Increment group's data.
                    incrementMapCount(countMap.group, countKey);
                }
            });
        });

        Object.keys(countMap).forEach(type => {
            Object.keys(countMap[type]).filter(key => { return key != countKey }).forEach(key => {
                // Divide by number of total data for group.
                countMap[type][key] = countMap[type][key] / countMap[type][countKey];
            });
        });

        console.log("Percentage in category: ")
        console.log(countMap)

        let categoryCountMap = {};
        Object.keys(countMap.total).filter(key => { return key != countKey && key != "X" }).forEach(key => {
            countMap.group[key] = countMap.group[key] == undefined ? 0 : countMap.group[key];
            categoryCountMap[key] = countMap.group[key] / countMap.total[key];
        });
        console.log("Percentage in group / Percentage in total: ")
        console.log(categoryCountMap)
        return categoryCountMap;
    }

    function getCategoryRepresentedMultiples(totalData, usersOfGroup, category, emailKey) {
        let countKey = "count"
        let countMap = {
            group: {},
            total: {}
        };

        totalData.forEach(d => {
            incrementMapCount(countMap.total, d[category]); // Increment total data.
            incrementMapCount(countMap.total, countKey);
            if (usersOfGroup.includes(d[emailKey])) {
                incrementMapCount(countMap.group, d[category]); // Increment group's data.
                incrementMapCount(countMap.group, countKey);
            }
        });
        Object.keys(countMap).forEach(type => {
            Object.keys(countMap[type]).filter(key => { return key != countKey }).forEach(key => {
                // Divide by number of total data for group.
                countMap[type][key] = countMap[type][key] / countMap[type][countKey];
            });
        });
        let categoryCountMap = {};
        Object.keys(countMap.total).filter(key => { return key != countKey }).forEach(key => {
            countMap.group[key] = countMap.group[key] == undefined ? 0 : countMap.group[key];
            categoryCountMap[key] = countMap.group[key] / countMap.total[key];
        });
        return categoryCountMap;
    }

    function getMinMaxOfCountMap(countMap) {
        let max = d3.max(Object.keys(countMap), d => { return countMap[d] });
        let min = d3.min(Object.keys(countMap), d => { return countMap[d] });
        let maxCategory = Object.keys(countMap).find(d => { return max == countMap[d] });
        let minCategory = Object.keys(countMap).find(d => { return min == countMap[d] });
        return {
            min: minCategory,
            max: maxCategory
        }
    }

    typesData.forEach(d => {
        incrementMapCount(valueCountMap, d[keys.types.value]);
    });

    let mostFrequentValues = Object.keys(valueCountMap).map(key => {
        return { value: key, count: valueCountMap[key] };
    }).sort((a, b) => {
        return b.count - a.count; // Sort values by user count.
    }).slice(0, 4); // Top 4 most frequent values.
    mostFrequentValues.forEach(v => {
        let users = typesData.filter(d => { return d[keys.types.value] == v.value }).map(d => { return d[keys.types.email] });
        let activityMultiples = getCategoryRepresentedMultiples(everyoneData, users, keys.everyone.activity, keys.everyone.email);
        let attitudeMultiples = getCategoryRepresentedMultiples(everyoneData, users, keys.everyone.attitude, keys.everyone.email);
        let ikigaiMultiples = getCategoryRepresentedMultiples(ikigaiData, users, keys.ikigai.category, keys.ikigai.email);
        let occupationMultiples = getCategoryRepresentedMultiples(typesData, users, keys.types.occupation, keys.types.email);
        let personalityMultiples = getPersonalityMultiples(typesData, users, keys.types.personality, keys.types.email);
        console.log(personalityMultiples);
        v.users = users;
        v.activity = activityMultiples;
        v.attitude = attitudeMultiples;
        v.ikigai = ikigaiMultiples;
        v.occupation = occupationMultiples;
        v.personality = personalityMultiples;
    });

    console.log(mostFrequentValues);

    let graphStart = titleVerticalPadding + verticalPadding;
    let graphEnd = height - legendVerticalPadding - valueImageSize - verticalPadding;
    let graphHeight = Math.floor((graphEnd - graphStart) / 4);
    let valueYScale = d3.scaleLinear()
        .domain([0, 3])
        .range([graphStart, graphEnd]);

    let ikigaiWidth = 200;
    let maxUserCount = d3.max(mostFrequentValues, d => { return d.count });
    let minUserCount = d3.min(mostFrequentValues, d => { return d.count });
    let staticWidth = valueImageSize + horizontalPadding * 4 + imageSize * 2;
    let lengthXScale = d3.scaleLinear()
        .domain([minUserCount, maxUserCount])
        .range([staticWidth + ikigaiWidth, width - imageSize]);
    let ikigaiXScale = d3.scaleBand()
        .domain(ikigaiGroups)
        .range([staticWidth, staticWidth + ikigaiWidth]);

    mostFrequentValues.forEach((d, i) => {
        let y = valueYScale(i);
        let underOverRepActivities = getMinMaxOfCountMap(d.activity);
        Object.keys(underOverRepActivities).forEach(key => {
            underOverRepActivities[key] = underOverRepActivities[key].substring(0, 2);
        });
        let underOverRepOccupation = getMinMaxOfCountMap(d.occupation);
        svg.append("image")
            .attr("xlink:href", "images/" + valueLongtoShort[d.value] + ".svg")
            .attr("x", 0)
            .attr("y", y - valueImageSize / 2)
            .attr("width", valueImageSize)
            .attr("height", valueImageSize);
        svg.append("line")
            .attr("x1", valueImageSize + horizontalPadding)
            .attr("x2", lengthXScale(d.count) + imageSize)
            .attr("y1", y)
            .attr("y2", y)
            .attr("stroke", "lightgrey")
            .attr("stroke-width", lineWidth)
            .attr("stroke-linecap", "round")
            .style("stroke-dasharray", dashArray[getMinMaxOfCountMap(d.attitude).max]);
        svg.append("image")
            .attr("xlink:href", "images/" + occupationLongtoShort[underOverRepOccupation.max] + ".svg")
            .attr("x", valueImageSize + horizontalPadding * 2)
            .attr("y", y - imageSize)
            .attr("width", imageSize)
            .attr("height", imageSize)
            .attr("transform", "rotate(180 " + (valueImageSize + horizontalPadding * 2 + imageSize / 2) + " " + (y - imageSize / 2) + ")");
        svg.append("image")
            .attr("xlink:href", "images/" + occupationLongtoShort[underOverRepOccupation.min] + ".svg")
            .attr("x", valueImageSize + horizontalPadding * 2)
            .attr("y", y)
            .attr("width", imageSize)
            .attr("height", imageSize);
        svg.append("image")
            .attr("xlink:href", "images/" + underOverRepActivities.max + ".svg")
            .attr("x", valueImageSize + horizontalPadding * 3 + imageSize)
            .attr("y", y - imageSize)
            .attr("width", imageSize)
            .attr("height", imageSize)
            .attr("filter", function() { return "url(#Grey)"; });
        svg.append("image")
            .attr("xlink:href", "images/" + underOverRepActivities.min + ".svg")
            .attr("x", valueImageSize + horizontalPadding * 3 + imageSize)
            .attr("y", y)
            .attr("width", imageSize)
            .attr("height", imageSize)
            .attr("filter", function() { return "url(#Grey)"; });

        let ikigaiRadius = 5;
        let averageIkigai = getAverageFromList(Object.keys(d.ikigai).map(key => { return d.ikigai[key] }));
        let underOverRepIkigai = getMinMaxOfCountMap(d.ikigai);
        let minIkigaiCount = d.ikigai[underOverRepIkigai.min];
        let maxIkigaiCount = d.ikigai[underOverRepIkigai.max];
        let domainRange = Math.max(maxIkigaiCount - averageIkigai, averageIkigai - minIkigaiCount);
        let ikigaiYScale = d3.scaleLinear()
            .domain([averageIkigai - domainRange, averageIkigai + domainRange])
            .range([y - graphHeight / 2 + ikigaiRadius, y + graphHeight / 2 - ikigaiRadius]);

        ikigaiGroups.forEach(i => {
            if (d.ikigai[i] == undefined) {
                // Handle no data.
                d.ikigai[i] = averageIkigai;
                svg.append("circle")
                    .attr("cx", ikigaiXScale(i))
                    .attr("cy", ikigaiYScale(d.ikigai[i]))
                    .attr("r", ikigaiRadius - lineWidth / 2)
                    .attr("fill", "none")
                    .attr("stroke", ikigaiColorHexArray[i])
                    .attr("stroke-width", lineWidth);
            } else {
                svg.append("circle")
                    .attr("cx", ikigaiXScale(i))
                    .attr("cy", ikigaiYScale(d.ikigai[i]))
                    .attr("r", ikigaiRadius)
                    .attr("fill", ikigaiColorHexArray[i]);
            }
        });
        console.log(d.value + ": " + getMinMaxOfCountMap(d.personality).max)
        svg.append("image")
            .attr("xlink:href", "images/" + personalityShorttoLong[getMinMaxOfCountMap(d.personality).max] + ".svg")
            .attr("x", lengthXScale(d.count))
            .attr("y", y - imageSize)
            .attr("width", imageSize)
            .attr("height", imageSize);
    });

    let colorLegendAttr = {
        x: padding,
        y: height - padding * 2.5,
        width: 100,
        circleRadius: 4,
        verticalPadding: 18,
        horizontalPadding: 16
    }

    let colorLegend = svg.append('g')
        .attr('width', colorLegendAttr.width)
        .attr('transform', 'translate(' + colorLegendAttr.x + ',' + colorLegendAttr.y + ')');

    drawIkigaiColorLegend(colorLegend, colorLegendAttr);

}