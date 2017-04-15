/* Outputs the HTML for first result of a wiki query. Displays the first paragraph of the wiki article */
function wikiSearch(item) {
  // ADD A METHOD TO UPPERCASE FIRST LETTER OF EVERY WORD IN A QUERY
  url = "http://en.wikipedia.org/w/api.php?action=query&prop=description&titles=" + item.toString() + "&prop=extracts&exintro&explaintext&format=json&redirects&callback=?";
  $.getJSON(url, function(json) {
    var item_id = Object.keys(json.query.pages)[0]; // 
    sent = json.query.pages[item_id].extract;
    result = "<t><strong>" + item + "</strong></t>: " + sent;
    $('#wiki').html("<div>" + result + "</div>"); // Replace 
  });
}

/* Uses Yahoo Weather API to get weather info given a locational input */
function weather(city) {
  $.ajax({
    url: 'https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22' + city + '%2C%20il%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys',
    success: function(json) {
      //$('#title').html("<h2>" + json.query.results.channel.item.title + "</h2>" );
      //$('#title').html("<h2>" + json.query.results.channel.yweather.location + "</h2>" );
      $('#description').html("<h4>" + json.query.results.channel.item.description + "</h4>");
      $('#temperature').html("<p><strong>Temperature: </strong>" + json.query.results.channel.item.condition.temp + "&deg; F</p>");
      $('#wind-chill').html("<p><strong>Wind Chill: </strong>" + json.query.results.channel.wind.chill + "&deg; F</p>");
      $('#wind-speed').html("<p><strong>Wind Speed: </strong>" + json.query.results.channel.wind.speed + "mph</p>");
      $('#conditions').html("<p><strong>Conditions: </strong>" + json.query.results.channel.item.condition.text + "</p>");
      /*$('#pic').html('<img src="data:image/png;base64,' + json.query.results.channel.item.condition.code.image + '" >');*/
      var code = json.query.results.channel.item.condition.code;
      $('#pic').html("<p class='weatherInfo'><strong>Conditions: </strong> <img id='weatherpic' src='http://l.yimg.com/a/i/us/we/52/" + code + ".gif'></p>");
    }
  });
}

/* Displays What the user types in the input field */
function displayUserInput(city) {
  $(document).ready(function() {
    $('#welcome').html("<h2><strong>" + city + "</strong></h2>");
  });

}

/* When user clicks button, this function is called and executes these other functions param city is the input value from html*/
function submitcity(city) {
  /* Future. grab the user input using some jQuery, and then take away the parameter from submitcity and pass in cityinput local variable as arguments for the following functions. Also add a jquery event listener for button click to execute these functions, and remove the onClick attribute of the city input from the HTML page. */
  weather(city);
  wikiSearch(city);
  displayUserInput(city);
  initialize(city);
}
$(".btn-city").on('click', function() {
    var userinput = $('#city').val();
    submitcity(userinput);
});
$('#city').keypress(function(e){
    if(e.which == 13){//Enter key pressed
        $('.btn-city').click();//Trigger button click event
        return false; // Page won't refresh
    }
 });
/* Called on page load. Uses ipinfo API to get information(city and state) using users IP Address, and then passes the users city and state as an argument to the related functions  */
$.getJSON('http://ipinfo.io', function(data) {
  console.log(data)
  var aCity = data.city + ', ' + data.region;
  console.log(aCity)
  // Default: On page load, call these functions using users current location
  weather(aCity);
  wikiSearch(aCity);
  displayUserInput(aCity)
    //$("#welcome").html("<h2><strong>" + aCity + "</strong></h2>");
  // Google Places API Function
  initialize(aCity);
}, "jsonp");

/* This Autocompletes an input field with a city name using the jQuery UI library and geonames.org library  */
$(function() {
  function log(message) {
    $("<div id='#cityauto'>").text(message).prependTo("#log");
    $("#log").scrollTop(0);
  }

  $("#city").autocomplete({
    source: function(request, response) {
      $.ajax({
        url: "http://gd.geobytes.com/AutoCompleteCity",
        dataType: "jsonp",
        data: {
          q: request.term
        },
        success: function(data) {
          //response(data);
          /* Makes it so it autocompletes only first and second word separated by comma. This provides a better search particularly for the Wiki function which is buggy. */
          response($.map(data, function(v) {
            if (v.includes('United States')) {
              // Example Output: Brooklyn, NY and not Brooklyn, NY, United States
              return v.split(',').slice(0, -1).join(',')
              //return v.replace('United States','');
            }
            else { // for cities outside the U.S
              var arr = v.split(',');
              var first = arr.slice(0,-2); // City
              var last = arr.slice(2); // country 
              var output = first + ', ' + last;
              // Example: Manila, Philippines NOT Manila, MM, Philippines
              return output;
              //return v.split(',').splice(0,1, '').join(',')
            }
          })) // End response function
        }
      });
    },
    minLength: 3,
    select: function(event, ui) {
      log(ui.item ?
        "Selected: " + ui.item.label :
        "Nothing selected, input was " + this.value);
    },
    open: function() {
      $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
    },
    close: function() {
      $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
    }
  });
});

