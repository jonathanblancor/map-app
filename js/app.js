//Fixed locations added to the map
var locations = [
	{title: "Statue of Liberty", location: {lat: 40.689249, lng: -74.044500}},
	{title: "Madame Tussauds", location: {lat: 40.712784, lng: -74.005941}},
	{title: "Empire State Building", location: {lat: 40.748441, lng: -73.985664}},
	{title: "Madison Square Garden", location: {lat: 40.750704, lng: -73.993752}},
	{title: "National September 11 Memorial & Museum", location: {lat: 40.710580, lng: -74.015583}},
	{title: "American Museum of Natural History", location: {lat: 40.781324, lng: -73.973988}},
	{title: "Times Square", location: {lat: 40.759011, lng: -73.984472}},
	{title: "Metropolitan Museum of Art", location: {lat: 40.779165, lng: -73.962928}},
	{title: "Radio City Music Hall", location: {lat: 40.759977, lng: -73.979975}},
	{title: "St. Patrick's Cathedral", location: {lat: 40.7585, lng: -73.9760}}
	];

//The fixed markers holding the attractions
var markers = []; //this array runs in parallel with the locations array
var map, bounds, infoWindow;

//Initialize and set up the map
function initMap() {

	//Put the map on the screen
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7413549, lng: -73.99802439999996},
  	zoom: 13
	});

	bounds = new google.maps.LatLngBounds();
	infoWindow = new google.maps.InfoWindow();

	//Create the markers
	for (var i = 0; i < locations.length; i++) {

		var marker = new google.maps.Marker({
			position: locations[i].location,
			map: map,
			title: locations[i].title,
			animation: google.maps.Animation.DROP,
			icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
		});

		markers.push(marker);
		marker.addListener('click',  function() {
			bounce(this);
			setInfowindowContent(this, infoWindow);
		});

		bounds.extend(marker.position);
	}

	map.fitBounds(bounds);

	ko.applyBindings(viewModel);
}

//Set and open the marker's infowindow
function setInfowindowContent(marker, infoWindow) {

	//Wikipedia API
	var wikipediaUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + marker.title + "&format=json";

  // One way of handling errors. Display a message if after 4 sec a response does not arrive
  var wikiRequestTimeout = setTimeout(function() {
      alert("Failed to get information.");
  }, 6000);

  $.ajax(wikipediaUrl, {dataType: "jsonp"})
  	.done(function (data) { //A callback function that is run when the data is successfully returned

    //Information returned('data') is an array
    var articlesTitles = data[1];   //Titles for articles is the 1st element, which is also an array
    var articlesLink = data[3];     //Links for articles is the 3rd element, which is also an array

    //Format all the information to be displayed
    var infowindowContent = '<h4>Interesting Info:</h4>';
    for (var i = 0; i < articlesTitles.length; i++) {
    	infowindowContent += ("<li><a href=" + articlesLink[i] + ">" + articlesTitles[i] + "</a></li>");
    }

		clearTimeout(wikiRequestTimeout); // clear/delete/disable the function called by setTimeout.

		//Set the content of the info window and display it
		infoWindow.setContent(infowindowContent);
		infoWindow.open(map, marker);
  });
}


//Make the marker bounce
function bounce (marker) {
	if (marker.getAnimation() !== null) { marker.setAnimation(null); }
	else { marker.setAnimation(google.maps.Animation.BOUNCE);	}
}

function viewModel() {
	var self = this;

	self.menu = ko.observable(true); //menu is visible
	self.toggleMenu = function() {

		if (this.menu()) { this.menu(false); } //When clicked if is visible hide it
		else { this.menu(true); } //When clicked if it is not visible show it
	};
	self.filterValue = ko.observable(''); //Location user is looking for
	self.searchResults = ko.observable(); //Results from the filter to display

	//Display locations matching a searching criteria and hide those that don't
	self.searchedPlaces = ko.computed( function() {

		if(self.filterValue() === ''){ //Show all locations when filter box is empty
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(map);
			}
			map.fitBounds(bounds);
			return locations;
		}
		else { //Look for locations matching the searched string
			var foundLocations = []; //Hold the matching locations

			//Go through the locations showing them or hiding them
			for (var i = 0; i < locations.length; i++) {

				var locationName = locations[i].title.toLowerCase();

				//If searching criteria does not match the location name, hide location
				if(locationName.search( self.filterValue() ) === -1){
					markers[i].setMap(null);
				}
				else { //If a match was found show locations and get their names
					markers[i].setMap(map);
					foundLocations.push(locations[i]);
				}
			}
			return foundLocations;
		}
	});

	//Show the info window and bounce effect when a list item is clicked
	self.showInfoWindow = function (location) {
		for (var i = 0; i < markers.length; i++) {
			//If the list item & marker match, based on names.
			if (markers[i].title === location.title) {
				setInfowindowContent(markers[i], infoWindow);
				bounce(markers[i]);
				return;	//Avoid going through the rest of the array
			}
		}
	};
}

function googleError() {
	alert("Map could not be loaded.");
}