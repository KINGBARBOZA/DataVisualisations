console.log("Script loaded successfully");

year = "2012"//initialy set to 2012 to filter data by the earliest year

d3.csv("WeightM.csv").then(function(data) {//this filters the data selected from the csv file by the year selected.
    var filteredData = data.filter(function(d) {
        return d.Year === year;
    });
    console.log(filteredData);//displays data to the consol so we can make sure it is correct
    barChart(filteredData);//send in the filtered data to be used within the barchart function
});


function barChart(data) {
    var w = 600; // creates the borders of this task
    var h = 350;

    var xScale = d3.scaleBand()//this is used to scale all the x positions and width of the visulisation to create even spacig between bars of the graph
        .domain(d3.range(data.length))
        .rangeRound([0, w])
        .paddingInner(0.05);

    var yScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return +d.Found_Value; })])//this is used to scale all the y positions and height of the visulisation to create even spacig between bars of the graph
        .range([h, 0]);

    var svg = d3.select("#Bar_chart_location")
        .append("svg") // adds the svg tag to all the lines
        .attr("width", w + 30)
        .attr("height", h + 30)
        .append("g")
        .attr("transform", "translate(30, 0)"); // Move the chart to make room for the y-axis

    svg.selectAll("rect")
        .data(data) // binds the data to the dataset array elements
        .enter()
        .append("rect")
        .attr("x", function(d, i) {
            return xScale(i); // Sets x value positions of each bar within the graph
        })
        .attr("y", function(d) {
            return yScale(+d.Found_Value); // Sets y value positions of each bar within the graph
        })
        .attr("width", xScale.bandwidth()) //restricts the width of the svg elements
        .attr("height", function(d) {
            return h - yScale(+d.Found_Value); //uses the higest value of the visulisation for the height scale of the svg elements
        })
        .attr("fill", function(d) {//this sets the colour or each bar within the visulisation to a country
            if (d.Country === "Canada") return "#e60000";//colour codes have been used in areas to make it easier to look at
            else if (d.Country === "New Zealand") return "#0052cc";
            else if (d.Country === "United Kingdom") return "green";
            else if (d.Country === "Japan") return "#e6e600";
            else if (d.Country === "Korea") return "purple";
            else return "grey"; // Default color if no country can be found but will not be used in our visulisation
        })


        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill", "orange");//when hovering over a bar of the graph it will turn orange to represent which data is being represented by the tooltip
            var xPosition = event.pageX;
            var yPosition = event.pageY;

            d3.select("#tooltip")//used to move the tooltip around to the top of the bars within the graph
            .style("left", (xPosition) + "px")//i have manualy made it so the tooltip will pop up in the top right of the mouse
            .style("top", (yPosition - 70) + "px")

            d3.select("#tooltip #heading")//here changes the values within the tooltip to the country as the heading and found values for the percentage of people who are obese
                .text("Country: " + d.Country);
            d3.select("#tooltip #value")
                .text("Percentage of people who are obese: %" + d.Found_Value + ".");
            d3.select("#tooltip")
                .style("opacity", 1); //this will begin the transition within the css
        })

        .on("mouseout", function() {
            d3.select(this).attr("fill", function(d) {
                if (d.Country === "Canada") return "#e60000";
                else if (d.Country === "New Zealand") return "#0052cc";
                else if (d.Country === "United Kingdom") return "green";
                else if (d.Country === "Japan") return "#e6e600";
                else if (d.Country === "Korea") return "purple";
                else return "grey"; // Default color if no country can be found

        })
        d3.select("#tooltip")
            .style("opacity", 0); // Changing opacity will trigger the transition
        })





        //this section is used to create the axis
        var x_axis = d3.axisBottom()
        .scale(xScale)
        .tickFormat(function(d, i) { return data[i].Country; });//displays each country along the bottom axis

        var y_axis = d3.axisLeft()
            .scale(yScale)
            .ticks(5);//shows 5 spread out data points on the y axis

        svg.append("g")
            .attr("transform", "translate(0," + h + ")")
            .call(x_axis);

        svg.append("g")
            .call(y_axis);

}


    //this section allows the slider to constently monitor any changes and update the year and data of the visulisation acordingly. Note: this code was majority peformed by chat gpt with minor edits
    // Get the slider input element
    var slider = document.getElementById("myRange");

    // Get the h3 element where you want to display the slider value
    var output = document.getElementById("year");

    // Update the h2 element with the initial value of the slider
    output.innerHTML = slider.value;

    // Add an event listener to the slider input element
    slider.addEventListener("input", function() {
        // Update the h3 element with the current value of the slider

        output.innerHTML = this.value;
        year = this.value.toString();
        d3.select("svg").remove();
        d3.csv("WeightM.csv").then(function(data) {
        var filteredData = data.filter(function(d) {
            return d.Year === year;
        });
        console.log(filteredData);
        barChart(filteredData);

        });
    });
