//Link below used to help with general format of hoow to create bubble chart
//https://multimedia.report/classes/coding/2018/exercises/basicbubblepackchart/

d3.csv("cleaned_crash_data_zipc.csv").then(function(dataset) {
    dataset = dataset.map(function(d) { 
        return {
            value: +d["NUMBER OF PERSONS INJURED"] + +d["NUMBER OF PERSONS KILLED"],
            category: d["CONTRIBUTING FACTOR VEHICLE 1"]
        };
    });

    var diameter = 500,  //max size of a bubble
        format = d3.format(",d"),
        color = d3.scaleOrdinal(d3.schemeCategory10);

    var bubble = d3.pack()
        .size([diameter, diameter])
        .padding(1.5);

    var svg = d3.select("#bubbleplot")
        .append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .attr("class", "bubble");

    var root = d3.hierarchy({ children: dataset })
        .sum(function(d) { return d.value; })
        .sort(function(a, b) { return b.value - a.value; });

    bubble(root);

    var bubbles = svg.selectAll(".bubble")
        .data(root.children)
        .enter();

    bubbles.append("circle")
        .attr("class", "circle")
        .attr("r", function(d) { return d.r; })
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .style("fill", function(d) { return color(d.value); });

    bubbles.append("text")
        .attr("x", function(d) { return d.x; })
        .attr("y", function(d) { return d.y + 5; })
        .attr("text-anchor", "middle")
        .text(function(d) { return d.data.category; })
        .style("fill", "white")
        .style("font-family", "Helvetica Neue, Helvetica, Arial, san-serif")
        .style("font-size", "12px");
});
