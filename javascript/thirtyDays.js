/**
 *   svgClass: tag for svg class, must include the '.'
 *   timeData: time data for records
 *   email: email of user if displaying individual data
 *   returns void, draws data vis for 30 days bivariate time.
 */
function drawThirtyDaysVis(svgClass, timeData, email = null) {
    timeData.forEach(e => {
        let activity = e[keys.time.activity];
        activityShortToLong[activity.split(":")[0]] = (activity.split(":")[1]).substring(1).split("(")[0]
    });
    let svg = d3.select(svgClass);
    let height = svg.attr("height");
    let width = svg.attr("width");
    drawTitle(svg, "30 days");

    let dateTimeParser = d3.timeParse("%m/%d/%y %H:%M %p");
    timeData.forEach(d => {
        d.dateTime = dateTimeParser(d[keys.time.dateTime]);
    });

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
                activity: [],
                data: []
            };
        });
    }

    let timeFrame = {
        start: {
            month: 4,
            day: 15
        },
        end: {
            month: 5,
            day: 14
        }
    }

    // Determine start and end dates for a user if displaying individual data.
    if (email != null) {
        let timeDataForUser = timeData.filter(d => { return d[keys.time.email] == email });
        let minMonth = d3.min(timeDataForUser, d => { return d.dateTime.getMonth() });
        let timeDataForUserOfMinMonth = timeDataForUser.filter(d => { return d.dateTime.getMonth() == minMonth });
        let minDate = d3.min(timeDataForUserOfMinMonth, d => { return d.dateTime.getDate() });
        minMonth = minMonth + 1; // getMonth() indexes month from 0, but we want to index month from 1.
        // console.log("min month: " + minMonth + " | min date: " + minDate)
        timeFrame.start.month = minMonth;
        timeFrame.start.day = minDate;
    }

    timeFrame.daysOfStartMonth = new Date(2020, timeFrame.start.month, 0).getDate()
    let daysLeftInStartMonth = timeFrame.daysOfStartMonth - timeFrame.start.day + 1;
    timeFrame.end.month = daysLeftInStartMonth < 30 ? timeFrame.start.month + 1 : timeFrame.start.month;
    timeFrame.end.day = daysLeftInStartMonth < 30 ? 30 - daysLeftInStartMonth : 30;
    // console.log(timeFrame.daysOfStartMonth)

    timeData.forEach(d => {
        if (email == null || d[keys.time.email] == email) {
            let dateTime = dateTimeParser(d[keys.time.dateTime]);
            let hour = dateTime.getHours();
            let hourFromFive = hour < 5 ? (19 + hour) : (hour - 5);
            let date = dateTime.getDate();
            let month = dateTime.getMonth() + 1;
            if ((month == timeFrame.start.month && date >= timeFrame.start.day) || (month == timeFrame.end.month && date <= timeFrame.end.day)) {
                let day = month == timeFrame.start.month ? date - timeFrame.start.day + 1 :
                    month == timeFrame.end.month ? date - timeFrame.start.day + 1 + timeFrame.daysOfStartMonth : null;
                let timeSegment = hourFromFiveToTimeSegment(hourFromFive);
                // console.log(dateTime)
                // console.log("Month: " + month + " Date: " + date + " hr from five: " + hourFromFive + " Time segment: " + timeSegment)
                // console.log("day: " + day)
                monthMap[day][timeSegment].mood.push(d[keys.time.mood]);
                monthMap[day][timeSegment].activity.push(d[keys.time.activity]);
                monthMap[day][timeSegment].data.push({
                    mood: d[keys.time.mood],
                    activity: d[keys.time.activity],
                    hourFromFive: hourFromFive
                });
            }
        }
    });
    // console.log(timeData);
    // console.log(monthMap);

    let graphAttr = {
        x: 150,
        y: 72,
        horizontalPadding: 24,
        verticalPadding: 4,
        height: height - 3.5 * padding - 72,
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

    // Add tooltip.
    let tooltipId = 'thirtyDaysBivariateVisTooltipId';
    let tooltip = addTooltip(tooltipId);

    // Draw data.
    let strokeWidth = 1;
    Object.keys(monthMap).forEach(day => {
        drawText(bivarTimeGraph, day, {
            x: monthXScale(day),
            y: timeYScale(24) + graphAttr.verticalPadding
        });
        let data = [];
        Object.keys(timeSegments).forEach(segment => {
            let timeSegment = timeSegments[segment];
            let moods = monthMap[day][segment].mood;
            let activities = monthMap[day][segment].activity;
            if (moods.length > 0 && activities.length > 0) {
                if (email == null) {
                    let mostFrequentMood = getModeFromList(moods);
                    let mostFrequentActivity = getModeFromList(activities);
                    data.push([{
                        mood: mostFrequentMood,
                        activity: mostFrequentActivity,
                        hourFromFive: (timeSegment.start + timeSegment.end) / 2,
                        frequency: moods.length
                    }])
                } else {
                    data.push(monthMap[day][segment].data)
                }
            }
        });
        data = data.flat().sort((a, b) => { return a.hourFromFive < b.hourFromFive ? -1 : 1 });
        let lineEnd = null;
        let g = bivarTimeGraph.append("g");
        // console.log(day)
        // console.log(data)
        data.forEach((d, i) => {
            let mood = d.mood;
            let activity = d.activity.substring(0, 2);
            let hourFromFive = d.hourFromFive;
            let start = lineEnd == null ? timeYScale(0) : lineEnd;
            let end = timeYScale(hourFromFive) - iconSize / 2;
            end = start <= end ? end : start;
            g.append("line")
                .attr("x1", monthXScale(day))
                .attr("x2", monthXScale(day))
                .attr("y1", start)
                .attr("y2", end)
                .attr("stroke", colorHexArray[mood])
                .attr("stroke-width", strokeWidth);
            g.append("image")
                .attr("xlink:href", "images/" + activity + ".svg")
                .attr("x", monthXScale(day) - iconSize / 2)
                .attr("y", timeYScale(hourFromFive) - iconSize / 2)
                .attr("width", iconSize)
                .attr("height", iconSize)
                .style('filter', function() {
                    return 'url(#' + mood + ')';
                }).on("mousemove", function() {
                    let tooltipText = ""
                    if (email == null) {
                        tooltipText = "<b>MOST FREQUENT ACTIVITY:</b> " + (activityShortToLong[activity].toLowerCase()) +
                            "</br></br><b>MOST FREQUENT MOOD: </b>" + mood.toLowerCase() +
                            "</br></br><b>FREQUENCY: </b>" + d.frequency;
                    } else {
                        tooltipText = "<b>ACTIVITY:</b> " + (activityShortToLong[activity].toLowerCase()) +
                            "</br></br><b>MOOD: </b>" + mood.toLowerCase();
                    }
                    // Show tooltip.
                    tooltip.html(tooltipText)
                        .style("visibility", "visible")
                        .style("top", event.pageY + 20)
                        .style("left", function() {
                            if (d3.event.clientX < 750) {
                                return event.pageX + 20 + "px";
                            } else {
                                return event.pageX - document.getElementById(tooltipId).clientWidth - 20 + "px";
                            }
                        });
                }).on("mouseout", function() {
                    tooltip.style("visibility", "hidden");
                });
            start = timeYScale(hourFromFive) + iconSize / 2;
            end = (i + 1) >= data.length ? timeYScale(24) - graphAttr.verticalPadding : (timeYScale(hourFromFive) + timeYScale(data[i + 1])) / 2;
            end = start <= end ? end : start;
            g.append("line")
                .attr("x1", monthXScale(day))
                .attr("x2", monthXScale(day))
                .attr("y1", start)
                .attr("y2", end)
                .attr("stroke", colorHexArray[mood])
                .attr("stroke-width", strokeWidth);
            lineEnd = end;
        });
    });

    // Draw legends.
    let moodLegendAttr = {
        x: graphAttr.x,
        y: height - padding * 2.5,
        width: width / 4
    }
    let activityLegendAttr = {
        x: graphAttr.x + width / 4 + padding,
        y: height - padding * 2.5,
        width: 200
    }

    let moodLegend = svg.append("g")
        .attr("class", "moodLegend")
        .attr("width", moodLegendAttr.width)
        .attr("transform", "translate(" + moodLegendAttr.x + "," + moodLegendAttr.y + ")");

    let activityLegend = svg.append("g")
        .attr("class", "moodLegend")
        .attr("width", activityLegendAttr.width)
        .attr("transform", "translate(" + activityLegendAttr.x + "," + activityLegendAttr.y + ")");

    drawMoodLegend(moodLegend, "Most frequent mood", moodList);
    drawActivityLegend(activityLegend)

    function drawActivityLegend(activityLegend, attr = {}) {
        let title = attr.title == null ? "Most frequent activity" : attr.title
        let activityIcon = attr.activity == null ? "b1" : attr.activity
        let iconSize = attr.iconSize == null ? 32 : attr.iconSize

        let width = activityLegend.attr("width");
        if (width == null) {
            console.error("drawActivityLegend: must specify width for activityLegend.")
        }

        activityLegend.append("text")
            .attr("x", width / 2)
            .attr("y", 15)
            .text(title)
            .style("text-anchor", "middle")
            .style("font-family", "Courier new")
            .style("fill", textColor)
            .style("font-size", 12);

        activityLegend.append("image")
            .attr("xlink:href", "images/" + activityIcon + ".svg")
            .attr("x", width / 2 - iconSize / 2)
            .attr("y", padding - iconSize / 2)
            .attr("width", iconSize)
            .attr("height", iconSize);
    }

}