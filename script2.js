function countContributingFactors(data) {
    let factorCounts = {};

    data.forEach(row => {
        let factor = row["CONTRIBUTING FACTOR VEHICLE 1"];
        if (factor != "Unspecified") { 
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
