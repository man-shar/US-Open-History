$( "window" ).scroll(function() {
  var body_position = ($("body").scrollLeft());
  var svg_position_left = $("#graphic-svg").position().left
  var svg_position_right = $("#graphic-svg").position().left + $("#graphic-svg").width()

  if((svg_position_left - ($($(".titles-wrapper")[0])).outerWidth()) + 100 <= body_position && (svg_position_right - ($($(".titles-wrapper")[0])).outerWidth()) >= body_position) {
    d3.select("#legend-container").style("display", "block");
  }
  else {
    d3.select("#legend-container").style("display", "none");
  }
});

// $(document).on("scrollstart", function() {
// 	console.log("aga")
//   var body_position = ($("body").scrollLeft());
//   var svg_position_left = $("#graphic-svg").position().left
//   var svg_position_right = $("#graphic-svg").position().left + $("#graphic-svg").width()

//   if((svg_position_left - ($($(".titles-wrapper")[0])).outerWidth()) + 100 <= body_position && (svg_position_right - ($($(".titles-wrapper")[0])).outerWidth()) >= body_position) {
//     d3.select("#legend-container").style("display", "block");
//   }
//   else {
//     d3.select("#legend-container").style("display", "none");
//   }
// });

$(document).on("touchmove", function() {
	console.log("aga")
  var body_position = ($("body").scrollLeft());
  var svg_position_left = $("#graphic-svg").position().left
  var svg_position_right = $("#graphic-svg").position().left + $("#graphic-svg").width()

  if((svg_position_left - ($($(".titles-wrapper")[0])).outerWidth()) + 100 <= body_position && (svg_position_right - ($($(".titles-wrapper")[0])).outerWidth()) >= body_position) {
    d3.select("#legend-container").style("display", "block");
  }
  else {
    d3.select("#legend-container").style("display", "none");
  }
});


document.onkeydown = checkKey;

function checkKey(e) {
    e = e || window.event;
    if (e.keyCode == '9') {
        e.preventDefault();
    }
}

d3.select("#close-tooltip")
  .on("click", function(d) {
    d3.select("#tooltip-container").style("opacity", 0);
  })

$(function() {
   $("body").mousewheel(function(event, delta) {
      this.scrollLeft -= (delta * 30);    
      event.preventDefault();
   });
});

d3.selectAll(".right-arrow").on("click", function() {
  var pos =d3.select("body").node().scrollLeft;
  pos = ($($(".titles-wrapper")[0])).outerWidth() * (Math.floor(pos / ($($(".titles-wrapper")[0])).outerWidth()) + 1);
  $("html, body").animate({scrollLeft: pos}, 500);
})

d3.selectAll(".left-arrow").on("click", function() {
  // debugger;
  var pos =d3.select("body").node().scrollLeft;
  pos = ($($(".titles-wrapper")[0])).outerWidth() * (Math.ceil(pos / ($($(".titles-wrapper")[0])).outerWidth()) - 1);
  $("html, body").animate({scrollLeft: pos}, 500);
})

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

  // console.log(data)

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
      .on("mousemove", function(d) {
        d3.select("#tooltip-container").style("opacity", 0.9)
        d3.select("#" + d.key + "-path").style("stroke", "#fff").style("stroke-width", 1);
        var mouse = d3.mouse(this);
        var year = (Math.round(x.invert(mouse[0])));
        var country_players = d[year - 1968]["data"][d.key];
        var total_players = d[year - 1968]["data"]["total_players"];
        var total_countries = d[year - 1968]["data"]["total_countries"];

        if(mouse[1] < 50)
        {
          // debugger;
          d3.select("#tooltip-container")
          .style("top", ((20000) / height + 0.2) + "%");
        }

        if(mouse[1] > (height - 150))
        {
          // debugger;
          d3.select("#tooltip-container")
          .style("top", ((height - 150) * 100 / height + 0.2) + "%");
        }

        if(mouse[1] > 50 && mouse[1] < (height - 150))
        {
          d3.select("#tooltip-container")
          .style("top", ((mouse[1]) * 100 / height + 0.2) + "%");
        }

        if(mouse[0] > (width - 150))
        {
          d3.select("#tooltip-container")
          .style("left", (((width) - 250) * 100 / width + 0.2) + "%");
        }

        if(mouse[0] < (width - 150))
        {
          d3.select("#tooltip-container")
          .style("left", (mouse[0] * 100 / width + 0.2) + "%")
        }

        d3.select("#tooltip-country-name")
          .text(countriesJson[d.key])
          .style("color", color[continents[countriesJson[d.key]]]);

        d3.select("#tooltip-year").text(year);
        d3.select("#tooltip-country-players").text("Players: " + country_players);
        d3.select("#tooltip-total-players").text("Total players: " + total_players);
        d3.select("#tooltip-total-countries").text("Total countries: " + total_countries);
      })
      .on("mouseout", function(d) {
        d3.select("#" + d.key + "-path")
        .style("stroke", "#3a3a3a")
        .style("stroke-width", 0.3)
        d3.select("#tooltip-container").style("opacity", 0)
      });

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0, " + navHeight + ")")
    .call(xAxis);
  svg
    .select(".domain")
    .remove();

  d3.select(".axis--x")
    .selectAll(".tick:last-child")
    .attr("transform", "translate(19978.5,0)")
    .select("text")
    .attr("x", -11);

  var max = data.reduce(function(acc, year, i) {
    acc[year.year] = {}
    acc[year.year] = countries.sort(function(a, b) {
      if(+year[a] >= +year[b])
        return -1
      return 1
    }).slice(0, 5)
    return acc;
  }, {});

  // console.log(stack)

  // var vals = stack.reduce(function(acc, country) {
  //   acc[country.key] = country;
  //   return acc;
  // }, {});

  // var str = "";
  // // <div class='player-count-label aiAbs' style='top:59.4299%;left:0.1862%;'>
  // //           <p class='aiPstyle4'>USA: 51 players</p>
  // //         </div>
  // console.log

  // d3.range(1968, 2018).forEach(function(year, i) {
  //   max[year + ""].forEach(function(country, j) {
  //     if(data[year - 1968][country] >= 5) {
  //       str += "<div class='player-count-label aiAbs' style='top:" + (y((vals[country][year - 1968][1] + vals[country][year - 1968][0]) / 2) * 100 / height + 20 * 100 / height) + "%;left:" + ((x(year) + 10) / 200 + 0.12) + "%;'>\n<p class='aiPstyle4'>" + countriesJson[country] + ": " + data[year - 1968][country] + " players</p>\n</div>\n"
  //     }
  //   });
  // });
  // console.log(str)
}