let months = ["January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

days = d3.range(1, 32),

years = [2012, 2013, 2014]

    margin = {
        top: 90,
        right: 60,
        bottom: 140,
        left: 75
    };

width = Math.max(Math.min(window.innerWidth, 1000), 500) - margin.left - margin.right;
gridSize = Math.floor(width / days.length);
height = gridSize * months.length;


var maingroup = d3.select("body>#cont1>#visu2")
    .append("svg")
    .attr("class", "svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var monthLabels = maingroup.selectAll(".monthLabel")
    .data(months)
    .enter().append("text")
    .text(function(d) { return d; })
    .attr("x", 10) // bouger labels des mois
    .attr("y", function(d, i) { return (i + 1) * gridSize; })
    .attr("transform", "translate(-6," + gridSize / 1.5 + ")")
    .attr("class", function(d, i) { return ((i >= 0 && i <= 4) ? "monthLabel axis-days" : "monthLabel"); })
    .style("text-anchor", "end");

var timeLabels = maingroup.selectAll(".timeLabel")
    .data(days)
    .enter().append("text")
    .text(function(d) { return d; })
    .attr("x", function(d, i) { return (i + 1) * gridSize; })
    .attr("y", 20)
    .attr("transform", "translate(" + gridSize / 2 + ", -6)")
    .attr("class", function(d, i) { return ((i >= 9 && i <= 19) ? "timeLabel axis-worktime" : "timeLabel"); })
    .style("text-anchor", "middle");

var tooltip = d3.select("body").append("div")
    .attr("class", "hidden tooltip")


// choose path

path = "https://raw.githubusercontent.com/lctdulac/dataviz-d3/master/data/conso_by_day_total.csv";


d3.csv(path, (data) => {

    // Data loading
    data.forEach(function(d) {
        d.cons = +d.Consommation;
        d.day = +d.Jour;
        d.month = +d.Mois;
        d.year = +d.Année;
    });

    // Create the grid
    heatMap = maingroup.selectAll(".day") // var
        .data(data)
        .enter().append("rect")
        .attr("x", function(d) { return d.day * gridSize; })
        .attr("y", function(d) { return d.month * gridSize; })
        .attr("width", gridSize)
        .attr("height", gridSize)
        .style("stroke", "white")
        .style("stroke-opacity", 0.6) // fill va après
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .on("mouseover", mouseover)


    // Create the scales
    createScales(data);

    // Init
    var chosenyear = 2012;

    maingroup.append("text")
                .attr("class", "subtitle")
                .attr("x", width / 2)
                .attr("y", -40)
                .style("text-anchor", "middle")
                .style("font-weight", "bold") // .text("Total Consumption in " + chosenyear + " - " + numberWithCommas(d3.sum(data, function(d) { return d.cons; })) + " MWh");

    update(chosenyear, data);


    // Slider update : filter the data
    d3.select("input[type=range]#chosenyear").on("input", function() {
        console.log("aaa")
        chosenyear = this.value;
        d3.select("output#chosenyear").text(chosenyear);

        // Update the data
        update(chosenyear, data);

    });

})



function createScales(data) {


    consoScale = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return d.cons; })])
        .range([0, width])

    colorScale = d3.scaleLinear()
                .domain([0, d3.max(data, function(d) { return d.cons; }) / 2, d3.max(data, function(d) { return d.cons; })])
                .range(["#fdf6c8", "#fdcfaa", "#bc2f19"]);

    numStops = 3;
    consoPoint = [0, d3.max(data, function(d) { return d.cons; }) / 2, d3.max(data, function(d) { return d.cons; })];

    maingroup.append("defs")
        .append("linearGradient")
        .attr("id", "legend-traffic")
        .attr("x1", "0%").attr("y1", "0%")
        .attr("x2", "100%").attr("y2", "0%")
        .selectAll("stop")
        .data(d3.range(numStops))
        .enter().append("stop")
        .attr("offset", function(d, i) {
            return consoScale(consoPoint[i]) / width;
        })
        .attr("stop-color", function(d, i) {
            return colorScale(consoPoint[i]);
        });

    legendWidth = Math.min(width * 0.8, 400);

    legendsvg = maingroup.append("g") // groupe principal
        .attr("class", "legendWrapper")
        .attr("transform", "translate(" + (width / 2) + "," + (gridSize * months.length + 80) + ")");

    legendsvg.append("rect") // rectangle avec gradient
        .attr("class", "legendRect")
        .attr("x", -legendWidth / 2)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", 10)
        .style("fill", "url(#legend-traffic)");

    legendsvg.append("text") // légende
        .attr("class", "legendTitle")
        .attr("x", 0)
        .attr("y", 50)
        .style("text-anchor", "middle")
        .text("Daily consumption (MWh)");

    xScale = d3.scaleLinear() // scale pour x-axis
        .range([-legendWidth / 2, legendWidth / 2])
        .domain([0, d3.max(data, function(d) { return d.cons; })]);

    legendsvg.append("g") // x axis
        .attr("class", "axis")
        .attr("transform", "translate(0," + (10) + ")")
        .call(d3.axisBottom(xScale).ticks(5));
            // d3.select("#year").html("Année " + (years[Number(slider.property("value")) + 1]))
}



function update(chosenyear, data) {

            console.log(chosenyear)
            console.log(data)
            data = data.filter(function(d){return d.year == chosenyear;})
            console.log(data)

            heatMap.data(data);

            heatMap.select(".day.rect")
                .transition()
                .duration(800)
                .attr("fill", d => colorScale(d.cons));

            maingroup.select("text.subtitle")
                .transition()
                .text("Total Consumption in " + chosenyear + " - " + numberWithCommas(d3.sum(data, function(d) { return d.cons; })) + " MWh");

                }

function mousemove(d) {
    var mouse = d3.mouse(this);
    tooltip
        .attr("style", "left:" + (mouse[0] + 150) + "px; top:" + (mouse[1] + 390) + "px")
}


function mouseout(d) {
    tooltip.classed("hidden", true)
    d3.select(this)
        .transition()
        .duration(500)
        .style("opacity", 1)
}

function mouseover(d) {
    var s = d3.select(this);
    s
        .transition()
        .duration(100)
        .style("opacity", 0.5)
    tooltip
        .classed("hidden", false)
        .html(d.day + "/" + d.month + " - <b>" + numberWithCommas(d.cons) + " MWh </b>")
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
