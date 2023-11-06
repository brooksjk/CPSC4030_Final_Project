d3.csv("cleaned_crash_data_zipc.csv").then(
    function (dataset) {
        console.log(dataset)

        var dimensions = {
            width: 1900,
            height: 800,
            margin: {
                top: 50,
                bottom: 50,
                right: 10,
                left: 200
            }
        }

        var svg = d3.select("#barchart")
            .style("width", dimensions.width)
            .style("height", dimensions.height)

        svg.append("text")
            .attr("x", dimensions.margin.left)
            .attr("y", dimensions.margin.top / 2)
            .text("Fatalities by Car Involved")
            .attr("font-size", "30px")
            .attr("font-weight", "bold")

        var dataByVehicle = {}

        dataset.forEach(function (d) {
            var vehicle1 = d["VEHICLE TYPE CODE 1"]
            var vehicle2 = d["VEHICLE TYPE CODE 2"]
            var fatalities = +d["NUMBER OF PERSONS KILLED"]

            if (fatalities > 0) {
                if (!dataByVehicle[vehicle1]) {
                    dataByVehicle[vehicle1] = 0
                }
                if (!dataByVehicle[vehicle2]) {
                    dataByVehicle[vehicle2] = 0
                }
                if (vehicle1 !== ""){
                    dataByVehicle[vehicle1] += fatalities;
                }
                if (vehicle2 !== ""){
                    dataByVehicle[vehicle2] += fatalities;
                }
            }
        })

        var sortedData = Object.keys(dataByVehicle).map(function (vehicle) {
            return { vehicle: vehicle, fatalities: dataByVehicle[vehicle] }
        }).filter(function(d){
            return d.vehicle.trim() !== ""
        }).sort(function (a, b) {
            return b.fatalities - a.fatalities
        })

        var maxSum = d3.max(sortedData, d => d.fatalities)

        var yScale = d3.scaleBand()
            .domain(sortedData.map(d => d.vehicle))
            .range([dimensions.margin.top, dimensions.height - dimensions.margin.bottom])
            .padding(0.2)

        var xScale = d3.scaleLinear()
            .domain([0, maxSum])
            .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])

        var bars = svg.append("g")
            .selectAll("rect")
            .data(sortedData)
            .enter()
            .append("rect")
            .attr("y", d => yScale(d.vehicle))
            .attr("x", dimensions.margin.left)
            .attr("width", d => xScale(d.fatalities) - dimensions.margin.left)
            .attr("height", yScale.bandwidth())
            .attr("fill", '#ADD8E6')

        var yAxis = d3.axisLeft(yScale)
        var xAxis = d3.axisBottom(xScale)

        svg.append("g")
            .attr("transform", "translate(" + dimensions.margin.left + ",0)")
            .call(yAxis)

        svg.append("g")
            .attr("transform", "translate(0," + (dimensions.height - dimensions.margin.bottom) + ")")
            .call(xAxis)
    }
)