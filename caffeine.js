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
    var spinner_div = document.getElementById("spinner");
    spinner_div.style.display = "none";

    // Use tabletop to scrape sheet data
    data = tabletop.sheets("2020")['elements'];

    // Populate dataset
    var totalListTMP = [];
    var dataset = [];
    for(var row in data){
        dataset.push({"date": new Date(data[row]["Date"]), "total": data[row]["Total"], "opacity": data[row]["PERCENT_MAX"]});
        totalListTMP.push(data[row]["Total"]);
    }

    var margin = {top: 50, right: 50, bottom: 50, left: 50}
        , width = window.innerWidth/2
        , height = (window.innerHeight - margin.top - margin.bottom)/2;

    var svgContainer = d3.select("#graph").append("svg")
        .attr("width", width+margin.left+margin.right)
        .attr("height", height+margin.top+margin.bottom)
        .style("font-family", "'Open Sans', sans-serif;")

    square_width = Math.floor((width+margin.left+margin.right)/10)*10
    square_height = Math.floor((height+margin.top+margin.bottom)/10)*10

    var x = 0;
    var y = 0;    
    dataset.forEach(data => {
        svgContainer.append("rect")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("width", 100)
                    .attr("height", 100)
                    .style("opacity", data["opacity"])
                    .style("stroke-width", 2)
                    .style("stroke", "#000000")
                    .style("fill", "#fcba03")
        
        var date_format = data.date.toDateString().split(" ")[1] + " " + data.date.toDateString().split(" ")[2]

        svgContainer.append("text")
                    .attr("x", x+5)
                    .attr("y", y+15)
                    .text(function () { return date_format; })
                    .attr("font-size", "13px")
                    .style("font-weight", "bold")
        
        svgContainer.append("text")
                    .attr("x", x+5)
                    .attr("y", y+30)
                    .text(function () { return data.total + " cups"; })
                    .attr("font-size", "13px")
        x += 100
        if(x > square_width-100){
            x = 0
            y += 100
        }
    })

}

window.addEventListener('DOMContentLoaded', init)

