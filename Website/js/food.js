console.log("Script loaded successfully");

year = "2012"//initialy set to 2012 to filter data by the earliest year
measure = "Fat supply"//initialy set to Fat supply

d3.csv("FoodM.csv").then(function(data) {//this filters the data selected from the csv file by the year selected.
    var filteredData = data.filter(function(d) {
        return d.Year === year;
    });
    filteredData = filteredData.filter(function(d) {//this filters the data selected from the csv file by the measure selected.
        return d.Measure === measure;
    });
    console.log(filteredData);//displays data to the consol so we can make sure it is correct
    pieChart(filteredData);//send in the filtered data to be used within the barchart function
});


function pieChart(data) {
    var data_value = data.map(function(d) {
        return +d.Found_Value;//makes the found values to be numeric allowing the pie functions to process the data
    });

    var pie = d3.pie();
    var w = 300;
    var h = 300;
    var outerRadius = w / 2;
    var innerRadius = w / 3;// width is divided by three to make the pie chart a donut chart.
    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);


    var svg = d3.select("#Pie_chart_location")//creates the pie chart in it's designated place within the HTML
        .append("svg")
        .attr("width", w + 150)
        .attr("height", h);

    var arcs = svg.selectAll("g.arc")
        .data(pie(data_value))//passes in the found value numeric data points
        .enter()
        .append("g")
        .attr("class", "arc")
        .attr("transform", "translate(" + outerRadius + ", " + outerRadius + ")");

    arcs.append("path")
        .attr("fill", function (d, i) {//colours in each slice of the donut chart iterating through them and looking and asigning a colour based on the country
            var country = data[i].Country;//colour codes have been used in areas to make it easier to look at
            if (country === "Finland") return "#e60000";//red
            else if (country === "New Zealand") return "#0052cc";//blue
            else if (country === "Netherlands") return "green";
            else if (country === "Italy") return "#e6e600";//yellow
            else if (country === "Korea") return "purple";
            else return "grey"; // Default color if no country can be found but will not be used in our visualization
        })
        .attr("d", arc);


    arcs.append("text")//this part adds the text to the donut chart as a percentage
        .attr("transform", function(d) {
            return "translate(" + arc.centroid(d) + ")";
        })
        .attr("text-anchor", "middle")
        //.text(function(d, i) {      old code used to show actual value
            //return data[i].Found_Value; // Display Found_Value in the pie chart
        //});
        .text(function(d) {//calculates the percentage of the pie slice to display as text within their area
            var percent = (d.endAngle - d.startAngle) / (2 * Math.PI) * 100;
            return percent.toFixed(1) + "%"; // Display percentage to 1 decimal place
        });

    //this part us used to create a legend which shows a key to the viewer consisting of a square colour representing a country within the visulisation
    var legend = svg.selectAll(".legend")
        .data(data)
        .enter()
        .append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(" + (w + 20) + "," + (i * 20 + 20) + ")";
        });

    legend.append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d, i) {
            var country = data[i].Country;
            if (country === "Finland") return "#e60000"; // red
            else if (country === "New Zealand") return "#0052cc"; // blue
            else if (country === "Netherlands") return "green";
            else if (country === "Italy") return "#e6e600"; // yellow
            else if (country === "Korea") return "purple";
            else return "grey"; // Default color if no country can be found but will not be used in our visualization
        });

    legend.append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .text(function(d) {
            return d.Country;
        });

    arcs.selectAll("path")
    .on("mouseover", function(event, d) {
        d3.select(this).attr("opacity", 0.5); // halves the opacity making the colour of the slice selected apear different aiding in showing which part of the chart has been selected
        var xPosition = event.pageX;
        var yPosition = event.pageY;

        // Update tooltip content with the type of consumbtion and the value asosiated with it
        d3.select("#tooltip #heading")
            .text("Consumption type: " + measure);
        if (measure === "Fat supply") {//this part checks which messure type is being viewed from the chart and then converts the scentenses of the tooltips to their apropriate values
            unit = "Grammes per person per day"
            type = "fats"
        }
        else if (measure === "Protein supply") {
            unit = "Grammes per person per day"
            type = "protein"
        }
        else if (measure === "Calories supply") {
            unit = "Kilocalories per person per day"
            type = "calories"
        }
        else if (measure === "Sugar supply") {
            unit = "Kilogrammes per person per year"
            type = "sugar"
        }
        else if (measure === "Fruits supply") {
            unit = "Kilogrammes per person per year"
            type = "fruits"
        }
        else {//this will be vegtable supply
            unit = "Kilogrammes per person per year"
            type = "vegetables"
        }
        d3.select("#tooltip #value")
            .text("The amount of " + type + " consumed by the average citizen is " + d.data + " " + unit + ".");

        // Shows the tooltip and sets it's position based off the mouse
        d3.select("#tooltip")
            .style("left", (xPosition) + "px")
            .style("top", (yPosition + 20) + "px")//moves the tool tip a bit bellow the mouse
            .style("opacity", 1);
    })

        .on("mouseout", function(event, d) {
            d3.select(this).attr("opacity", 1); // Restore opacity on mouseout
            d3.select("#tooltip")
                .style("opacity", 0); // Changing opacity will trigger the transition from the css
        });

}

// Get the slider input element
var slider = document.getElementById("myRange");

// Get the h3 element where you want to display the slider value
var year_output = document.getElementById("year");

// Update the h2 element with the initial value of the slider
year_output.innerHTML = slider.value;

// Add an event listener to the slider input element
slider.addEventListener("input", function() {
    // Update the h3 element with the current value of the slider

    year_output.innerHTML = this.value;
    year = this.value.toString();
    d3.select("svg").remove();
    d3.csv("FoodM.csv").then(function(data) {
    var filteredData = data.filter(function(d) {
        return d.Year === year;
    });
    filteredData = filteredData.filter(function(d) {
        return d.Measure === measure;//uses pre selected mesure for filter
    });
    console.log(filteredData);
    pieChart(filteredData);

    });
});


//this part is a listener for the dropdown list instead of the slider and it select from one of 5 messure types to then filter the data by
var list_value = document.getElementById("options");


list_value.addEventListener("change", function() {


    measure = this.value.toString();
    d3.select("svg").remove();
    d3.csv("FoodM.csv").then(function(data) {
    var filteredData = data.filter(function(d) {
        return d.Year === year;//uses pre selected year for filter
    });
    filteredData = filteredData.filter(function(d) {
        return d.Measure === measure;
    });
    console.log(filteredData);
    pieChart(filteredData);

    });
});
