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

        svg.append("rect")
            .attr("x", dimensions.legendX)
            .attr("y", dimensions.legendY)
            .attr("width", dimensions.legendWidth)
            .attr("height", dimensions.legendHeight)
            .style("fill", "url(#gradient)");

        svg.append("text")
            .attr("x", dimensions.legendX)
            .attr("y", dimensions.legendY - 5)
            .style("font-size", "16px")
            .text("0");

        svg.append("text")
            .attr("x", dimensions.legendX + dimensions.legendWidth)
            .attr("y", dimensions.legendY - 5)
            .style("font-size", "16px")
            .attr("text-anchor", "end")
            .text(maxCount);
    });
});

d3.csv("cleaned_crash_data_zipc.csv").then(data => {
  var dimensions = {
    svgWidth: 800,
    svgHeight: 700,
    margin: {
        top: 100,
        right: 75,
        bottom: 75,
        left: 75
    }
  };

  let timeCounts = {};

  data.forEach(row => {
      let time = row["CRASH TIME"].split(":")[0]
      if (timeCounts[time]) {
          timeCounts[time]++;
      } else {
          timeCounts[time] = 1;
      }
  });

  const svg = d3.select("#times")
      .attr("width", dimensions.svgWidth)
      .attr("height", dimensions.svgHeight);

  const chartWidth = dimensions.svgWidth - dimensions.margin.left - dimensions.margin.right;
  const chartHeight = dimensions.svgHeight - dimensions.margin.top - dimensions.margin.bottom;

  const xScale = d3.scaleLinear()
      .domain([0, 23])
      .range([0, chartWidth]);

  const yScale = d3.scaleLinear()
      .domain([0, d3.max(Object.values(timeCounts))])
      .nice()
      .range([chartHeight, 0]);

  const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => `${d}:00`);

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

  const line = d3.line()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]));

  const timeData = Object.entries(timeCounts);

  chart.append("path")
      .datum(timeData)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);

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
      .text("Crash Counts");

  // Add a chart title
  svg.append("text")
      .attr("x", dimensions.svgWidth / 2)
      .attr("y", dimensions.margin.top)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Crash Counts by Hour of the Day");

});


