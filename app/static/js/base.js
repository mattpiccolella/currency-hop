var HOST = "http://localhost:5000/";
var map;
var markers = [];
function initialize() {
  var mapOptions = {
    center: { lat: -34.397, lng: 150.644},
    zoom: 8
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);
}
google.maps.event.addDomListener(window, 'load', initialize);

$(function() {
    $("#search").click(function(e) {
      var fromCurrency = $("#fromCurr").val();
      var toCurrency = getToCurrencyCode($("#tags").val());
      if (fromCurrency && toCurrency) {
        var countryName = getToCurrencyCity($("#tags").val());
        $("#countryName").text(countryName);
        // Load statistical series data
        var seriesQueryString = timeSeriesString(toCurrency, fromCurrency);
        $.get(seriesQueryString, function(data) {
          $("#chartTitle").empty();
          $("#chart").empty();
          $("#chartTitle").text("Analysis: " + fromCurrency + " to " + toCurrency);
          var prices = []
          var fields = []
          var index = 0
          data.forEach(function(datum) {
            prices.push(datum['price']);
            fields.push(index);
            index += 1;
          });
          var data = [ { label: "Data Set 1", 
                 x: fields, 
                 y: prices } ] ;
          addGraph(data);
        });
        // Load statistical measures
        var statisticsQueryString = statisticsString(toCurrency, fromCurrency);
        $.get(statisticsQueryString, function(data) {
          $("#measures").empty()
          var dataString = "<p><b>Mean:</b> $" + data['statistics'][0]['mean'].toFixed(2) +  " " + toCurrency + " to 1 " + fromCurrency + " ";
          dataString += "<b>Standard Deviation:</b> $" + data['statistics'][0]['stdev'].toFixed(2) + " " + toCurrency + " to 1 " + fromCurrency + "</p>";
          $("#measures").append(dataString);
          var percentileString = "<p><b>Most Recent Price:</b> $" + data['latest'][0]['price'].toFixed(2);
          var percentile = (compute(data['latest'][0]['price'], data['statistics'][0]['mean'], data['statistics'][0]['stdev'])) * 100;
          percentileString += " (" + percentile.toFixed(2) + "th percentile)</p>";
          $("#measures").append(percentileString);
          $("#measures").append("<p><b>Advice:</b> " + getAdviceMessage(percentile, countryName) + "</p>");
        });
        cities = getCities()
        currencyCities = cities[toCurrency];
        var bounds = new google.maps.LatLngBounds();
        $("#city-names").empty()
        currencyCities['cities'].forEach(function(city) {
          $("#city-names").append("<p>" + city['name'] + "</p>")
          var myLatlng = new google.maps.LatLng(city['latitude'],city['longitude']);
          var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            title: 'Hello World!'
          });
          bounds.extend(myLatlng);
        });
        map.fitBounds(bounds);
        var listener = google.maps.event.addListener(map, "idle", function() { 
          if (map.getZoom() > 6) {
            map.setZoom(6); 
            google.maps.event.removeListener(listener); 
          }
        });
      }
    });
});

function getAdviceMessage(percentile,to_curr) {
  if (percentile >= 90) {
    return "The time is ripe! Pack your bags for " + to_curr + "!";
  } else if (percentile >= 70) {
    return "You may want to consider going to " + to_curr + " soon. The economic conditions are favorable.";
  } else if (percentitle >= 40) {
    return "It's not looking super hot. I'd consider waiting";
  } else {
    return "Steer clear. Your money is no good here.";
  }
}

function getToCurrencyCode(toCurrencyString) {
  var words = toCurrencyString.split(' ');
  if (words.length > 1) {
    var init = words[1].indexOf('(');
    var fin = words[1].indexOf(')');
    if ((init >= 0) && (fin > 0)) {
      return words[1].substr(init+1,fin-init-1)
    } else {
      return null;
    }
  } else {
    return null;
  }
}

function getToCurrencyCity(toCurrencyString) {
  return toCurrencyString.split(' ')[0];
}

function timeSeriesString(toCurr, fromCurr) {
  return HOST + "data/series/" + toCurr + "/" + fromCurr;
}

function statisticsString(toCurr, fromCurr) {
  return HOST + "data/statistics/" + toCurr + "/" + fromCurr;
}

function clearMap() {
  clearMarkers();
  markers = [];
}

