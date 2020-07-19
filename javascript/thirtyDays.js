/**
 *   svgClass: tag for svg class, must include the '.'
 *   timeData: time data for records
 *   returns void, draws data vis for 30 days bivariate time.
 */
function drawThirtyDaysVis(svgClass, timeData) {
    let svg = d3.select(svgClass);
    let height = svg.attr("height");
    let width = svg.attr("width");
    drawTitle(svg, "30 days");

    let dateTimeParser = d3.timeParse("%m/%d/%y %H:%M %p");

    let monthMap = {};

    function hourFromFiveToTimeSegment(hourFromFive) {
        let segment = undefined;
        Object.keys(timeSegments).forEach(s => {
            let timeSegment = timeSegments[s]
            if (timeSegment.start <= hourFromFive && timeSegment.end >= hourFromFive) {
                segment = s;
            }
        });
        return segment;
    }

    for (let i = 1; i <= 30; i++) {
        monthMap[i] = {};
        Object.keys(timeSegments).forEach(segment => {
            monthMap[i][segment] = {
                mood: [],
                activity: []
            };
        });
    }

    timeData.forEach(d => {
        let record = d;
        let dateTime = dateTimeParser(d[keys.time.dateTime]);
        let hour = dateTime.getHours();
        let hourFromFive = hour < 5 ? (19 + hour) : (hour - 5);
        let date = dateTime.getDate();
        let month = dateTime.getMonth() + 1;
        if ((month == 4 && date >= 15) || (month == 5 && date <= 14)) {
            let day = month == 4 ? date - 14 : month == 5 ? date - 14 + 30 : null;
            let timeSegment = hourFromFiveToTimeSegment(hourFromFive);
            // console.log(dateTime)
            // console.log("Month: " + month + " Day: " + day + " hr from five: " + hourFromFive + " Time segment: " + timeSegment)
            monthMap[day][timeSegment].mood.push(record[keys.time.mood]);
            monthMap[day][timeSegment].activity.push(record[keys.time.activity]);
        }
    });
    console.log(timeData);
    console.log(monthMap);

    let graphAttr = {
        x: 150,
        y: 100,
        horizontalPadding: 24,
        verticalPadding: 4,
        height: height - 200,
        width: width - 150
    }

    let bivarTimeGraph = svg.append("g")
        .attr("transform", "translate(" + graphAttr.x + ", " + graphAttr.y + ")");

    // Setup scales.
    let timeYScale = d3.scaleTime()
        .domain([0, 24])
        .range([0, graphAttr.height]);

    let monthXScale = d3.scaleTime()
        .domain([1, 30])
        .range([graphAttr.horizontalPadding, graphAttr.width - graphAttr.horizontalPadding]);

    let iconSize = 32;

    Object.keys(timeSegments).forEach(key => {
        let timeSegment = timeSegments[key];

        // Draw clock image.
        bivarTimeGraph.append("image")
            .attr("xlink:href", "images/" + timeSegment.image + ".svg")
            .attr("x", monthXScale(1) - graphAttr.horizontalPadding - iconSize - iconSize / 2)
            .attr("y", timeYScale(timeSegment.start) - iconSize / 2)
            .attr("width", iconSize)
            .attr("height", iconSize);

        // Draw time segment label.
        drawText(bivarTimeGraph, timeSegment.title, {
            x: monthXScale(1) - graphAttr.horizontalPadding * 2 - iconSize,
            y: timeYScale(timeSegment.start),
            textAnchor: "end"
        });
    });

    // Draw "Day" label.
    drawText(bivarTimeGraph, "Day", {
        x: monthXScale(1) - graphAttr.horizontalPadding - iconSize / 2,
        y: timeYScale(24) + graphAttr.verticalPadding,
        textAnchor: "end"
    });

    function getModeFromList(lst) {
        let map = {};
        lst.forEach(d => {
            let count = map[d]
            map[d] = count == null ? 1 : count + 1;
        });
        let maxCount = d3.max(lst, d => { return map[d] });
        return Object.keys(map).find(d => { return map[d] = maxCount })
    }

    // Draw data.
    let strokeWidth = 1;
    Object.keys(monthMap).forEach(day => {
        drawText(bivarTimeGraph, day, {
            x: monthXScale(day),
            y: timeYScale(24) + graphAttr.verticalPadding
        });
        let lineEnd = null;
        Object.keys(timeSegments).forEach(segment => {
            let timeSegment = timeSegments[segment];
            let moods = monthMap[day][segment].mood;
            let activities = monthMap[day][segment].activity;
            if (moods.length > 0 && activities.length > 0) {
                let mostFrequentMood = getModeFromList(moods);
                let mostFrequentActivity = getModeFromList(activities);
                bivarTimeGraph.append("line")
                    .attr("x1", monthXScale(day))
                    .attr("x2", monthXScale(day))
                    .attr("y1", lineEnd == null ? timeYScale(timeSegment.start) : lineEnd)
                    .attr("y2", (timeYScale(timeSegment.start) + timeYScale(timeSegment.end)) / 2 - iconSize / 2 + 1)
                    .attr("stroke", colorHexArray[mostFrequentMood])
                    // .attr("stroke-linecap", "round")
                    .attr("stroke-width", strokeWidth);
                bivarTimeGraph.append("image")
                    .attr("xlink:href", "images/" + (mostFrequentActivity.substring(0, 2)) + ".svg")
                    .attr("x", monthXScale(day) - iconSize / 2)
                    .attr("y", (timeYScale(timeSegment.start) + timeYScale(timeSegment.end)) / 2 - iconSize / 2)
                    .attr("width", iconSize)
                    .attr("height", iconSize)
                    .style('filter', function() {
                        return 'url(#' + mostFrequentMood + ')';
                    });
                lineEnd = timeYScale(timeSegment.end) + (segment == "night" ? 0 : iconSize / 2);
                bivarTimeGraph.append("line")
                    .attr("x1", monthXScale(day))
                    .attr("x2", monthXScale(day))
                    .attr("y1", (timeYScale(timeSegment.start) + timeYScale(timeSegment.end)) / 2 + iconSize / 2 - 1)
                    .attr("y2", lineEnd)
                    .attr("stroke", colorHexArray[mostFrequentMood])
                    // .attr("stroke-linecap", "round")
                    .attr("stroke-width", strokeWidth);
            }


        });
    });
}