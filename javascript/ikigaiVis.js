/**
 *   svgClass: tag for svg class, must include the '.'
 *   ikigaiData: 
 *   everyoneData: records for everyone
 *   returns void, draws data vis for happiness dot plot
 */
function drawIkigaiVis(svgClass, everyoneData, ikigaiData) {
    let svg = d3.select(svgClass);
    let height = svg.attr('height');
    let width = svg.attr('width');

    console.log(ikigaiData);

    // Add title.
    drawTitle(svg, "Ikigai");

    // Add ikigai chart.
    let imageAttr = {
        height: 400,
        width: 400
    };

    imageAttr.x = width / 2 - imageAttr.width / 2;
    imageAttr.y = height / 2 - imageAttr.height / 2;
    imageAttr.centerX = imageAttr.x + imageAttr.width / 2;
    imageAttr.centerY = imageAttr.y + imageAttr.height / 2;

    svg.append('image')
        .attr('xlink:href', 'images/ikigai.svg')
        .attr('x', imageAttr.x)
        .attr('y', imageAttr.y)
        .attr('width', imageAttr.width)
        .attr('height', imageAttr.height);

    let ikigaiList = ['worker', 'bohemian', 'zen master', 'profiteer'];

    // Order: Happiness, Money, Skill, Passion, Contribution
    let ikigaiScoreList = [
        keys.ikigai.happiness,
        keys.ikigai.money,
        keys.ikigai.skill,
        keys.ikigai.passion,
        keys.ikigai.contribution
    ];

    let ikigaiKeyToLabel = {
        'worker': 'Citizen',
        'bohemian': 'Bohemian',
        'zen master': 'Zen Master',
        'profiteer': 'Profiteer'
    };

    // Setup ikigaiMap
    let ikigaiMap = {}

    ikigaiList.forEach(category => {
        ikigaiMap[category] = {};
        ikigaiScoreList.forEach(type => {
            let dataForIkigai = ikigaiData.filter(d => { return d[keys.ikigai.category] == category; });
            ikigaiMap[category][type] = dataForIkigai.map(d => {
                return Number(d[type]);
            });
        });
    });

    ikigaiMap['total'] = {};

    ikigaiScoreList.forEach(type => {
        ikigaiMap['total'][type] = [];
        ikigaiScoreList.forEach(type => {
            ikigaiMap['total'][type] = ikigaiData.map(d => {
                return Number(d[type]);
            });
        });
    });

    function getAverageFromList(lst) {
        return lst.reduce((a, b) => a + b, 0) / lst.length
    }

    // Get averages.
    let ikigaiAverages = [];
    Object.keys(ikigaiMap).forEach(category => {
        Object.keys(ikigaiMap[category]).forEach(type => {
            ikigaiMap[category][type] = getAverageFromList(ikigaiMap[category][type]);
            ikigaiAverages.push(ikigaiMap[category][type]); // To find max later.
        });
    });

    console.log(ikigaiMap);

    let ikigaiGraphPadding = 16;
    let ikigaiColorHexArray = {
        'profiteer': '#9f265b',
        'worker': '#ca614d',
        'bohemian': '#edc3a3',
        'zen master': '#f2d878',
    };

    let gIkigaiAttr = {
        height: 65,
        width: (width - imageAttr.width) / 2 - ikigaiGraphPadding
    };

    // Setup scales.
    let ikigaiXScale = d3.scaleBand()
        .domain(ikigaiScoreList)
        .range([ikigaiGraphPadding, gIkigaiAttr.width]);

    let ikigaiMaxScore = d3.max(ikigaiAverages, d => { return d });
    let ikigaiYScale = d3.scaleLinear()
        .domain([0, ikigaiMaxScore])
        .range([0, gIkigaiAttr.height]);

    // Setup bar graphs.
    let gCitizen = svg.append('g')
        .attr('transform', 'translate(' +
            (imageAttr.centerX + imageAttr.width / 2 - ikigaiGraphPadding) + ', ' +
            (imageAttr.centerY - imageAttr.height * 0.31 - gIkigaiAttr.height) + ')');

    svg.append('line')
        .attr('x1', imageAttr.centerX + imageAttr.width * 0.28)
        .attr('x2', width - padding)
        .attr('y1', imageAttr.centerY - imageAttr.height * 0.31)
        .attr('y2', imageAttr.centerY - imageAttr.height * 0.31)
        .attr('stroke', ikigaiColorHexArray['worker'])
        .attr('stroke-width', 2)
        .style('stroke-linecap', 'round');

    drawText(svg, 'score', {
        x: width - padding + 12,
        y: imageAttr.centerY - imageAttr.height * 0.31 - gIkigaiAttr.height - 12,
        textAnchor: 'end',
        fontSize: 9
    });

    let gZenMaster = svg.append('g')
        .attr('transform', 'translate(' +
            (imageAttr.centerX + imageAttr.width / 2 + 14) + ', ' +
            (imageAttr.centerY - imageAttr.height * 0.02 - gIkigaiAttr.height) + ')');

    svg.append('line')
        .attr('x1', imageAttr.centerX + imageAttr.width * 0.11)
        .attr('x2', width - 16)
        .attr('y1', imageAttr.centerY - imageAttr.height * 0.02)
        .attr('y2', imageAttr.centerY - imageAttr.height * 0.02)
        .attr('stroke', ikigaiColorHexArray['zen master'])
        .attr('stroke-width', 2)
        .style('stroke-linecap', 'round');

    drawText(svg, 'score', {
        x: width - 16 + 12,
        y: imageAttr.centerY - imageAttr.height * 0.02 - gIkigaiAttr.height - 12,
        textAnchor: 'end',
        fontSize: 9
    });

    let gProfiteer = svg.append('g')
        .attr('transform', 'translate(' +
            (padding + 20) + ', ' +
            (imageAttr.centerY + imageAttr.height * 0.45 - gIkigaiAttr.height) + ')');

    svg.append('line')
        .attr('x1', imageAttr.centerX - imageAttr.width * 0.11)
        .attr('x2', padding)
        .attr('y1', imageAttr.centerY + imageAttr.height * 0.45)
        .attr('y2', imageAttr.centerY + imageAttr.height * 0.45)
        .attr('stroke', ikigaiColorHexArray['profiteer'])
        .attr('stroke-width', 2)
        .style('stroke-linecap', 'round');

    drawText(svg, 'score', {
        x: padding - 12,
        y: imageAttr.centerY + imageAttr.height * 0.45 - gIkigaiAttr.height - 12,
        textAnchor: 'start',
        fontSize: 9
    });

    let gBohemian = svg.append('g')
        .attr('transform', 'translate(' +
            (width * 0.02) + ', ' +
            (imageAttr.centerY - imageAttr.height * 0.28 - gIkigaiAttr.height) + ')');

    svg.append('line')
        .attr('x1', 16)
        .attr('x2', imageAttr.centerX - imageAttr.width * 0.32)
        .attr('y1', imageAttr.centerY - imageAttr.height * 0.28)
        .attr('y2', imageAttr.centerY - imageAttr.height * 0.28)
        .attr('stroke', ikigaiColorHexArray['bohemian'])
        .attr('stroke-width', 2)
        .style('stroke-linecap', 'round');

    drawText(svg, 'score', {
        x: 16 - 12,
        y: imageAttr.centerY - imageAttr.height * 0.28 - gIkigaiAttr.height - 12,
        textAnchor: 'start',
        fontSize: 9
    });

    let ikigaiCatToGraph = {
        'worker': gCitizen,
        'bohemian': gBohemian,
        'zen master': gZenMaster,
        'profiteer': gProfiteer
    };

    ikigaiList.forEach(category => {
        let ikigaiGraph = ikigaiCatToGraph[category];

        ikigaiScoreList.forEach(type => {
            let typeAverage = ikigaiMap['total'][type];
            let categoryAverage = ikigaiMap[category][type];
            // console.log(typeAverage)
            // console.log(categoryAverage)

            let interLinePadding = 14

            // Add line for all entries.
            ikigaiGraph.append('line')
                .attr('y1', gIkigaiAttr.height)
                .attr('y2', gIkigaiAttr.height - ikigaiYScale(typeAverage))
                .attr('x1', ikigaiXScale(type) - interLinePadding / 2)
                .attr('x2', ikigaiXScale(type) - interLinePadding / 2)
                .attr('stroke', 'lightgrey')
                .attr('stroke-width', 2)
                .style('stroke-linecap', 'round');

            // Add line for ikigai group.
            ikigaiGraph.append('line')
                .attr('y1', gIkigaiAttr.height)
                .attr('y2', gIkigaiAttr.height - ikigaiYScale(categoryAverage))
                .attr('x1', ikigaiXScale(type) + interLinePadding / 2)
                .attr('x2', ikigaiXScale(type) + interLinePadding / 2)
                .attr('stroke', ikigaiColorHexArray[category])
                .attr('stroke-width', 2)
                .style('stroke-linecap', 'round');

            // Add label for type.
            drawText(ikigaiGraph, type.toLowerCase(), {
                x: ikigaiXScale(type),
                y: gIkigaiAttr.height + 12,
                fontSize: 9
            });
        });
    });
}