/* To add: Dynamic clock,and use lat/long to get time zone and timezone offset with Google API */
// Source: http://www.proglogic.com/code/javascript/time/worldclock.php
/*
function worldClock(zone, region) {
  var dst = 0
  var time = new Date()
  var gmtMS = time.getTime() + (time.getTimezoneOffset() * 60000)
  var gmtTime = new Date(gmtMS)
  var day = gmtTime.getDate()
  var month = gmtTime.getMonth()
  var year = gmtTime.getYear()
  if (year < 1000) {
    year += 1900
  }
  var monthArray = new Array("January", "February", "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December")
  var monthDays = new Array("31", "28", "31", "30", "31", "30", "31", "31", "30", "31", "30", "31")
  if (year % 4 == 0) {
    monthDays = new Array("31", "29", "31", "30", "31", "30", "31", "31", "30", "31", "30", "31")
  }
  if (year % 100 == 0 && year % 400 != 0) {
    monthDays = new Array("31", "28", "31", "30", "31", "30", "31", "31", "30", "31", "30", "31")
  }

  var hr = gmtTime.getHours() + zone
  var min = gmtTime.getMinutes()
  var sec = gmtTime.getSeconds()

  if (hr >= 24) {
    hr = hr - 24
    day -= -1
  }
  if (hr < 0) {
    hr -= -24
    day -= 1
  }
  if (hr < 10) {
    hr = " " + hr
  }
  if (min < 10) {
    min = "0" + min
  }
  if (sec < 10) {
    sec = "0" + sec
  }
  if (day <= 0) {
    if (month == 0) {
      month = 11
      year -= 1
    } else {
      month = month - 1
    }
    day = monthDays[month]
  }
  if (day > monthDays[month]) {
    day = 1
    if (month == 11) {
      month = 0
      year -= -1
    } else {
      month -= -1
    }
  }
  if (region == "NAmerica") {
    var startDST = new Date()
    var endDST = new Date()
    startDST.setMonth(3)
    startDST.setHours(2)
    startDST.setDate(1)
    var dayDST = startDST.getDay()
    if (dayDST != 0) {
      startDST.setDate(8 - dayDST)
    } else {
      startDST.setDate(1)
    }
    endDST.setMonth(9)
    endDST.setHours(1)
    endDST.setDate(31)
    dayDST = endDST.getDay()
    endDST.setDate(31 - dayDST)
    var currentTime = new Date()
    currentTime.setMonth(month)
    currentTime.setYear(year)
    currentTime.setDate(day)
    currentTime.setHours(hr)
    if (currentTime >= startDST && currentTime < endDST) {
      dst = 1
    }
  }
  if (region == "Europe") {
    var startDST = new Date()
    var endDST = new Date()
    startDST.setMonth(2)
    startDST.setHours(1)
    startDST.setDate(31)
    var dayDST = startDST.getDay()
    startDST.setDate(31 - dayDST)
    endDST.setMonth(9)
    endDST.setHours(0)
    endDST.setDate(31)
    dayDST = endDST.getDay()
    endDST.setDate(31 - dayDST)
    var currentTime = new Date()
    currentTime.setMonth(month)
    currentTime.setYear(year)
    currentTime.setDate(day)
    currentTime.setHours(hr)
    if (currentTime >= startDST && currentTime < endDST) {
      dst = 1
    }
  }

  if (region == "SAmerica") {
    var startDST = new Date()
    var endDST = new Date()
    startDST.setMonth(9)
    startDST.setHours(0)
    startDST.setDate(1)
    var dayDST = startDST.getDay()
    if (dayDST != 0) {
      startDST.setDate(22 - dayDST)
    } else {
      startDST.setDate(15)
    }
    endDST.setMonth(1)
    endDST.setHours(11)
    endDST.setDate(1)
    dayDST = endDST.getDay()
    if (dayDST != 0) {
      endDST.setDate(21 - dayDST)
    } else {
      endDST.setDate(14)
    }
    var currentTime = new Date()
    currentTime.setMonth(month)
    currentTime.setYear(year)
    currentTime.setDate(day)
    currentTime.setHours(hr)
    if (currentTime >= startDST || currentTime < endDST) {
      dst = 1
    }
  }
  if (region == "Cairo") {
    var startDST = new Date()
    var endDST = new Date()
    startDST.setMonth(3)
    startDST.setHours(0)
    startDST.setDate(30)
    var dayDST = startDST.getDay()
    if (dayDST < 5) {
      startDST.setDate(28 - dayDST)
    } else {
      startDST.setDate(35 - dayDST)
    }
    endDST.setMonth(8)
    endDST.setHours(11)
    endDST.setDate(30)
    dayDST = endDST.getDay()
    if (dayDST < 4) {
      endDST.setDate(27 - dayDST)
    } else {
      endDST.setDate(34 - dayDST)
    }
    var currentTime = new Date()
    currentTime.setMonth(month)
    currentTime.setYear(year)
    currentTime.setDate(day)
    currentTime.setHours(hr)
    if (currentTime >= startDST && currentTime < endDST) {
      dst = 1
    }
  }
  if (region == "Israel") {
    var startDST = new Date()
    var endDST = new Date()
    startDST.setMonth(3)
    startDST.setHours(2)
    startDST.setDate(1)
    endDST.setMonth(8)
    endDST.setHours(2)
    endDST.setDate(25)
    dayDST = endDST.getDay()
    if (dayDST != 0) {
      endDST.setDate(32 - dayDST)
    } else {
      endDST.setDate(1)
      endDST.setMonth(9)
    }
    var currentTime = new Date()
    currentTime.setMonth(month)
    currentTime.setYear(year)
    currentTime.setDate(day)
    currentTime.setHours(hr)
    if (currentTime >= startDST && currentTime < endDST) {
      dst = 1
    }
  }
  if (region == "Beirut") {
    var startDST = new Date()
    var endDST = new Date()
    startDST.setMonth(2)
    startDST.setHours(0)
    startDST.setDate(31)
    var dayDST = startDST.getDay()
    startDST.setDate(31 - dayDST)
    endDST.setMonth(9)
    endDST.setHours(11)
    endDST.setDate(31)
    dayDST = endDST.getDay()
    endDST.setDate(30 - dayDST)
    var currentTime = new Date()
    currentTime.setMonth(month)
    currentTime.setYear(year)
    currentTime.setDate(day)
    currentTime.setHours(hr)
    if (currentTime >= startDST && currentTime < endDST) {
      dst = 1
    }
  }
  if (region == "Baghdad") {
    var startDST = new Date()
    var endDST = new Date()
    startDST.setMonth(3)
    startDST.setHours(3)
    startDST.setDate(1)
    endDST.setMonth(9)
    endDST.setHours(3)
    endDST.setDate(1)
    dayDST = endDST.getDay()
    var currentTime = new Date()
    currentTime.setMonth(month)
    currentTime.setYear(year)
    currentTime.setDate(day)
    currentTime.setHours(hr)
    if (currentTime >= startDST && currentTime < endDST) {
      dst = 1
    }
  }
  if (region == "Australia") {
    var startDST = new Date()
    var endDST = new Date()
    startDST.setMonth(9)
    startDST.setHours(2)
    startDST.setDate(31)
    var dayDST = startDST.getDay()
    startDST.setDate(31 - dayDST)
    endDST.setMonth(2)
    endDST.setHours(2)
    endDST.setDate(31)
    dayDST = endDST.getDay()
    endDST.setDate(31 - dayDST)
    var currentTime = new Date()
    currentTime.setMonth(month)
    currentTime.setYear(year)
    currentTime.setDate(day)
    currentTime.setHours(hr)
    if (currentTime >= startDST || currentTime < endDST) {
      dst = 1
    }
  }

  if (dst == 1) {
    hr -= -1
    if (hr >= 24) {
      hr = hr - 24
      day -= -1
    }
    if (hr < 10) {
      hr = " " + hr
    }
    if (day > monthDays[month]) {
      day = 1
      if (month == 11) {
        month = 0
        year -= -1
      } else {
        month -= -1
      }
    }
    return monthArray[month] + " " + day + ", " + year + "<br>" + hr + ":" + min + ":" + sec + " DST"
  } else {
    return monthArray[month] + " " + day + ", " + year + "<br>" + hr + ":" + min + ":" + sec
  }
}

function worldClockZone() {
  document.getElementById("time").innerHTML = worldClock(-5, "NAmerica");
  setTimeout("worldClockZone()", 1000);
}
*/
// Google Places API
var geocoder = null;
var map;
var service;
var infowindow;
var gmarkers = [];
var bounds = null;

