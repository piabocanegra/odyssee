/**
 *   svgClass: tag for svg class, must include the '.'
 *   timeData: time data for records
 *   returns void, draws data vis for Morning vs. Night people
 */
function drawMorningNightVis(svgClass, timeData) {
    let svg = d3.select(svgClass);
    let height = svg.attr('height');
    let width = svg.attr('width');
    drawTitle(svg, 'Morning vs. Night people');

    let graphAttr = {
        x: padding,
        y: 90,
        yIncrement: 56,
        height: height - 7 * padding,
        width: width - 2 * padding,
        verticalPadding: 28,
        horizontalPadding: 56
    }

    let morningNightGraph = svg.append("g")
        .attr("transform", "translate(" + graphAttr.x + ", " + graphAttr.y + ")");

    let dateTimeParser = d3.timeParse("%m/%d/%y %H:%M %p");

    // Setup map.
    let timeMap = {};
    for (let i = 0; i < 24; i++) {
        timeMap[i] = [];
    }
    timeData.forEach(d => {
        let record = d;
        let dateTime = dateTimeParser(d[keys.time.dateTime]);
        record.dateTime = dateTime;
        let hour = dateTime.getHours();
        let hourFromFive = hour < 5 ? (19 + hour) : (hour - 5);
        record.hourFromFive = hourFromFive;
        timeMap[hourFromFive].push(record);
    });

    // Setup scales.
    let moodYScale = d3.scaleLinear()
        .domain([moodToScore["Awful"], moodToScore["Amazing"]])
        .range([graphAttr.height - 2 * graphAttr.verticalPadding, graphAttr.verticalPadding]);

    let timeXScale = d3.scaleTime()
        .domain([0, 24])
        .range([graphAttr.horizontalPadding, graphAttr.width - graphAttr.horizontalPadding]);

    // morning (5am - 11:59 am), afternoon (12:00pm - 4:59pm), evening (5:00pm - 8:59pm), night (9:00pm - 4:59am).
    let timeSegments = {
        morning: { title: "Morning", start: 0, end: 6, image: "5am_5pm" },
        afternoon: { title: "Afternoon", start: 7, end: 11, image: "12pm" },
        evening: { title: "Evening", start: 12, end: 15, image: "5am_5pm" },
        night: { title: "Night", start: 16, end: 23, image: "9pm" }
    };

    console.log(timeData);

    // Draw bottom time labels.
    let iconSize = 32;
    Object.keys(timeSegments).forEach(key => {
        let timeSegment = timeSegments[key];

        // Get list of records for time segment interval.
        let timeList = [];
        Object.keys(timeMap).forEach(hourFromFive => {
            if (hourFromFive >= timeSegment.start && hourFromFive <= timeSegment.end) {
                timeList.push(timeMap[hourFromFive]);
            }
        });
        timeList = timeList.flat();

        let averageMoodScore = getAverageFromList(timeList.map(d => { return moodToScore[d[keys.time.mood]] }));
        let averageMood = scoreToMood[Math.round(averageMoodScore)];
        let mostFrequentAttitudeCount = d3.max(attitudeList, a => {
            let attitude = attitudeShorttoLong[a];
            return timeList.filter(d => { return d[keys.time.attitude] == attitude }).length;
        });
        let mostFrequentAttitude = attitudeShorttoLong[attitudeList.find(a => {
            let attitude = attitudeShorttoLong[a];
            return timeList.filter(d => { return d[keys.time.attitude] == attitude }).length == mostFrequentAttitudeCount;
        })];

        // console.log(mostFrequentAttitudeCount);
        // console.log(mostFrequentAttitude);
        // console.log(averageMoodScore);
        // console.log(averageMood);

        // Draw vertical line.
        morningNightGraph.append("line")
            .attr("x1", timeXScale(timeSegment.start))
            .attr("x2", timeXScale(timeSegment.start))
            .attr("y1", 0)
            .attr("y2", graphAttr.height - graphAttr.verticalPadding - iconSize / 2)
            .attr("stroke", colorHexArray[averageMood])
            .style("stroke-dasharray", dashArray[mostFrequentAttitude])
            .attr("stroke-width", 2)
            .style("stroke-linecap", "round");

        // Draw clock image.
        morningNightGraph.append("image")
            .attr("xlink:href", "images/" + timeSegment.image + ".svg")
            .attr("x", timeXScale(timeSegment.start) - iconSize / 2)
            .attr("y", graphAttr.height - graphAttr.verticalPadding - iconSize / 2)
            .attr("width", iconSize)
            .attr("height", iconSize);

        // Draw time segment label.
        drawText(morningNightGraph, timeSegment.title, {
            x: timeXScale(timeSegment.start),
            y: graphAttr.height
        });
    });

    // Draw left mood text labels.
    moodList.forEach(mood => {
        drawText(morningNightGraph, mood, {
            x: 0,
            y: moodYScale(moodToScore[mood]),
            fill: colorHexArray[mood],
            textAnchor: "end"
        });
    });

    // Draw curves.
    let lineGen = d3.line()
        .curve(d3.curveBasis);

    // Generate morning and night people points.
    let morningPoints = [];
    let nightPoints = [];

    Object.keys(timeMap).forEach(hourFromFive => {
        let x = timeXScale(hourFromFive);
        let timeList = timeMap[hourFromFive];
        let morningListForHour = timeList.filter(d => { return d[keys.time.morningNight] == "Morning" })
            .map(d => { return moodToScore[d[keys.time.mood]] });
        let nightListForHour = timeList.filter(d => { return d[keys.time.morningNight] == "Evening" })
            .map(d => { return moodToScore[d[keys.time.mood]] });
        if (morningListForHour.length > 0) {
            let morningAverage = getAverageFromList(morningListForHour);
            morningPoints.push([x, moodYScale(morningAverage)]);
        } else {
            morningPoints.push([x, moodYScale(moodToScore["Ok"])]);
        }
        if (nightListForHour.length > 0) {
            let nightAverage = getAverageFromList(nightListForHour);
            nightPoints.push([x, moodYScale(nightAverage)]);
        } else {
            nightPoints.push([x, moodYScale(moodToScore["Ok"])]);
        }
    });

    function sortTime(a, b) {
        return a[0] < b[0] ? -1 : 1;
    }
    morningPoints.sort(sortTime);
    nightPoints.sort(sortTime);

    // Draw path.
    let morningData = lineGen(morningPoints);
    let nightData = lineGen(nightPoints);
    morningNightGraph.append("path")
        .attr("d", morningData)
        .attr("fill", "none")
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round");
    morningNightGraph.append("path")
        .attr("d", nightData)
        .attr("fill", "none")
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 2)
        .style("stroke-linecap", "round");

    // Draw sun and moon icons next to line.
    morningNightGraph.append("image")
        .attr("xlink:href", "images/morning.svg")
        .attr("x", morningPoints[morningPoints.length - 1][0] + 12)
        .attr("y", morningPoints[morningPoints.length - 1][1] - iconSize / 2)
        .attr("width", iconSize)
        .attr("height", iconSize);
    morningNightGraph.append("image")
        .attr("xlink:href", "images/night.svg")
        .attr("x", nightPoints[nightPoints.length - 1][0] + 12)
        .attr("y", nightPoints[nightPoints.length - 1][1] - iconSize / 2)
        .attr("width", iconSize)
        .attr("height", iconSize);

    // Draw morning vs. night legend.
    let mnLegendAttr = {
        x: 2 * padding,
        y: height - padding * 2.5 - iconSize - 24,
        width: (width - 4 * padding) * 2 / 3,
    };
    let mnLegend = svg.append("g")
        .attr("class", "moodLegend")
        .attr("width", mnLegendAttr.width)
        .attr("transform", "translate(" + mnLegendAttr.x + "," + mnLegendAttr.y + ")");
    drawMorningNightLegend(mnLegend, { iconSize: iconSize });

    // Draw mood and attitude legend.
    drawMoodHalfLegend(svgClass, "Average mood for part of day for morning & night people");
    drawAttitudeHalfLegend(svgClass, attitudeList, "Most frequent attitude for morning & night people");
}

function drawMorningNightLegend(mnLegend, attr) {
    let iconSize = attr.iconSize == null ? 32 : attr.iconSize;
    let horizontalPadding = attr.horizontalPadding == null ? 8 : attr.horizontalPadding;

    mnLegend.append("image")
        .attr("xlink:href", "images/morning.svg")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", iconSize)
        .attr("height", iconSize);
    drawText(mnLegend, "Morning people", { x: iconSize + horizontalPadding, y: iconSize / 2, textAnchor: "start" });
    mnLegend.append("image")
        .attr("xlink:href", "images/night.svg")
        .attr("x", iconSize + horizontalPadding + 120)
        .attr("y", 0)
        .attr("width", iconSize)
        .attr("height", iconSize);
    drawText(mnLegend, "Night people", { x: 2 * (iconSize + horizontalPadding) + 120, y: iconSize / 2, textAnchor: "start" });
}