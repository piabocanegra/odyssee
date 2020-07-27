/**
 *   svgClass: tag for svg class, must include the '.'
 *   timeData: time data for records
 *   returns void, draws data vis for occupation.
 */
function drawOccupationVis(svgClass, ikigaiData, typesData, everyoneData) {
    let svg = d3.select(svgClass);
    let height = svg.attr("height");
    let width = svg.attr("width");
    let titleVerticalPadding = 70;

    drawTitle(svg, "Occupation");
    console.log(typesData);

    let ikigaiList = [{
            category: 'bohemian',
            title: 'bohemians',
            id: 'Bohemian',
            x: 0,
            y: titleVerticalPadding
        },
        {
            category: 'zen master',
            title: 'zen masters',
            id: 'Zen',
            x: width / 2,
            y: titleVerticalPadding
        },
        {
            category: 'worker',
            title: 'citizens',
            id: 'Citizen',
            x: 0,
            y: titleVerticalPadding + (height - titleVerticalPadding) / 2
        },
        {
            category: 'profiteer',
            title: 'profiteers',
            id: 'Profiteer',
            x: width / 2,
            y: titleVerticalPadding + (height - titleVerticalPadding) / 2
        }
    ];

    let occupations = {
        company: { title: "Company", description: "Working for a company" },
        venture: { title: "Venture", description: "Working for my own venture" },
        looking: { title: "Looking", description: "Looking for jobs" },
        studying: { title: "Studying", description: "Studying" },
        caring: { title: "Caring", description: "Caring for family and friends" },
        exploring: { title: "Exploring", description: "Exploring and enjoying life" },
        other: { title: "Other", description: "Other" }
    };

    // Determine average number of records for each occupation.
    Object.keys(occupations).forEach(o => {
        let emailsByOccupation = typesData.filter(d => { return d[keys.types.occupation] == occupations[o].description })
            .map(d => { return d[keys.types.email] });
        let recordsByOccupation = everyoneData.filter(d => { return emailsByOccupation.includes(d[keys.everyone.email]) });
        occupations[o].average = recordsByOccupation.length / ikigaiList.length;
    });

    // Get denominator for activity multiples.
    let activityCountMap = {};
    Object.keys(activityShortToLong).forEach(a => {
        // Number of records for "a" activities in entire group (across all ikigai + all occupations) divided by 
        // number of records for all activities in entire group).
        activityCountMap[a] = everyoneData.filter(d => {
            return d[keys.everyone.activity].substring(0, 2) == a
        }).length / everyoneData.length;
    });

    // Determine records per ikigai group.
    ikigaiList.forEach(i => {
        i.users = ikigaiData.filter(d => { return d[keys.ikigai.category] == i.category })
            .map(d => { return d[keys.ikigai.email] });
        // Get records per ikigai group.
        i.records = everyoneData.filter(d => { return i.users.includes(d[keys.everyone.email]) });
        Object.keys(occupations).forEach(o => {
            let emailsByOccupation = typesData.filter(d => { return occupations[o].description == d[keys.types.occupation] })
                .map(d => { return d[keys.types.email] });
            i[o] = {};
            // Get records per ikigai group and occupation.
            i[o].records = i.records.filter(d => { return emailsByOccupation.includes(d[keys.everyone.email]) });
            Object.keys(activityShortToLong).forEach(a => {
                // Get record count per ikigai group, occupation, and activity.
                let recordCountByActivity = i[o].records.filter(d => { return d[keys.everyone.activity].substring(0, 2) == a }).length;
                // Get activity multiple.
                i[o][a] = (recordCountByActivity / i[o].records.length) / activityCountMap[a];
                if (isNaN(i[o][a])) {
                    i[o][a] = 0;
                }
            });
        });
    });

    console.log(ikigaiList);

    let maxRecords = d3.max(ikigaiList, i => {
        return d3.max(Object.keys(occupations), o => {
            return i[o].records.length
        })
    });
    console.log(maxRecords);

    let graphAttr = {
        textWidth: 100,
        height: (height - titleVerticalPadding) / 2,
        width: width / 2,
        horizontalPadding: 12,
        verticalPadding: 12
    }
    let occupationScale = d3.scaleLinear()
        .domain([0, Object.keys(occupations).length - 1])
        .range([graphAttr.textWidth + graphAttr.horizontalPadding * 2, graphAttr.width - graphAttr.horizontalPadding * 2]);
    let recordsScale = d3.scaleLinear()
        .domain([0, maxRecords])
        .range([graphAttr.height / 2, 0]);
    ikigaiList.forEach(ikigai => {
        let ikigaiGraph = svg.append("g")
            .attr("transform", "translate(" + ikigai.x + ", " + ikigai.y + ")");
        drawText(ikigaiGraph, "records", {
            x: graphAttr.textWidth,
            y: 0,
            textAnchor: "end"
        });
        drawText(ikigaiGraph, ikigai.title, {
            x: graphAttr.textWidth,
            y: graphAttr.height / 2,
            textAnchor: "end"
        });
        ikigaiGraph.append("line")
            .attr("x1", graphAttr.textWidth + graphAttr.horizontalPadding)
            .attr("x2", graphAttr.width)
            .attr("y1", graphAttr.height / 2)
            .attr("y2", graphAttr.height / 2)
            .attr("stroke", "lightgrey")
            .attr("stroke-width", 2)
            .attr("stroke-linecap", "round");
        Object.keys(occupations).forEach((o, i) => {
            let occupation = occupations[o];
            d3.xml("images/" + occupation.title + ".svg").then(imageData => {
                console.log(imageData.documentElement);
                // Find "center" to different height-width ratios.
                let imageBounds = imageData.documentElement.viewBox.baseVal;
                let imageHeight = graphAttr.height * 0.3;
                let imageWidth = imageBounds.width / imageBounds.height * imageHeight;
                ikigaiGraph.append("image")
                    .attr("xlink:href", "images/" + occupation.title + ".svg")
                    .attr("x", occupationScale(i) - imageWidth / 2)
                    .attr("y", graphAttr.height / 2)
                    .attr("width", imageWidth)
                    .attr("height", imageHeight);
            });

            if (ikigai[o].records.length > 0) {
                ikigaiGraph.append("line")
                    .attr("x1", occupationScale(i))
                    .attr("x2", occupationScale(i))
                    .attr("y1", recordsScale(0))
                    .attr("y2", recordsScale(ikigai[o].records.length))
                    .attr("stroke", ikigaiColorHexArray[ikigai.category])
                    .attr("stroke-width", 2)
                    .attr("stroke-linecap", "round");
            }

            let maxActivityMultiple = d3.max(Object.keys(activityShortToLong), a => { return ikigai[o][a] });
            if (maxActivityMultiple > 0) {
                let imageSize = 56;
                let maxActivity = Object.keys(activityShortToLong).find(a => { return ikigai[o][a] == maxActivityMultiple });
                ikigaiGraph.append("image")
                    .attr("xlink:href", "images/" + maxActivity + ".svg")
                    .attr("x", occupationScale(i) - imageSize / 2)
                    .attr("y", recordsScale(ikigai[o].records.length) - imageSize)
                    .attr("width", imageSize)
                    .attr("height", imageSize)
                    .attr("filter", function() { return "url(#" + ikigai.id + ")"; });
            }

            if (occupation.average > 0) {
                let averageLineWidth = 48
                ikigaiGraph.append("line")
                    .attr("x1", occupationScale(i) - averageLineWidth / 2)
                    .attr("x2", occupationScale(i) + averageLineWidth / 2)
                    .attr("y1", recordsScale(occupation.average))
                    .attr("y2", recordsScale(occupation.average))
                    .attr("stroke", "lightgrey")
                    .attr("stroke-width", 2)
                    .attr("stroke-linecap", "round");
            }

        });
    });
}