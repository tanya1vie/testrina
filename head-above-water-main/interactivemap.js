let mode,currentMode;



document.addEventListener("DOMContentLoaded", function () {
    const slider = d3.select("#display-slider");
    const sliderValue = d3.select("#slider-value");

// Function to get the display mode based on the slider's value
const getDisplayMode = (value) => {
    switch (value) {
        case "0":
            return "Today";
        case "1":
            return "2030 (9 inch)";  // Match this with the switch cases
        case "2":
            return "2050 (21 inch)";
        case "3":
            return "2070 (36 inch)";
        default:
            return "Today";
    }
};


// Event handler to update the text and other related changes when the slider moves
slider.on("input", function () {
    const sliderPosition = this.value; // Get the slider's current value
    console.log(sliderPosition);
    const mode = getDisplayMode(sliderPosition); // Get the descriptive mode based on the slider position

    sliderValue.text(getDisplayMode(sliderPosition)); // Update the text element
    //console.log("Slider changed to:", sliderPosition, "Mode:", mode); // Debugging to confirm event handling
    if (sliderPosition == "1"){
        console.log("1");
        updateScatterplot3(mode);
    }
    else if (sliderPosition == "2"){
        console.log("2");
        updateScatterplot3(mode);
    }
    else if (sliderPosition == "3"){
        console.log("3");
        updateScatterplot3(mode);
    }
    else {
        console.log("0");
        updateScatterplot3(mode);
    }
});
});



// Set up the dimensions of the chart
const margin1 = { top: 100, right: 500, bottom: -5, left: 200 };
const width1 = 1800 - margin1.left - margin1.right;
const height1 = 900 - margin1.top - margin1.bottom;

// Create SVG element for both scatterplot and map
const svg1 = d3.select("body")  // Select the body or any other container where you want the SVG to be appended
    .append("svg")
    .attr("width", width1 + margin1.left + margin1.right)
    .attr("height", height1 + margin1.top + margin1.bottom);

// Create the pop-up div
const popup = d3.select("#popup-panel");

// Append a group element for the scatterplot
const svgScatterplot = svg1.append("g")
    .attr("class", "scatterplot")
    .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

// Append a group element for the map
const svgMap = svg1.append("g")
    .attr("class", "map")
    .attr("transform", "translate(" + margin1.left + "," + margin1.top + ")");

                const updateScatterplot3 = (mode) => {
                    // Load the data from CSV file
                    d3.csv("./data-files/data_fp4.csv").then(function(data) {

                    // Parse data
                    data.forEach(function(d) {
                        d.price = +d.Price;
                        d.address = d.Address; // Parse address as string
                        d.x = +d.Lat;
                        d.y = +d.Lon;
                        d.thirtysix = +d.thirtysix

                    });

                    const radiusScale = d3.scaleLinear()
                        .domain([d3.min(data, d => d.price), d3.max(data, d => d.price)])
                        .range([3, 35]); // Adjust the range for appropriate circle sizes


                    // Load the GeoJSON data and draw the map
                    d3.json("boston.geojson").then(function(bosNeighborhoods) {
                        // Projections for map
                        const bosProjection = d3.geoAlbers()
                            .scale(Math.min(width1, height1) * 520) // Adjust the scale based on the dimensions
                            .rotate([71.057, 0])
                            .center([0, 42.313])
                            .translate([width1 * 1.45/ 2, height1 * 1.4 / 2]);

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
                            .style("fill", d => d.thirtysix === 1 ? " rgb(72, 90, 175)" : "rgb(212, 116, 86)")
                            .style("opacity", 0.3)
                            .on("mouseover", (event, d) => {
                                popup.html(`
                                    <div style="color: rgb(212, 116, 86); font-weight: bold; font-size: 18px;">Address: ${d.address}</div>
                                    <div style="color: white;">Property Type: ${d.Proptype}</div>
                                    <div style="color: white;">Price: $${d.price}</div>
                                `)
                                .style("display", "block")
                                .style("left", `${event.pageX + 10}px`)
                                .style("top", `${event.pageY - 10}px`);
                            })
                            .on("mouseout", () => {
                                popup.style("display", "none");
                            });
                        });
                        });
                    };

                    if (mode == 1){
                        updateScatterplot3(mode);
                    }
                    else if (mode == 2){
                        updateScatterplot3(mode);
                    }
                    else if (mode == 3){
                        updateScatterplot3(mode);
                    }
                    else {
                        updateScatterplot3(mode);
                    }
