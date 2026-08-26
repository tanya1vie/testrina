// script.js

// Set up dimensions for the chart
const margin = { top: 20, right: 20, bottom: 50, left: 50 };
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

// Append SVG to the chart div
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Load CSV data
d3.csv("./data-files/data_fp4.csv").then(function(data) {
    // Define the available fields for grouping
    const fields = ["reclaimed", "9_inch", "21_inch", "36_inch"];

    // Set up initial field
    let selectedField = fields[0];

    // Function to update chart based on selected field
    function updateChart() {
        // Set up x scale
        const xScale = d3.scaleBand()
            .domain(["Inside", "Outside"])
            .range([0, width])
            .padding(0.1);

        // Set up y scale
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d[selectedField])])
            .nice()
            .range([height, 0]);

        // Update x axis
        svg.select(".x-axis")
            .attr("transform", `translate(0,${height})`)
            .call(d3.axisBottom(xScale));

        // Update y axis
        svg.select(".y-axis")
            .call(d3.axisLeft(yScale));

        // Update slider label
        d3.select("#slider-value").text(selectedField);

        // Remove previous bars
        svg.selectAll(".bar").remove();

        // Add bars
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => xScale(d.Address))
            .attr("y", d => yScale(+d[selectedField]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(+d[selectedField]))
            .style("fill", "steelblue");
    }

    // Add slider
    const slider = d3.select("#slider")
        .append("input")
        .attr("type", "range")
        .attr("min", 0)
        .attr("max", fields.length - 1)
        .attr("value", 0)
        .attr("step", 1)
        .on("input", function() {
            selectedField = fields[this.value];
            updateChart();
        });

    // Add slider label
    d3.select("#slider").append("span").attr("id", "slider-value").text(fields[0]);

    // Add x axis
    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0,${height})`);

    // Add y axis
    svg.append("g")
        .attr("class", "y-axis");

    // Initial chart update
    updateChart();
});
