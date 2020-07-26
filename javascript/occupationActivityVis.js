/**
 *   svgClass: tag for svg class, must include the '.'
 *   timeData: time data for records
 *   returns void, draws data vis for occupation.
 */
function drawOccupationVis(svgClass, ikigaiData, typesData, everyoneData) {
    let svg = d3.select(svgClass);
    let height = svg.attr("height");
    let width = svg.attr("width");
    drawTitle(svg, "Occupation");
    console.log(typesData);
    let titleVerticalPadding = 70;

    let ikigaiList = [{
            category: 'bohemian',
            title: 'bohemians',
            x: 0,
            y: titleVerticalPadding
        },
        {
            category: 'zen master',
            title: 'zen masters',
            x: width / 2,
            y: titleVerticalPadding
        },
        {
            category: 'worker',
            title: 'citizens',
            x: 0,
            y: titleVerticalPadding + (height - titleVerticalPadding) / 2
        },
        {
            category: 'profiteer',
            title: 'profiteers',
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
    Object.keys(occupations).forEach(o => {
        let emailsByOccupation = typesData.filter(d => { return d[keys.types.occupation] == occupations[o].description })
            .map(d => { return d[keys.types.email] });
        let recordsByOccupation = everyoneData.filter(d => { return emailsByOccupation.includes(d[keys.everyone.email]) });
        occupations[o].average = recordsByOccupation.length / ikigaiList.length;
    });
    ikigaiList.forEach(i => {
        i.users = ikigaiData.filter(d => { return d[keys.ikigai.category] == i.category })
            .map(d => { return d[keys.ikigai.email] });
        i.records = everyoneData.filter(d => { return i.users.includes(d[keys.everyone.email]) });
        Object.keys(occupations).forEach(o => {
            let emailsByOccupation = typesData.filter(d => { return occupations[o].description == d[keys.types.occupation] })
                .map(d => { return d[keys.types.email] });
            i[o] = i.records.filter(d => { return emailsByOccupation.includes(d[keys.everyone.email]) });
        });
    });
    console.log(ikigaiList);
    let maxRecords = d3.max(ikigaiList, i => {
        return d3.max(Object.keys(occupations), o => {
            return i[o].length
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
            console.log(recordsScale(0))
            console.log(recordsScale(ikigai[o].length))
            ikigaiGraph.append("line")
                .attr("x1", occupationScale(i))
                .attr("x2", occupationScale(i))
                .attr("y1", recordsScale(0))
                .attr("y2", recordsScale(ikigai[o].length))
                .attr("stroke", ikigaiColorHexArray[ikigai.category])
                .attr("stroke-width", 2)
                .attr("stroke-linecap", "round");
            let averageLineWidth = 24
            ikigaiGraph.append("line")
                .attr("x1", occupationScale(i) - averageLineWidth / 2)
                .attr("x2", occupationScale(i) + averageLineWidth / 2)
                .attr("y1", recordsScale(occupation.average))
                .attr("y2", recordsScale(occupation.average))
                .attr("stroke", "lightgrey")
                .attr("stroke-width", 2)
                .attr("stroke-linecap", "round");
        });
    });
}