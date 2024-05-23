console.log("Script loaded successfully.");

function init() {
    var w = 800; // width of the visualization
    var h = 400; // height of the visualization
    var margin = {top: 20, right: 100, bottom: 50, left: 50}; // margins for axes

    var width = w - margin.left - margin.right; // effective width
    var height = h - margin.top - margin.bottom; // effective height

    d3.csv("/datasets/AlcoholConsumption.csv", function(d) {
        return {
            year: d3.timeParse("%Y")(d.TIME_PERIOD),
            consumption: +d.OBS_VALUE,
            country: d.Reference_Area
        };
    }).then(function(data) {
        console.table(data, ["year", "consumption", "country"]); // log data to console for verification

        var countries = Array.from(new Set(data.map(d => d.country)));
        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(countries);

        var xScale = d3.scaleTime()
            .domain(d3.extent(data, function(d) { return d.year; }))
            .range([0, width]);

        var yScale = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return d.consumption; })])
            .range([height, 0]);

        var xAxis = d3.axisBottom(xScale).ticks(10);
        var yAxis = d3.axisLeft(yScale).ticks(10);

        var svg = d3.select("#chart").append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var line = d3.line()
            .x(function(d) { return xScale(d.year); })
            .y(function(d) { return yScale(d.consumption); });

        var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

        var dataNest = d3.groups(data, d => d.country);

        dataNest.forEach(function(d) {
            svg.append("path")
                .datum(d[1])
                .attr("class", "line")
                .attr("d", line)
                .style("stroke", d[0] === "New Zealand" ? "red" : color(d[0]))
                .style("fill", "none")
                .style("opacity", 0.7)
                .on("mouseover", function() {
                    d3.select(this).transition().duration(200).style("stroke-width", 4).style("opacity", 1);
                })
                .on("mouseout", function() {
                    d3.select(this).transition().duration(200).style("stroke-width", 2).style("opacity", 0.7);
                })
                .on("click", function() {
                    var isActive = d3.select(this).classed("active");
                    d3.selectAll(".line").style("opacity", 0.1).classed("active", false);
                    if (!isActive) {
                        d3.select(this).style("opacity", 1).classed("active", true);
                    } else {
                        d3.selectAll(".line").style("opacity", 0.7);
                    }
                });
        });

        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) { return xScale(d.year); })
            .attr("cy", function(d) { return yScale(d.consumption); })
            .attr("r", 5)
            .style("fill", function(d) { return d.country === "New Zealand" ? "red" : color(d.country); })
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Country: ${d.country}<br/>Year: ${d3.timeFormat("%Y")(d.year)}<br/>Consumption: ${d.consumption} L`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
                d3.select(this).transition().duration(200).attr("r", 8);
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
                d3.select(this).transition().duration(200).attr("r", 5);
            });

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .call(yAxis);

        svg.append("text")
            .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom) + ")")
            .style("text-anchor", "middle")
            .text("Year");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Alcohol Consumption (L)");

        svg.selectAll(".label")
            .data(dataNest)
            .enter().append("text")
            .attr("class", "label")
            .attr("transform", function(d) {
                var lastDataPoint = d[1][d[1].length - 1];
                return "translate(" + (xScale(lastDataPoint.year) + 5) + "," + yScale(lastDataPoint.consumption) + ")";
            })
            .attr("dy", "0.35em")
            .style("font-size", "10px")
            .style("fill", function(d) { return d[0] === "New Zealand" ? "red" : color(d[0]); })
            .text(function(d) { return d[0]; });

        // Bring labels to the front
        svg.selectAll(".label").raise();
    });
}

init();