function initialize(city) {
  // Clear contents in sidebar div upon method call
  document.getElementById('side_bar').innerHTML = "";
  
  var styles = [{
    stylers: [{
        hue: "#00b2ff"
      }, {
        saturation: -50
      }, {
        lightness: 7
      }, {
        weight: 1
      }

    ]
  }, {
    featureType: "road",
    elementType: "geometry",
    stylers: [{
      lightness: 100
    }, {
      visibility: "on"
    }]
  }, {
    featureType: "road",
    elementType: "labels",
    stylers: [{
      visibility: "on"
    }]
  }];

  var styledMap = new google.maps.StyledMapType(styles, {
    name: "Styled Map"
  });
  
  geocoder = new google.maps.Geocoder();
  var pyrmont = new google.maps.LatLng(42.3601, -71.0589);

  map = new google.maps.Map(document.getElementById('map'), {
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    center: pyrmont,
    zoom: 12,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.SMALL
    },
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, 'map_style']
    }
  });
  geocoder.geocode({
    'address': city//"Brooklyn, NY"
  }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      var point = results[0].geometry.location;
      bounds = results[0].geometry.viewport;
      var rectangle = new google.maps.Rectangle({
        bounds: bounds,
        fillColor: "#d1d1e0",
        fillOpacity: 0.4,
        strokeColor: "#0000FF",
        strokeWeigth: 2,
        strokeOpacity: 0.9,
        map: map
      });
      map.fitBounds(bounds);
      var request = {
        bounds: bounds,
        //name: "starbucks",
        radius: 5000,
        //types: ['establishments']
        types: ['restaurants', 'night_club', 'zoo', 'park', 'casino', 'cafe', 'amusement_park', 'shopping_mall', 'aquarium']
      };
      infowindow = new google.maps.InfoWindow();
      service = new google.maps.places.PlacesService(map);
      service.search(request, callback);

    } else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
  // SET MAP STYLES
  map.mapTypes.set('map_style', styledMap);
  map.setMapTypeId('map_style');
}