function addGraph(data) {
  var xy_chart = d3_xy_chart()
      .width(520)
      .height(284)
      .xlabel("Days since 02/01/2013")
      .ylabel("Exchange Rate") ;
  var svg = d3.select("#chart").append("svg")
      .datum(data)
      .call(xy_chart);

  function d3_xy_chart() {
      var width = 640,  
          height = 480, 
          xlabel = "X Axis Label",
          ylabel = "Y Axis Label" ;
      
      function chart(selection) {
          selection.each(function(datasets) {
              //
              // Create the plot. 
              //
              var margin = {top: 20, right: 80, bottom: 30, left: 50}, 
                  innerwidth = width - margin.left - margin.right,
                  innerheight = height - margin.top - margin.bottom ;
              
              var x_scale = d3.scale.linear()
                  .range([0, innerwidth])
                  .domain([ d3.min(datasets, function(d) { return d3.min(d.x); }), 
                            d3.max(datasets, function(d) { return d3.max(d.x); }) ]) ;
              
              var y_scale = d3.scale.linear()
                  .range([innerheight, 0])
                  .domain([ d3.min(datasets, function(d) { return d3.min(d.y); }),
                            d3.max(datasets, function(d) { return d3.max(d.y); }) ]) ;

              var color_scale = d3.scale.category10()
                  .domain(d3.range(datasets.length)) ;

              var x_axis = d3.svg.axis()
                  .scale(x_scale)
                  .orient("bottom") ;

              var y_axis = d3.svg.axis()
                  .scale(y_scale)
                  .orient("left") ;

              var x_grid = d3.svg.axis()
                  .scale(x_scale)
                  .orient("bottom")
                  .tickSize(-innerheight)
                  .tickFormat("") ;

              var y_grid = d3.svg.axis()
                  .scale(y_scale)
                  .orient("left") 
                  .tickSize(-innerwidth)
                  .tickFormat("") ;

              var draw_line = d3.svg.line()
                  .interpolate("basis")
                  .x(function(d) { return x_scale(d[0]); })
                  .y(function(d) { return y_scale(d[1]); }) ;

              var svg = d3.select(this)
                  .attr("width", width)
                  .attr("height", height)
                  .append("g")
                  .attr("transform", "translate(" + margin.left + "," + margin.top + ")") ;
              
              svg.append("g")
                  .attr("class", "x grid")
                  .attr("transform", "translate(0," + innerheight + ")")
                  .call(x_grid) ;

              svg.append("g")
                  .attr("class", "y grid")
                  .call(y_grid) ;

              svg.append("g")
                  .attr("class", "x axis")
                  .attr("transform", "translate(0," + innerheight + ")") 
                  .call(x_axis)
                  .append("text")
                  .attr("dy", "-.71em")
                  .attr("x", innerwidth)
                  .style("text-anchor", "end")
                  .text(xlabel) ;
              
              svg.append("g")
                  .attr("class", "y axis")
                  .call(y_axis)
                  .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 6)
                  .attr("dy", "0.71em")
                  .style("text-anchor", "end")
                  .text(ylabel) ;

              var data_lines = svg.selectAll(".d3_xy_chart_line")
                  .data(datasets.map(function(d) {return d3.zip(d.x, d.y);}))
                  .enter().append("g")
                  .attr("class", ".d3_xy_chart_line") ;
              
              data_lines.append("path")
                  .attr("class", "line")
                  .attr("d", function(d) {return draw_line(d); })
                  .attr("stroke", function(_, i) {return color_scale(i);}) ;
              
              data_lines.append("text")
                  .datum(function(d, i) { return {name: datasets[i].label, final: d[d.length-1]}; }) 
                  .attr("transform", function(d) { 
                      return ( "translate(" + x_scale(d.final[0]) + "," + 
                               y_scale(d.final[1]) + ")" ) ; })
                  .attr("x", 3)
                  .attr("dy", ".35em")
                  .attr("fill", function(_, i) { return color_scale(i); })
                  .text(function(d) { return d.name; }) ;

          }) ;
      }

      chart.width = function(value) {
          if (!arguments.length) return width;
          width = value;
          return chart;
      };

      chart.height = function(value) {
          if (!arguments.length) return height;
          height = value;
          return chart;
      };

      chart.xlabel = function(value) {
          if(!arguments.length) return xlabel ;
          xlabel = value ;
          return chart ;
      } ;

      chart.ylabel = function(value) {
          if(!arguments.length) return ylabel ;
          ylabel = value ;
          return chart ;
      } ;

      return chart;
  }
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
}

function normalcdf(x){   //HASTINGS.  MAX ERROR = .000001
  var t=1/(1+.2316419*Math.abs(x));
  var d=.3989423*Math.exp(-x*x/2);
  var prob=d*t*(.3193815+t*(-.3565638+t*(1.781478+t*(-1.821256+t*1.330274))));
  if (x>0) {
    prob=1-prob
  }
  return prob
}   

function compute(argument,mean,stdev) {
    z=eval(argument)
    m=eval(mean)
    sd=eval(stdev)
    with (Math) {
      if (sd<0) {
        alert("The standard deviation must be nonnegative.")
      } else if (sd==0) {
          if (z<m){
              prob=0
          } else {
            prob=1
        }
      } else {
        prob=normalcdf((z-m)/sd);
        prob=round(100000*prob)/100000;
      }
  }
  return prob
}

