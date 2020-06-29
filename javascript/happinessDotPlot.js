function getAverage(list) {
    return list.reduce((a, b) => a + b, 0) / list.length
}

/**
 *   svgClass: tag for svg class, must include the '.'
 *   personalityData: list of personality data for everyone
 *   title: title of graph
 *   returns void, draws data vis for happiness dot plot
 */
function drawHappinessDotPlot(svgClass, everyoneData, personalityData) {
    let svg = d3.select(svgClass);
    let height = svg.attr('height');
    let width = svg.attr('width');

    console.log(personalityData);

    // Add title.
    drawTitle(svg, "Remembered vs. Experienced Happiness");

    let moodToScore = {
        "Awful": 1,
        "Bad": 2,
        "Ok": 3,
        "Good": 4,
        "Amazing": 5
    };
    let scoreToMood = {
        1: "Awful",
        2: "Bad",
        3: "Ok",
        4: "Good",
        5: "Amazing"
    };

    // Setup happinessData.
    let happinessData = {};
    for (let i = 1; i <= 5; i++) {
        happinessData[i] = []
    }
    personalityData.forEach(person => {
        let recordsForUser = getPersonData(everyoneData, person[keys.personality.email]); // average of moods is y position
        let rememberedHappiness = Number(person[keys.personality.happiness]); // x position
        let moodScores = recordsForUser.map(record => {
            return moodToScore[record[keys.everyone.mood]]
        });

        let experiencedHappiness = getAverage(moodScores);

        // Remembered can be NaN if user did not record any data. Also check that experienced is not NaN to be safe.
        if (!isNaN(rememberedHappiness) && !isNaN(experiencedHappiness)) {
            happinessData[rememberedHappiness].push(experiencedHappiness);
        }
    });

    console.log(happinessData);

    // Get group average and standard deviation.
    let experiencedData = Object.keys(happinessData).map(r => {
        return happinessData[r]
    }).flat();
    let rememberedData = Object.keys(happinessData).map(r => {
        return happinessData[r].map(_ => {
            return Number(r)
        })
    }).flat();

    let groupAverage = {
        experienced: getAverage(experiencedData),
        remembered: getAverage(rememberedData)
    };
    let groupStdDev = {
        experienced: calculateStdDev(experiencedData, groupAverage.experienced),
        remembered: calculateStdDev(rememberedData, groupAverage.remembered)
    };

    console.log(experiencedData);
    console.log(rememberedData);
    console.log(groupAverage);
    console.log(groupStdDev);

    // Setup scales.
    let rememberedScale = d3.scaleLinear()
        .domain([0, 5])
        .range([height - 3 * padding, 120]);

    let experiencedScale = d3.scaleLinear()
        .domain([0, 5])
        .range([4 * padding, width - 3 * padding]);

    let graphPadding = 48;

    // Add graph labels.
    let graphLabelInterTextPadding = 48;
    for (let i = 0; i <= 5; i++) {
        drawText(svg, i, { x: experiencedScale(0) - graphPadding, y: rememberedScale(i) });
    }
    for (let i = 1; i <= 5; i++) {
        drawText(svg, i, { x: experiencedScale(i), y: rememberedScale(0) + graphPadding });
    }
    drawText(svg, '"' + keys.personality.happiness.trim() + '"', {
        x: experiencedScale(0) - graphPadding - graphLabelInterTextPadding,
        y: rememberedScale(2.5),
        transform: 'rotate(270 ' + (experiencedScale(0) - graphPadding - graphLabelInterTextPadding) + ' ' + rememberedScale(2.5) + ')'
    });
    drawText(svg, '"How are you feeling?"', {
        x: experiencedScale(2.5),
        y: rememberedScale(0) + graphPadding + graphLabelInterTextPadding
    });

    // Plot standard deviation lines and labels.
    let plotLineInterPadding = 56;
    let plotLineTextOffset = 20;

    let groupMin = {
        experienced: d3.min(experiencedData),
        remembered: d3.min(rememberedData),
    };

    let plotLineAttr = {
        experienced: {
            x1: experiencedScale(groupAverage.experienced - groupStdDev.experienced),
            x2: experiencedScale(groupAverage.experienced + groupStdDev.experienced),
            y: rememberedScale(groupMin.remembered) + plotLineInterPadding
        },
        remembered: {
            x: experiencedScale(groupMin.experienced) - plotLineInterPadding,
            y1: rememberedScale(groupAverage.remembered - groupStdDev.remembered),
            y2: rememberedScale(groupAverage.remembered + groupStdDev.remembered)
        }
    }

    svg.append('line')
        .attr('x1', plotLineAttr.experienced.x1)
        .attr('x2', plotLineAttr.experienced.x2)
        .attr('y1', plotLineAttr.experienced.y)
        .attr('y2', plotLineAttr.experienced.y)
        .attr('stroke', 'lightgrey')
        .attr('stroke-width', 2);

    drawTab(svg, plotLineAttr.experienced.x1, plotLineAttr.experienced.y, 'vertical');
    drawTab(svg, plotLineAttr.experienced.x2, plotLineAttr.experienced.y, 'vertical');

    drawText(svg, 'experienced happiness', {
        x: experiencedScale(groupAverage.experienced),
        y: plotLineAttr.experienced.y + plotLineTextOffset
    });

    svg.append('line')
        .attr('x1', plotLineAttr.remembered.x)
        .attr('x2', plotLineAttr.remembered.x)
        .attr('y1', plotLineAttr.remembered.y1)
        .attr('y2', plotLineAttr.remembered.y2)
        .attr('stroke', 'lightgrey')
        .attr('stroke-width', 2);

    drawTab(svg, plotLineAttr.remembered.x, plotLineAttr.remembered.y1, 'horizontal');
    drawTab(svg, plotLineAttr.remembered.x, plotLineAttr.remembered.y2, 'horizontal');

    drawText(svg, 'remembered happiness', {
        x: plotLineAttr.remembered.x - plotLineTextOffset,
        y: rememberedScale(groupAverage.remembered),
        transform: 'rotate(270 ' + (plotLineAttr.remembered.x - plotLineTextOffset) + ' ' + rememberedScale(groupAverage.remembered) + ')'
    });

    let tooltipId = "happinessDotPlotTooltipId"
    let tooltip = d3.select("body")
        .append("div")
        .attr("id", tooltipId)
        .style("padding", 10)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .attr("white-space", "pre-line")
        .style("background-color", backgroundColor)
        .style("border-radius", "15px")
        .style("border", "1px solid #cdcdcd")
        .style("font-family", "Courier new")
        .style("font-size", 12)
        .style("text-align", "left")
        .style("color", textColor)
        .style("max-width", 250);

    // Plot points.
    Object.keys(happinessData).forEach(r => {
        if (happinessData[r].length > 0) {
            let average = getAverage(happinessData[r]);
            let rectAttr = {
                height: 36,
                width: experiencedScale(5) - experiencedScale(0) + graphPadding + 12
            }
            let tooltipText = "<b>REMEMBERED HAPPINESS:</b> " + r +
                "</br></br><b>EXPERIENCED HAPPINESS AVG: </b>" + (Math.round(average * 100) / 100) +
                "</br></br><b>FREQUENCY: </b>" + happinessData[r].length;
            let rect = svg.append('rect')
                .attr('x', experiencedScale(0) - graphPadding - 12)
                .attr('y', rememberedScale(r) - rectAttr.height / 2)
                .attr('height', rectAttr.height)
                .attr('width', rectAttr.width)
                .attr('fill', '#c4c4c41a')
                .attr('opacity', 0)
                .attr('rx', 4)
                .attr('stroke', 'lightgrey')
                .attr('stroke-width', 1)
                .on("mousemove", function() {
                    showTooltip(tooltipText, rect);
                }).on("mouseout", function() {
                    hideTooltip(rect);
                });

            // Draw points per person.
            happinessData[r].forEach(e => {
                svg.append('circle')
                    .attr('cx', experiencedScale(e))
                    .attr('cy', rememberedScale(r))
                    .attr('r', 4)
                    .attr('fill', colorHexArray[scoreToMood[Math.round(e)]])
                    .on("mousemove", function() {
                        showTooltip(tooltipText, rect);
                    }).on("mouseout", function() {
                        hideTooltip(rect);
                    });
            });

            // Draw average.
            svg.append('circle')
                .attr('cx', experiencedScale(average))
                .attr('cy', rememberedScale(r))
                .attr('r', 5)
                .attr('fill', textColor)
                .on("mousemove", function() {
                    showTooltip(tooltipText, rect);
                }).on("mouseout", function() {
                    hideTooltip(rect);
                });
        }
    });

    function showTooltip(html, rect) {
        tooltip.html(html)
            .style("visibility", "visible")
            .style("top", event.pageY + 20)
            .style("left", function() {
                if (d3.event.clientX < 750) {
                    return event.pageX + 20 + "px";
                } else {
                    return event.pageX - document.getElementById(tooltipId).clientWidth - 20 + "px";
                }
            });
        rect.attr('opacity', 1);
    }

    function hideTooltip(rect) {
        tooltip.style("visibility", "hidden");
        rect.attr('opacity', 0);
    }
}

