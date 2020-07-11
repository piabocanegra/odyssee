/**
 *   svgClass: tag for svg class, must include the '.'
 *   timeData: 
 *   everyoneData: records for everyone
 *   returns void, draws data vis for Morning vs. Night people
 */
function drawMorningNightVis(svgClass, everyoneData, timeData) {
    let svg = d3.select(svgClass);
    let height = svg.attr('height');
    let width = svg.attr('width');
    drawTitle(svg, 'Morning vs. Night people');
    console.log(timeData);



}