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
        $("#countryName").text(getToCurrencyCity($("#tags").val()));
        // Load statistical series data
        var seriesQueryString = timeSeriesString(toCurrency, fromCurrency);
        $.get(seriesQueryString, function(data) {
          console.log(data);
        });
        // Load statistical measures
        var statisticsQueryString = statisticsString(toCurrency, fromCurrency);
        $.get(statisticsQueryString, function(data) {
          console.log(data);
        });
        cities = getCities()
        currencyCities = cities[toCurrency];
        var bounds = new google.maps.LatLngBounds();
        currencyCities['cities'].forEach(function(city) {
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

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
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