function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}

function createMarker(place) {
  var blue_icon = 'http://www.google.com/intl/en_us/mapfiles/ms/micons/blue-dot.png'; // Optional blue icon
  var placeLoc = place.geometry.location;
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    icon: blue_icon
  });
  var request = {
    reference: place.reference
  };
  google.maps.event.addListener(marker, 'click', function() {
    service.getDetails(request, function(place, status) {
      if (status == google.maps.places.PlacesServiceStatus.OK) {
        var contentStr = "<img src='" + place.photos[0].getUrl({'maxWidth': 125, 'maxHeight': 125}) +"'>" + '<h5>' + place.name + '</h5><p>' + place.formatted_address;
        if (!!place.formatted_phone_number) contentStr += '<br>' + place.formatted_phone_number;
        if (!!place.website) contentStr += '<br><a target="_blank" href="' + place.website + '">' + place.website + '</a>';
        //contentStr += '<br>' + place.types + '</p>';
        contentStr += '<br><br>Review:<br>' + place.reviews[0].text + "<br>" + "Rating: " + place.reviews[0].rating + "<br>" + "-" + place.reviews[0].author_name + '</p>';
        infowindow.setContent(contentStr);
        infowindow.open(map, marker);
      }
    });

  });
  gmarkers.push(marker);
  var side_bar_html = "<a href='javascript:google.maps.event.trigger(gmarkers[" + parseInt(gmarkers.length - 1) + "],\"click\");'>" + "<strong>" + place.name + "</strong>"+ "<img class='location-icon' src='" + place.icon + "'>" + "<br></a><strong>" + "Average Rating: " + place.rating + "/5.0</strong>"  + "<br><hr>";
  document.getElementById('side_bar').innerHTML += side_bar_html;
  /*$(document).ready(function() {
  $('#side_bar').html(side_bar_html);
  });*/
}

function openInfoWindow(id) {
  return true;
}

//google.maps.event.addDomListener(window, 'load', initialize("Brooklyn, NY"));