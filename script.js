d3.csv("cleaned_crash_data_zipc.csv").then(data => {

    var dimensions = {
      svgWidth: 800,
      svgHeight: 700,
      mapFitWidth: 800,
      mapFitHeight: 600,
      legendX: 10,
      legendY: 615,
      legendWidth: 200,
      legendHeight: 20,
    };

    let boroughCounts = {};

    data.forEach(row => {
        let borough = row["BOROUGH"];
        if (boroughCounts[borough]) {
            boroughCounts[borough]++;
        } else {
            boroughCounts[borough] = 1;
        }
    });

    d3.json("Borough_Boundaries.geojson").then(geoData => {
        const svg = d3.select("#boroughs")
            .attr("width", dimensions.svgWidth)
            .attr("height", dimensions.svgHeight);

        const projection = d3.geoMercator().fitSize([dimensions.mapFitWidth, dimensions.mapFitHeight], geoData);
        const path = d3.geoPath().projection(projection);

        const maxCount = 500000;

        const colorScale = d3.scaleLinear()
            .domain([0, maxCount])
            .range(["#ffffff", "#013220"]); 

        svg.selectAll("path")
            .data(geoData.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => {
                const count = boroughCounts[d.properties.boro_name];
                return colorScale(count);
            })
            .attr("stroke", "#000");

        const gradient = svg.append("defs")
            .append("linearGradient")
            .attr("id", "gradient");

        gradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#ffffff")
            .attr("stop-opacity", 1);

        gradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#013220")
            .attr("stop-opacity", 1);
    });
});

// Load and process the data
d3.csv("cleaned_crash_data_zipc.csv").then(data => {
    var dimensions = {
        svgWidth: 800,
        svgHeight: 700,
        margin: {
            top: 50,
            right: 75,
            bottom: 50,
            left: 75
        }
    };

    let attributes = [
        "NUMBER OF PERSONS INJURED",
        "NUMBER OF PERSONS KILLED",
        "NUMBER OF PEDESTRIANS INJURED",
        "NUMBER OF PEDESTRIANS KILLED",
        "NUMBER OF CYCLIST INJURED",
        "NUMBER OF CYCLIST KILLED",
        "NUMBER OF MOTORIST INJURED",
        "NUMBER OF MOTORIST KILLED"
    ];

    let timeAttributesCounts = {};
    attributes.forEach(attr => {
        timeAttributesCounts[attr] = {};
        for (let i = 0; i < 24; i++) { // Initialize counts for each hour to 0
            timeAttributesCounts[attr][i] = 0;
        }
    });

    data.forEach(row => {
        let time = parseInt(row["CRASH TIME"].split(":")[0]);
        attributes.forEach(attr => {
            let value = parseFloat(row[attr]);
            if (!isNaN(value)) {
                timeAttributesCounts[attr][time] += value;
            }
        });
    });

    const svg = d3.select("#times")
        .attr("width", dimensions.svgWidth)
        .attr("height", dimensions.svgHeight);

    const chartWidth = dimensions.svgWidth - dimensions.margin.left - dimensions.margin.right;
    const chartHeight = dimensions.svgHeight - dimensions.margin.top - dimensions.margin.bottom;

    const xScale = d3.scaleLinear()
        .domain([0, 23])
        .range([0, chartWidth]);

    let maxCount = Math.max(...attributes.map(attr => d3.max(Object.values(timeAttributesCounts[attr]))));

    const yScale = d3.scaleLinear()
        .domain([0, maxCount])
        .nice()
        .range([chartHeight, 0]);

    const xAxis = d3.axisBottom(xScale).tickFormat(d => `${d}:00`);
    const yAxis = d3.axisLeft(yScale);

    const chart = svg.append("g")
        .attr("transform", `translate(${dimensions.margin.left},${dimensions.margin.top})`);

    chart.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${chartHeight})`)
        .call(xAxis);

    chart.append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    // Function to draw lines
    const drawLine = (data, color, attributeName) => {
        const line = d3.line()
            .x(d => xScale(d[0]))
            .y(d => yScale(d[1]));

        chart.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("d", line)
            .append("title") // Tooltip
            .text(attributeName);
    };

    // Convert counts to an array of [hour, count] pairs and draw lines
    attributes.forEach((attr, index) => {
        const timeData = Object.entries(timeAttributesCounts[attr]).map(d => [parseInt(d[0]), d[1]]);
        // Use a different color for each line
        const color = d3.schemeCategory10[index % 10];
        drawLine(timeData, color, attr);
    });

    // Add labels and title
    svg.append("text")
        .attr("x", dimensions.svgWidth / 2)
        .attr("y", dimensions.svgHeight - 20)
        .style("text-anchor", "middle")
        .text("Hour of the Day");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -dimensions.svgHeight / 2)
        .attr("y", 20)
        .style("text-anchor", "middle")
        .text("Number of Incidents");

    // Add a chart title
    svg.append("text")
        .attr("x", dimensions.svgWidth / 2)
        .attr("y", dimensions.margin.top / 2)
        .style("text-anchor", "middle")
        .style("font-size", "24px")
        .text("Traffic Incidents by Hour and Type");

});


function countContributingFactors(data) {
    let factorCounts = {};

    data.forEach(row => {
        let factor = row["CONTRIBUTING FACTOR VEHICLE 1"];
        if (factor != "none") { 
            if (factorCounts[factor]) {
                factorCounts[factor]++;
            } else {
                factorCounts[factor] = 1;
            }
        }
    });

    return factorCounts;
}
d3.csv("cleaned_crash_data_zipc.csv").then(data => {
    let factorCounts = countContributingFactors(data);
    console.log(factorCounts);

    const width = 800;
    const height = 700;

    const svg = d3.select('#bubbles')
        .attr('width', width)
        .attr('height', height);

    let factors = Object.keys(factorCounts).map(key => ({
        factor: key,
        count: factorCounts[key]
    }));

    let maxCount = d3.max(factors, d => d.count);

    let radiusScale = d3.scaleSqrt()
        .domain([0, maxCount])
        .range([10, 100]); 

    let colorScale = d3.scaleLinear()
        .domain([0, maxCount])
        .range(["lightblue", "steelblue"]);

    const labelThreshold = 5; 

    let simulation = d3.forceSimulation(factors)
        .force("charge", d3.forceManyBody().strength(15))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => radiusScale(d.count) + 1))
        .on("tick", ticked);

    function ticked() {
        let bubbles = svg.selectAll("circle")
            .data(factors, d => d.factor);

        bubbles.enter().append("circle")
            .attr("r", d => radiusScale(d.count))
            .attr("fill", d => colorScale(d.count))
            .merge(bubbles)
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);

        bubbles.exit().remove();

        let labels = svg.selectAll("text")
            .data(factors.filter(d => d.count >= labelThreshold), d => d.factor);

        labels.enter().append("text")
            .text(d => d.factor)
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("font-size", "10px")
            .attr("fill", "black") 
            .merge(labels)
            .attr("x", d => d.x)
            .attr("y", d => d.y);

        labels.exit().remove();
    }
});
