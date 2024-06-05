console.log("Script loaded successfully");

/**
 * Initializes the alcohol consumption visualization.
 */
function init() {
    // Define dimensions and margins for the visualization
    var w = 900;
    var h = 400;
    var margin = { top: 20, right: 150, bottom: 50, left: 50 };
    var width = w - margin.left - margin.right;
    var height = h - margin.top - margin.bottom;

    // Load and process the data
    d3.csv("AlcoholConsumption.csv", function(d) {
        return {
            year: d3.timeParse("%Y")(d.TIME_PERIOD),
            consumption: +d.OBS_VALUE,
            country: d["Reference area"]
        };
    }).then(function(data) {
        // Log data for verification
        console.table(data, ["year", "consumption", "country"]);

        // Set up color scale
        var countries = Array.from(new Set(data.map(d => d.country)));
        var color = d3.scaleOrdinal(d3.schemeCategory10).domain(countries);

        // Set up scales and axes
        var xScale = d3.scaleTime().domain(d3.extent(data, d => d.year)).range([0, width]);
        var yScale = d3.scaleLinear().domain([0, d3.max(data, d => d.consumption)]).range([height, 0]);
        var xAxis = d3.axisBottom(xScale).ticks(10);
        var yAxis = d3.axisLeft(yScale).ticks(10);

        // Create SVG container
        var svg = d3.select("#chart").append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        // Define line generator
        var line = d3.line()
            .x(d => xScale(d.year))
            .y(d => yScale(d.consumption));

        // Create tooltip
        var tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

        // Nest data by country
        var dataNest = d3.groups(data, d => d.country);

        // Draw lines
        dataNest.forEach(function(d) {
            var countryColor = d[0] === "New Zealand" ? "red" :
                               d[0] === "Canada" ? "green" :
                               color(d[0]);

            svg.append("path")
                .datum(d[1])
                .attr("class", "line")
                .attr("id", "line-" + d[0].replace(/\s+/g, ''))
                .attr("d", line)
                .style("stroke", countryColor)
                .style("fill", "none")
                .style("stroke-width", d[0] === "New Zealand" ? 4 : 2)
                .style("opacity", d[0] === "New Zealand" ? 1 : 0.7);
        });

        // Draw dots
        svg.selectAll(".dot")
            .data(data)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.consumption))
            .attr("r", d => d.country === "New Zealand" ? 6 : 5)
            .style("fill", d => d.country === "New Zealand" ? "red" : d.country === "Canada" ? "green" : color(d.country))
            .style("stroke", d => d.country === "New Zealand" ? "black" : "none")
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Country: ${d.country}<br/>Year: ${d3.timeFormat("%Y")(d.year)}<br/>Consumption: ${d.consumption} L`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px")
                    .style("background-color", "white")
                    .style("border", "1px solid black")
                    .style("padding", "5px")
                    .style("border-radius", "5px");
                d3.select(this).transition().duration(200).attr("r", 8);
            })
            .on("mouseout", function() {
                tooltip.transition().duration(500).style("opacity", 0);
                d3.select(this).transition().duration(200).attr("r", d => d.country === "New Zealand" ? 6 : 5);
            });

        // Add axes
        svg.append("g").attr("transform", "translate(0," + height + ")").call(xAxis);
        svg.append("g").call(yAxis);

        // Add axis labels
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

        // Add legend
        var legend = svg.selectAll(".legend")
            .data(countries)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => "translate(0," + i * 20 + ")");

        legend.append("rect")
            .attr("x", width + 20)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", d => d === "New Zealand" ? "red" : d === "Canada" ? "green" : color(d));

        legend.append("text")
            .attr("x", width + 45)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "start")
            .text(d => d);

        // Add country dropdown
        var dropdown = d3.select("#countryDropdown");
        dropdown.selectAll("option")
            .data(countries)
            .enter()
            .append("option")
            .attr("value", d => d)
            .text(d => d);

        // Handle dropdown change
        d3.select("#countryDropdown").on("change", function(event) {
            var selectedCountry = d3.select(this).property("value");
            svg.selectAll(".line").style("display", "none");
            svg.selectAll(".dot").style("display", "none");
            if (selectedCountry === "") {
                svg.selectAll(".line").style("display", null);
                svg.selectAll(".dot").style("display", null);
            } else {
                svg.select("#line-" + selectedCountry.replace(/\s+/g, '')).style("display", null);
                svg.selectAll(".dot")
                    .filter(d => d.country === selectedCountry)
                    .style("display", null);
            }
        });

        // Initially display all lines and dots
        svg.selectAll(".line").style("display", null);
        svg.selectAll(".dot").style("display", null);
    });
}

// Initialize the visualization
init();
