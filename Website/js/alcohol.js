document.addEventListener("DOMContentLoaded", function() {
    const margin = {top: 20, right: 100, bottom: 50, left: 50};
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const parseDate = d3.timeParse("%Y");
    const x = d3.scaleTime().range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const color = d3.scaleOrdinal(d3.schemeCategory10);

    d3.csv("../Datasets/Modified_datasets/AlcoholConsumption.csv").then(data => {
        console.log("Data loaded:", data);

        data.forEach(d => {
            d.year = parseDate(d.TIME_PERIOD);
            d.consumption = +d.OBS_VALUE;
        });

        const countries = Array.from(new Set(data.map(d => d.Reference_Area)));
        console.log("Countries:", countries);

        color.domain(countries);

        const dataNest = d3.groups(data, d => d.Reference_Area);
        console.log("Data Nest:", dataNest);

        x.domain(d3.extent(data, d => d.year));
        y.domain([0, d3.max(data, d => d.consumption)]);

        svg.append("g")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y")));

        svg.append("g")
            .call(d3.axisLeft(y));

        svg.append("text")
            .attr("transform", `translate(${width / 2},${height + margin.bottom - 10})`)
            .style("text-anchor", "middle")
            .text("Year");

        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Alcohol Consumption (L)");

        const line = d3.line()
            .x(d => x(d.year))
            .y(d => y(d.consumption));

        svg.selectAll(".line")
            .data(dataNest)
            .enter()
            .append("path")
            .attr("class", "line")
            .attr("d", d => line(d[1]))
            .style("stroke", d => d[0] === "New Zealand" ? "red" : color(d[0]))
            .style("fill", "none");

        // Add country labels
        svg.selectAll(".label")
            .data(dataNest)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("transform", d => `translate(${x(d[1][d[1].length - 1].year)},${y(d[1][d[1].length - 1].consumption)})`)
            .attr("x", 5)
            .attr("dy", "0.35em")
            .style("font-size", "10px")
            .style("fill", d => d[0] === "New Zealand" ? "red" : color(d[0]))
            .text(d => d[0]);

        const tooltip = d3.select("body").append("div").attr("class", "tooltip").style("opacity", 0);

        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.year))
            .attr("cy", d => y(d.consumption))
            .attr("r", 5)
            .style("fill", d => d.Reference_Area === "New Zealand" ? "red" : color(d.Reference_Area))
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(`Country: ${d.Reference_Area}<br/>Year: ${d3.timeFormat("%Y")(d.year)}<br/>Consumption: ${d.consumption} L`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) {
                tooltip.transition().duration(500).style("opacity", 0);
            });
    }).catch(error => {
        console.error("Error loading the data:", error);
    });
});