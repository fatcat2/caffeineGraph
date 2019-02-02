var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1-Uac0pvr6lu0pGdW5d8TekSix1XUfi0rai1i2UWDiqw/edit?usp=sharing';

function init() {
    Tabletop.init( { key: publicSpreadsheetUrl,
        callback: showInfo,
        simpleSheet: true } )
}
function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
        width = parseInt(svg.style("width")),
        height = parseInt(svg.style("height")),
        aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    // to register multiple listeners for same event type, 
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}
function showInfo(data, tabletop) {
    // Hide spinner once data loads
    var x = document.getElementById("spinner");
    x.style.display = "none";

    // Use tabletop to scrape sheet data
    data = tabletop.sheets("2019")['elements'];

    // Get length of data
    var n = data.length;

    // Populate dataset
    var totalListTMP = [];
    var dataset = [];
    for(var row in data){
        dataset.push({"date": new Date(data[row]["Date"]), "total": data[row]["Total"]});
        totalListTMP.push(data[row]["Total"]);
    }

    var yMax = Math.max(...totalListTMP) + 1;
    //console.log(yMax);

    // Set margins!
    // TODO: Test on mobile
    var margin = {top: 50, right: 50, bottom: 50, left: 50}
        , width = window.innerWidth/2
        , height = (window.innerHeight - margin.top - margin.bottom)/2;


    if(window.innerWidth < 1200) width = window.innerWidth*0.75;

    // Get x scale all set
    var firstLastDate = [new Date(data[0].Date), new Date(data[data.length-1].Date)];
    var xScale = d3.scaleTime()
        .domain(firstLastDate)
        .range([0, width]);

    // Get y scale all set
    var yScale = d3.scaleLinear()
        .domain([0, 8]) // input
        .range([height, 0]); // output

    // Update last update text
    console.log(firstLastDate[1].toDateString());
    d3.select("#lastUpdate").text("Last updated " + firstLastDate[1].toDateString() + ".");

    // Generate the line
    var line = d3.line()
        .x(function(d) { return xScale(d.date); }) // set the x values for the line generator
        .y(function(d) { return yScale(d.total); }) // set the y values for the line generator
        .curve(d3.curveCatmullRom.alpha(0.5));

    // Div for tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var svg = d3.select("#graph").append("svg")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .call(responsivefy);

    // title text
    svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Total cups of caffeine drank");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale)); // Create an axis component with d3.axisBottoma

    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale)); // Create an axis component with d3.axisLeft

    // 9. Append the path, bind the data, and call the line generator
    svg.append("path")
        .datum(dataset) // 10. Binds data to the line
        .attr("class", "line") // Assign a class for styling
        .attr("d", line); // 11. Calls the line generator

    // 12. Appends a circle for each datapoint
    svg.selectAll(".dot")
        .data(dataset)
        .enter().append("circle") // Uses the enter().append() method
        .attr("class", "dot") // Assign a class for styling
        .attr("cx", function(d) { return xScale(d.date) })
        .attr("cy", function(d) { return yScale(d.total) })
        .attr("r", 5)
        .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div	.html(d.date.toDateString() + "<br/>Total:"  + d.total)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });



}

window.addEventListener('DOMContentLoaded', init)

