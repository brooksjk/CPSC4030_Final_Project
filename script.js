d3.csv("deadly_crash_data.csv").then(function (dataset) {
    var dimensions = {
        width: 800,
        height: 800,
        margin: {
            top: 10,
            bottom: 50,
            right: 10,
            left: 50
        }
    }  

    var xAccessor = d => +d.year
    
    var svg = d3.select("#barchart")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
  
    var xScale = d3.scaleLinear()
      .domain(d3.extent(dataset,xAccessor))
      .range([dimensions.margin.left,dimensions.width-dimensions.margin.right])

    
    var keys = dataset.columns.slice(1)

    var maxl = d3.max(dataset, function(d) {
      var maxNames = 0
      for (var i = 0; i < keys.length; i++) {
        maxNames = maxNames + parseInt(d[keys[i]])
      }
      return maxNames;
    })

    var yScale = d3.scaleLinear()
      .domain([0, maxl])
      .range([dimensions.height-dimensions.margin.bottom,dimensions.margin.top])

    var colorScale = d3.scaleOrdinal()
                      .domain(keys)
                      .range([
                        "#FF5733",
                        "#0072B5",
                        "#D62AD0",
                        "#34C924",
                        "#FFAA00",
                        "#6600CC",
                        "#4F7942",
                        "#FF0099"
                      ])

    var stackedData = d3.stack().keys(keys)(dataset)

    var bars = svg.append("g")
                  .selectAll("g")
                  .data(stackedData)
                  .enter()
                  .append("g")
                  .attr("fill", d => colorScale(d.key))
                  .selectAll("rect")
                  .data(function(d) {return d})
                  .enter()
                  .append("rect")
                  .attr("x", d => xScale(+d.data.year))
                  .attr("y", d => yScale(d[1]))
                  .attr("height", d => yScale(d[0]) - yScale(d[1]))
                  .attr("width", d => 2)

    
    var xAxisGen = d3.axisBottom().scale(xScale)

    var xAxis = svg.append("g")
        .call(xAxisGen)
        .style("transform", `translateY(${dimensions.height-dimensions.margin.bottom}px)`)

    var yAxisGen = d3.axisLeft().scale(yScale)
    var yAxis = svg.append("g")
                    .call(yAxisGen)
                    .style("transform", `translateX(${dimensions.margin.left}px)`)

  })
  