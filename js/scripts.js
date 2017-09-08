$(function() {
   $("body").mousewheel(function(event, delta) {
      this.scrollLeft -= (delta * 30);    
      event.preventDefault();
   });
});

var svg = d3
    .select("#graphic-svg");

  var height = document.getElementById("graphic-svg").clientHeight
  var width = 20000

  svg.attr("width", width);

  var margin = {top: 20, right: 20, bottom: 60, left: 20};
  var width = width;
  var height = height - margin.top;
  var g = svg.append("g").attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
  var navHeight = $(".nav").height();

countries = ["usa","alg","sen","aus","cze","gbr","ger","ned","bra","rus","rsa","chi","esp","ind","col","rou","srb","ven","zim","pak","nzl","bol","ngr","pol","arg","swe","aut","isr","per","sui","can","par","uru","svk","fra","ita","ecu","mex","bah","fin","cro","hun","bel","pur","egy","jam","jpn","por","geo","tur","ukr","tpe","mda","kor","lux","dom","lat","kaz","cyp","irl","slo","bih","bul","uzb","ltu","tun","est","arm","mar","den","blr","bar","crc","nor","ken","phi","tha","mon","and"];

var x = d3.scaleLinear()
    .rangeRound([0, width]);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

var q = d3.queue();
q.defer(d3.csv, "assets/country_by_year2.csv");
q.defer(d3.json, "assets/countries.json");
q.defer(d3.json, "assets/continents.json");
q.await(make)

function make(error, data, countriesJson, continents) {
  if (error) throw error;

  countries = countries.sort(function(a, b) {
    if(+data[49][a] >= +data[49][b])
      return 1
    return -1;
  });
  
  var stack = d3.stack()
    .keys(countries)
    (data);

  
  var x = d3.scaleLinear()
    .domain([1968, 2017])
    .range([0, width]);

  var xAxis = d3.axisTop(x).tickFormat(function(d){return d;}).tickValues(d3.range(1968, 2018)).tickSize(-(height - navHeight));

  var y = d3.scaleLinear()
      .domain([0, 150])
      .range([height, 0]);

  var color = {
    "Asia": '#334d5c',
    "Europe": '#45b29d',
    "North America": '#e27a3f',
    "South America": '#df5a49',
    "Africa": '#386cb0',
    "Oceania": '#efc94c'
  };

  var area = d3.area()
      .x(function(d) { return x(d.data.year); })
      .y0(function(d) { return y(d[0]); })
      .y1(function(d) { return y(d[1]); })
      .curve(d3.curveBasis);

  g.selectAll("path")
      .data(stack)
      .enter().append("path")
      .attr("d", area)
      .style("fill", function(d) { return color[continents[countriesJson[d.key]]]; })
      .style("stroke", "#3a3a3a")
      .style("stroke-width", 0.3)
      .on("click", function(d) {
        console.log(countriesJson[d.key]);
        // console.log(d);
      });

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0, " + navHeight + ")")
    .call(xAxis);
  svg
    .select(".domain")
    .remove();
}