function drawText(svg, text, attr) {
    let x = attr.x == null ? 0 : attr.x;
    let y = attr.y == null ? 0 : attr.y;
    let textAnchor = attr.textAnchor == null ? 'middle' : attr.textAnchor;
    let alignmentBaseline = attr.alignmentBaseline == null ? 'middle' : attr.alignmentBaseline;
    let fontSize = attr.fontSize == null ? 12 : attr.fontSize;
    let transform = attr.transform == null ? '' : attr.transform;
    svg.append('text')
        .attr('x', x)
        .attr('y', y)
        .attr('text-anchor', textAnchor)
        .attr('font-family', 'Courier new')
        .attr('fill', textColor)
        .attr('font-size', fontSize)
        .attr('alignment-baseline', alignmentBaseline)
        .attr('transform', transform)
        .text(text);
}

function drawTab(svg, x, y, orientation) {
    let tabHeight = 16
    svg.append('line')
        .attr('x1', orientation == 'horizontal' ? x - tabHeight / 2 : x)
        .attr('x2', orientation == 'horizontal' ? x + tabHeight / 2 : x)
        .attr('y1', orientation == 'vertical' ? y - tabHeight / 2 : y)
        .attr('y2', orientation == 'vertical' ? y + tabHeight / 2 : y)
        .attr('stroke', 'lightgrey')
        .attr('stroke-width', 2)
        .style("stroke-linecap", "round");
}