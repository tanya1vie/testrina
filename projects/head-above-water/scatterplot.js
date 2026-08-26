// Set up the dimensions of the chart
const margin = { top: 100, right: 500, bottom: -5, left: -300 };
const width = 1200 - margin.left - margin.right;
const height = 900 - margin.top - margin.bottom;

// Create SVG element for both scatterplot and map
const svg = d3.select("body")  // Select the body or any other container where you want the SVG to be appended
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom);

// Append a group element for the scatterplot
const svgScatterplot = svg.append("g")
    .attr("class", "scatterplot")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Append a group element for the map
const svgMap = svg.append("g")
    .attr("class", "map")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Load the data from CSV file
d3.csv("./data-files/data_fp4.csv").then(function(data) {

    // Parse data
    data.forEach(function(d) {
        d.price = +d.Price;
        d.address = d.Address; // Parse address as string
        d.x = +d.Lat;
        d.y = +d.Lon;
    });
    // Set up scales for scatterplot with padding
        const xPadding = 50;
        const yPadding = 50;

        const xScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.x) - xPadding, d3.max(data, d => d.x) + xPadding])
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([d3.min(data, d => d.y) - yPadding, d3.max(data, d => d.y) + yPadding])
            .range([height, 0]);
    // // Set up scales for scatterplot
    // const xScale = d3.scaleLinear()
    //     .domain([d3.min(data, d => d.x), d3.max(data, d => d.x)])
    //     .range([0, width]);

    // const yScale = d3.scaleLinear()
    //     .domain([d3.min(data, d => d.y), d3.max(data, d => d.y)])
    //     .range([height, 0]);

    const radiusScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.price), d3.max(data, d => d.price)])
        .range([3, 35]); // Adjust the range for appropriate circle sizes

    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Draw axes for scatterplot
    svgScatterplot.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svgScatterplot.append("g")
        .call(yAxis);

    // Add a text element for labels
    const label = svgScatterplot.append("text")
        .attr("class", "label")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-size", "12px")
        .style("fill", "black")
        .style("opacity", 0);

    // Load the GeoJSON data and draw the map
    d3.json("boston.geojson").then(function(bosNeighborhoods) {
        // Projections for map
        const bosProjection = d3.geoAlbers()
            .scale(Math.min(width, height) * 520) // Adjust the scale based on the dimensions
            .rotate([71.057, 0])
            .center([0, 42.313])
            .translate([width * 1.45/ 2, height * 1.4 / 2]);

        const bos_geoPath = d3.geoPath().projection(bosProjection);

        // Bind GeoJSON data to SVG and draw map
        svgMap.selectAll("path")
            .data(bosNeighborhoods.features)
            .enter()
            .append("path")
            .attr("d", bos_geoPath)
            .style("fill", "none")
            .style("stroke", "black")
            .style("stroke-width", 0.5);

        // Convert latitudes and longitudes to projected coordinates
        data.forEach(function(d) {
            const projectedCoordinates = bosProjection([d.Lon, d.Lat]); // Lon is X, Lat is Y
            d.projectedX = projectedCoordinates[0];
            d.projectedY = projectedCoordinates[1];
        });

        // Draw circles for scatterplot
        svgScatterplot.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => d.projectedX)
            .attr("cy", d => d.projectedY)
            .attr("r", d => radiusScale(d.price))
            .style("fill", "steelblue")
            .style("opacity", 0.1)
            .on("mouseover", function(event, d) {
                // Convert the projected coordinates back to latitudes and longitudes
                const [lon, lat] = bosProjection.invert([d.projectedX, d.projectedY]);

                // Show label on mouseover
                label.text(d.address + ", Price: $" + d.price)
                    .attr("x", bosProjection([lon, lat])[0] + 10) // Re-project the coordinates and add offset
                    .attr("y", bosProjection([lon, lat])[1] - 10) // Re-project the coordinates and add offset
                    .style("opacity", 1);
                console.log("Mouseover event triggered:", d);
            })
            .on("mouseout", function(event, d) {
                // Hide label on mouseout
                label.style("opacity", 0);
                console.log("Mouseout event triggered:", d);
            });

    });



});
//     // Function to toggle the overlay visibility
// function toggleOverlay() {
//     const seaLevelRise = svgMap.selectAll(".seaLevelRise");
//     const isVisible = seaLevelRise.style("opacity") === "1";

//     seaLevelRise.style("opacity", isVisible ? 0 : 1);
// }