function getCities() {
  return {
    "ARS" : {
      "cities" : [
        {
          "name": "Buenos Aires",
          "latitude": -34.6033,
          "longitude": -58.3817
        },
        {
          "name": "Cordoba",
          "latitude": -31.4167,
          "longitude": -64.1833
        }
      ]
    },
    "AUD" : {
      "cities" : [
        {
          "name": "Sydney",
          "latitude": -33.8600,
          "longitude": 151.2094
        },
        {
          "name": "Melbourne",
          "latitude": -37.8136,
          "longitude": 144.9631
        },
        {
          "name": "Adelaide",
          "latitude": -34.9290,
          "longitude": 138.6010
        },
        {
          "name": "Perth",
          "latitude": -31.9522,
          "longitude": 115.8589
        }
      ]
    },
    "BRL" : {
      "cities" : [
        {
          "name": "Rio de Janiero",
          "latitude": -22.9083,
          "longitude": -43.1964
        },
        {
          "name": "Sao Paulo",
          "latitude": -23.5500,
          "longitude": -46.6333
        }
      ]
    },
    "BSD" : {
      "cities" : [
        {
          "name": "Nassau",
          "latitude": 25.0600,
          "longitude": -77.3450
        }
      ]
    },
    "CAD" : {
      "cities" : [
        {
          "name": "Montreal",
          "latitude": 45.5000,
          "longitude": -73.5667
        }, 
        {
          "name": "Toronto",
          "latitude": 43.7000,
          "longitude": -79.4000
        }, 
        {
          "name": "Vancouver",
          "latitude": 49.2500,
          "longitude": -123.1000
        }
      ]
    },
    "CHF" : {
      "cities" : [
        {
          "name": "Geneva",
          "latitude": 46.2000,
          "longitude": 6.1500
        },
        {
          "name": "Zurich",
          "latitude": 47.3667,
          "longitude": 8.5500
        }
      ]
    },
    "CNY" : {
      "cities" : [
        {
          "name": "Beijing",
          "latitude": 39.9139,
          "longitude": 116.3917
        }, 
        {
          "name": "Hong Kong",
          "latitude": 22.2670,
          "longitude": 114.1880
        },
        {
          "name": "Shanghai",
          "latitude": 31.2000,
          "longitude": 121.5000
        }
      ]
    },
    "EUR" : {
      "cities" : [
        {
          "name": "Barcelona",
          "latitude": 41.3833,
          "longitude": 2.1833
        },
        {
          "name": "Berlin",
          "latitude": 52.5167,
          "longitude": 13.3833
        },
        {
          "name": "Paris",
          "latitude": 48.8567,
          "longitude": 2.3508
        },
        {
          "name": "Rome",
          "latitude": 41.9000,
          "longitude": 12.5000
        }
      ]
    },
    "GBP" : {
      "cities" : [
        {
          "name": "London",
          "latitude": 51.5072,
          "longitude": -0.1275
        }, 
        {
          "name": "Liverpool",
          "latitude": 53.4000,
          "longitude": -3.0000
        }
      ]
    },
    "INR" : {
      "cities" : [
        {
          "name": "Mumbai",
          "latitude": 18.9750,
          "longitude": 72.8258
        },
        {
          "name": "Delhi",
          "latitude": 28.6100,
          "longitude": 77.2300
        }
      ]
    },
    "JMD" : {
      "cities" : [
        {
          "name": "Kingston",
          "latitude": 17.9833,
          "longitude": -76.8000
        }
      ]
    },
    "JPY" : {
      "cities" : [
        {
          "name": "Tokyo",
          "latitude": 35.6895,
          "longitude": 139.6917
        },
        {
          "name": "Osaka",
          "latitude": 34.6939,
          "longitude": 135.5022
        }
      ]
    },
    "MXN" : {
      "cities" : [
        {
          "name": "Cozumel",
          "latitude": 20.4167,
          "longitude": -86.9167 
        },
        {
          "name": "Mexico City",
          "latitude": 19.4333,
          "longitude": -99.1333
        }
      ]
    },
    "RUB" : {
      "cities" : [
        {
          "name": "Moscow",
          "latitude": 55.7500,
          "longitude": 37.6167
        },
        {
          "name": "Saint Petersburg",
          "latitude": 59.9500,
          "longitude": 30.3000
        }
      ]
    },
    "THB" : {
      "cities" : [
        {
          "name": "Bangkok",
          "latitude": 13.7500,
          "longitude": 100.4667
        }
      ]
    },
    "USD" : {
      "cities" : [
        {
          "name": "San Francisco",
          "latitude": 37.7833,
          "longitude": -122.4167
        },
        {
          "name": "New York",
          "latitude": 40.7127,
          "longitude": -74.0059
        },
        {
          "name": "Denver",
          "latitude": 39.7618,
          "longitude": -104.8811
        },
        {
          "name": "Honolulu",
          "latitude": 21.3000,
          "longitude": -157.8167
        }
      ]
    }
  }
}