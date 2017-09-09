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

  console.log(stack)

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
      .attr("id", function(d) { return d.key + "-path"; })
      .style("fill", function(d) { if(d.key == "ind") return "#fff"; return color[continents[countriesJson[d.key]]]; })
      .style("stroke", "#3a3a3a")
      .style("stroke-width", 0.3)
      .on("click", function(d) {
        console.log(countriesJson[d.key]);
        // console.log(d);
      })
      .on("mousemove", function(d) {
        d3.select("#tooltip-container").style("opacity", 0.9)
        var mouse = d3.mouse(this);
        var year = (Math.floor(x.invert(mouse[0])));
        var country_players = d[year - 1968]["data"][d.key];
        var total_players = d[year - 1968]["data"]["total_players"];
        var total_countries = d[year - 1968]["data"]["total_countries"];
        d3.select("#tooltip-container")
          .style("left", (mouse[0] * 100 / width + 0.2) + "%")
          .style("top", (mouse[1] * 100 / height + 2) + "%");

        d3.select("#tooltip-country-name")
          .text(countriesJson[d.key])
          .style("color", color[continents[countriesJson[d.key]]]);

        d3.select("#tooltip-year").text(year);
        d3.select("#tooltip-country-players").text("Players: " + country_players);
        d3.select("#tooltip-total-players").text("Total players: " + total_players);
        d3.select("#tooltip-total-countries").text("Total countries: " + total_countries);
      })
      .on("mouseout", function(d) {
        d3.select("#tooltip-container").style("opacity", 0)
      });

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0, " + navHeight + ")")
    .call(xAxis);
  svg
    .select(".domain")
    .remove();
}