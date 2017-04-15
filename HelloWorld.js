 // Initialize Firebase
 var config = {
     apiKey: "AIzaSyCJ66JNGQPWk_Z0WIgCHKvzhVZqVZxeSq8",
     authDomain: "hello-world-project-9ce65.firebaseapp.com",
     databaseURL: "https://hello-world-project-9ce65.firebaseio.com",
     projectId: "hello-world-project-9ce65",
     storageBucket: "hello-world-project-9ce65.appspot.com",
     messagingSenderId: "239311322079"
 };

 firebase.initializeApp(config);

 var database = firebase.database();
 var allData = [];

 $(document).ready(function() {
     // MainPage Create Entry Button Function
     $("#mainCreateButton").click(function() {
         $("#search").hide(1000);
         $("#mainSearchButton").hide();
         $("#mainCreateButton").hide();
         $("#mapContainer").switchClass("col-md-6", "col-md-8", 1000, "easeOutQuad");
         $("#create").switchClass("col-md-3", "col-md-4", 1000, "easeOutQuad");
         $("#diaryInput").show(1000);
         $("#paper").show(1500);
     });

     // Secondary Create Entry Button Function: This is the create entry button option if create entry was pressed first
     $("#createButton").click(function() {
         $("#search").hide(1500);
         $("#mapContainer").switchClass("col-md-6", "col-md-8", 1000, "easeOutQuad");
         $("#create").show(1000).switchClass("col-md-3", "col-md-4", 1000, "easeOutQuad");;
         $("#diaryInput").show(1000);
         $("#paper").show(1500);
         $("#criteria").hide();
     });


     // Submit Create Entry Input Button Function
     $("#submitJournalEntry").click(function() {
         // Setting values to the initial values
         var name = $("#name").val();
         var entryPlace = $("#entryPlace").val();
         var reasonTravel = $("#reasonTravel").val();
         var overview = $("#overview").val();

         var journalEntry = {
             name: name,
             entryPlace: entryPlace,
             reasonTravel: reasonTravel,
             overview: overview
         }

         // Pushing information from the CreateEntry input page to the database as an object
         database.ref().push(journalEntry);

         // Emptying the input page
         $("#name").val("");
         $("#entryPlace").val("");
         $("#reasonTravel").val("");
         $("#overview").val("");
     });

     // MainPage Search Choice Button Function
     $("#mainSearchButton").click(function() {
         $("#create").hide(1000);
         $("#mainCreateButton").hide();
         $("#mainSearchButton").hide();
         $("#mapContainer").switchClass("col-md-6", "col-md-8", 1000, "easeOutQuad");
         $("#search").switchClass("col-md-3", "col-md-4", 600, "easeOutQuad");
         $("#criteria").show(1000);
     });

     // Secondary Search Choice Button Function: This is the search place button option if create entry was pressed first
     $("#searchButton").click(function() {
         $("#create").hide(1000);
         $("#mapContainer").switchClass("col-md-6", "col-md-8", 1000, "easeOutQuad");
         $("#diaryInput").hide();
         $("#search").show(500);
         $("#criteria").show(1000);
     });
     // creating variables for the filtering function    
     var childData;
     var filter = [];

     database.ref().on("child_added", function(snapshot) {
         childData = snapshot.val();
         allData.push(childData);
         //  console.log(JSON.stringify(allData));
     });

     // This function is taking the search input results and compareing them to the city, state attribute within the diary objects and creating results tabs out of the selected diary entries
     function searchInputPull() {
         // makes search input div visible
         var place = $("#place").val();
         var Lplace;
         var Litem;

         function filterFunction(item) {
             Lplace = place.toLowerCase();
             Litem = item.entryPlace.toLowerCase();

             if (Litem === Lplace) return true

         };
         var filteredArray = allData.filter(filterFunction);

         for (var i = 0; i < filteredArray.length; i++) {
             var Tabs = $("<div>");
             Tabs.addClass("condensedInfo");
             Tabs.attr("data-entry", filteredArray[i]);
             Tabs.append("<div class='tabPlace'><center><p class='tabLine'>" + "Name: " + filteredArray[i].name + "</p><p class='tabLine'>" + "Location: " + filteredArray[i].entryPlace + "</p><p class='tabLine'>" + "Reason: " + filteredArray[i].reasonTravel + "</p><p class='tabLine'>" + "Overview: " + filteredArray[i].overview + "</p></center></div>");
             $("#resultsTabContainer").append(Tabs);
         };

     };

     // Search Results Submit Button Function
     $("#resultSubmitButton").click(function() {
         $("#resultsTabContainer").empty();
         // // Generating the Results Tabs
         searchInputPull();
         // the results tab section appears within the search section
         $("#resultsTabContainer").show(500);
     });

     /* This Autocompletes an input field with a city name using the jQuery UI library and geonames.org library  */
     $(function() {
         function log(message) {
             $("<div id='#cityauto'>").text(message).prependTo("#log");
             $("#log").scrollTop(0);
         }

         $("#place").autocomplete({
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
                                 } else { // for cities outside the U.S
                                     var arr = v.split(',');
                                     var first = arr.slice(0, -2); // City
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

     $(function() {
         function log(message) {
             $("<div id='#cityauto'>").text(message).prependTo("#log");
             $("#log").scrollTop(0);
         }

         $("#entryPlace").autocomplete({
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
                                 } else { // for cities outside the U.S
                                     var arr = v.split(',');
                                     var first = arr.slice(0, -2); // City
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
 });

 //Added Google Map Code
 var cityInput;
 var map;
 var placeInput;

 function initMap() {
     map = new google.maps.Map(document.getElementById('map'), {
         zoom: 4,
         center: {
             lat: 38.850033,
             lng: -97.6500523
         }
     });
     var geocoder = new google.maps.Geocoder();
     document.getElementById('resultSubmitButton').addEventListener('click', function() {
         event.preventDefault();
         cityInput = $("#place").val();


         geocodeAddress(geocoder, map);
         google.maps.event.trigger(map, "resize");

     });
 };

 function geocodeAddress(geocoder, resultsMap) {

     var address = cityInput;

     geocoder.geocode({
         'address': address
     }, function(results, status) {
         if (status === google.maps.GeocoderStatus.OK) {

             resultsMap.setCenter(results[0].geometry.location);
             resultsMap.setZoom(11);

         } else {
             alert('Cannot add for the following reason: ' + status);
         };
     });


 };

 function addExistingPins(geocoder, resultsMap) {

     var address = placeInput;

     geocoder.geocode({
         'address': address
     }, function(results, status) {
         if (status === google.maps.GeocoderStatus.OK) {

             var marker = new google.maps.Marker({
                 map: resultsMap,
                 animation: google.maps.Animation.DROP,
                 position: results[0].geometry.location
             });


             marker.addListener('click', function() {
                 // map.setZoom(8);
                 // map.setCenter(marker.getPosition());

                 $("#resultsTabContainer").empty();

                 $("#create").hide(1000);
                 $("#mainCreateButton").hide();
                 $("#mainSearchButton").hide();
                 $("#map").switchClass("col-md-6", "col-md-8", 1000, "easeOutQuad");
                 $("#search").switchClass("col-md-3", "col-md-4", 600, "easeOutQuad");
                 $("#criteria").show(1000);

                 console.log(JSON.stringify(marker.getPosition()));
                 var stringified = JSON.stringify(marker.getPosition());
                 var latlon = (JSON.parse(stringified));
                 var lat = latlon.lat;
                 var lng = latlon.lng;
                 var queryURL = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&results_type=locality&key=AIzaSyDdQzv3bDjvy7wRLe0dF8pBB1n_4bix_Bs";
                 var cityState;
                 var city;
                 var state;
                 $.ajax({
                     url: queryURL,
                     method: "GET"
                 }).done(function(response) {
                     console.log(JSON.parse(JSON.stringify(response)));
                     var ind = 0;
                     for (var j = 0; j < results.length; j++) {
                         if (results[j].types[0] == "locality") {
                             ind = j;
                             break;
                         };
                     };
                     for (var i = 0; i < results[j].address_components.length; i++) {
                         if (results[j].address_components[i].types[0] == "locality") {
                             city = results[j].address_components[i].long_name;
                         };
                         if (results[j].address_components[i].types[0] == "administrative_area_level_1") {
                             state = results[j].address_components[i].short_name;
                         };
                     };
                     cityState = city + ", " + state;


                     function searchInputPull() {
                         // makes search input div visible
                         console.log(cityState);
                         var place = cityState;
                         var Lplace;
                         var Litem;

                         function filterFunction(item) {
                             Lplace = place.toLowerCase();
                             Litem = item.entryPlace.toLowerCase();

                             if (Litem === Lplace) return true

                         };
                         var filteredArray = allData.filter(filterFunction);

                         var filteredArray = allData.filter(filterFunction);

                         for (var i = 0; i < filteredArray.length; i++) {
                             var Tabs = $("<div>");
                             Tabs.addClass("condensedInfo");
                             Tabs.attr("data-entry", filteredArray[i]);
                             Tabs.append("<div class='tabPlace'><center><p class='tabLine'>" + "Name: " + filteredArray[i].name + "</p><p class='tabLine'>" + "Location: " + filteredArray[i].entryPlace + "</p><p class='tabLine'>" + "Reason: " + filteredArray[i].reasonTravel + "</p><p class='tabLine'>" + "Overview: " + filteredArray[i].overview + "</p></center></div>");
                             $("#resultsTabContainer").append(Tabs);
                         };
                     };


                     // // Generating the Results Tabs
                     searchInputPull();
                     // make the random information about the place you've looked up pop up
                     // the results tab section appears within the search section
                     $("#resultsTabContainer").show(500);



                 });

             });

         } else {
             alert('Cannot add for the following reason: ' + status);
         };
     });

 };

 //Add places from existing entries in Firebase
 database.ref().on("child_added", function(snapshot) {
     placeInput = snapshot.val().entryPlace;
     var geocoder = new google.maps.Geocoder();
     addExistingPins(geocoder, map);
 });
 //Google Maps ends here
