//useful source https://observablehq.com/@d3/bubble-chart/2

d3.csv("cleaned_crash_data_zipc.txt").then(
    
    function(dataset){
        
        console.log(dataset)

        var dimensions = {
            width: 800,
            height: 500,
            margin: {
                top: 20,
                bottom: 20,
                right: 20,
                left: 20
            }
        }

        var svg = d3.select("#bubblechart")
            .append("svg")
            .attr("width", dimensions.width + dimensions.margin.left + dimensions.margin.right)
            .attr("height", dimensions.height, dimensions.height + dimensions.margin.top + dimensions.margin.bottom)
            .append("g")
            .attr("transform", `translate(${dimensions.margin.left}, ${dimensions.margin.top})`);

        var xScale = d3.scaleLinear()
            .domain([0, d3.max(dataset, d => d["NUMBER OF PERSONS INJURED"] + d["NUMBER OF PERSONS KILLED"])])
            .range([0, dimensions.width]);
      
        var yScale = d3.scaleLinear()
            .domain([0, dataset.length])
            .range([0, dimensions.height]);
        
        
        // Create bubbles based on the data
        var bubbles = svg.selectAll(".bubble")
            .data(dataset)
            .enter()
            .append("g") // Create a group for each bubble
            .attr("class", "bubble")
            .attr("transform", (d, i) => `translate(0, ${yScale(i)})`);

        bubbles.append("circle")
            .attr("cx", d => xScale(d["NUMBER OF PERSONS INJURED"] + d["NUMBER OF PERSONS KILLED"]))
            .attr("r", d => Math.sqrt(d["NUMBER OF PERSONS INJURED"] + d["NUMBER OF PERSONS KILLED"]))
            .attr("fill", "steelblue");

        // Add text labels to the bubbles
        bubbles.append("text")
            .attr("x", 10) // Adjust the x-position of the label
            .attr("dy", "0.35em") // Vertical alignment
            .text(d => d["CONTRIBUTING FACTOR VEHICLE 1"])
            .style("font-size", "12px"); // Adjust the font size
    }
)