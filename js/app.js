//Initialize and set up the map
function initMap() {

	//Put the map on the screen
	var map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.7413549, lng: -73.99802439999996},
  	zoom: 13
	});

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

	var bounds = new google.maps.LatLngBounds();
	var infoWindow = new google.maps.InfoWindow();

	var tempMarkers = []; //the markers that will appear as result of a search
	var markers = []; //the fixed markers holding the attractions

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
			setInfowindowContent(this, infoWindow);
			});

		bounds.extend(marker.position);
	}

	map.fitBounds(bounds);

	function setInfowindowContent(marker, infoWindow) {

		//Wikipedia API
		var wikipediaUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + marker.title + "&format=json";

	  // One way of handling errors. Display a message if after 4 sec a response does not arrive
	  var wikiRequestTimeout = setTimeout(function() {
	      alert("Failed to get information.");
	  }, 4000);

	  $.ajax(wikipediaUrl, {dataType: "jsonp"})
	  	.done(function (data) { //A callback function that is run when the data is successfully returned

	    //Information returned('data') is an array
	    var articlesTitles = data[1];   //Titles for articles is the 1st element, which is also an array
	    var articlesLink = data[3];     //Links for articles is the 3rd element, which is also an array

	    //Format all the information to be displayed
	    var infowindowContent = '<h4>Interesting Info:</h4>';
	    for (var i = 0; i < articlesTitles.length; i++) {
	    	infowindowContent += ("<li><a href=" + articlesLink[i] + ">" + articlesTitles[i] + "</a></li>");
	    };

			clearTimeout(wikiRequestTimeout); // clear/delete/disable the function called by setTimeout.

			//Set the content of the info window and display it
			infoWindow.setContent(infowindowContent);
			infoWindow.open(map, marker);
	  });
	}

	//Get the first location in the drop-down menu
	var attraction = locations[ document.getElementById('attraction-menu').value ];
	var attractionLat = attraction.location.lat;
	var attractionLng = attraction.location.lng;
	var attractionBounds = new google.maps.LatLngBounds(
  	new google.maps.LatLng(attractionLat, attractionLng));

	//Create a search box and restrict the bounds of the search to the first location
	var input = document.getElementById('search-box');
	var searchBox = new google.maps.places.SearchBox(input, {bounds: attractionBounds});

	var searchResultsList = $('#display-search-results-list');//Where results are displayed
	var places = []; //Holds the places the user looked for

	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {

		searchResultsList.text('');//clear the search results list

		places = searchBox.getPlaces();

		if (places.length === 0) { alert("No results found. Try another search."); return; }

		//Let the user know the intent of the application is to look for general places
		//around main attractions, although it is allowed to look for specific places
		if (places.length === 1) { alert("Although you can look for specific places, the intent is to look for general places around the attractions.");}

		//Delete old markers to display the new ones
		tempMarkers.forEach(function(marker) {
			marker.setMap(null);
		});
		tempMarkers = [];

		var bounds = new google.maps.LatLngBounds();

		places.forEach(function(place) {

			//Create icons for each marker
			var icon = {
	      url: place.icon,
	      size: new google.maps.Size(50, 50),
	      origin: new google.maps.Point(0, 0),
	      anchor: new google.maps.Point(17, 34),
	      scaledSize: new google.maps.Size(25, 25)
	    };

	    //Create the markers
			var marker = new google.maps.Marker({
				map: map,
				title: place.name,
				position: place.geometry.location,
				icon: icon
			});

			tempMarkers.push(marker);

			if (place.geometry.viewport) {
	      // Only geocodes have viewport.
	      bounds.union(place.geometry.viewport);
	    } else {
	      bounds.extend(place.geometry.location);
	    }

	    searchResultsList.append('<li><strong>'+place.name+'</strong><span> - ' + place.formatted_address + '</span></li>');
		});

		map.fitBounds(bounds);
	});

	//Hold the value of the current attraction so we can deactivate
	//the bounce effect when another attraction is selected
	var tempValue = 0;

	//Focus on the attraction selected and restrict the search
	//for places to that attraction
	$('#attraction-menu').change(function() {

		markers[tempValue].setAnimation(null);//deactivate the previous maker's bounce effect

		attractionValue = document.getElementById('attraction-menu').value;
		attraction = locations[attractionValue];
		attractionLat = attraction.location.lat;
		attractionLng = attraction.location.lng;
		attractionBounds = new google.maps.LatLngBounds(
			  new google.maps.LatLng(attractionLat, attractionLng));

		map.setCenter(attraction.location);
		map.setZoom(15);

		tempValue = attractionValue; //update tempValue
		markers[tempValue].setAnimation(google.maps.Animation.BOUNCE);

		searchBox.setBounds(attractionBounds);
	});

	var viewModel = {
		menu: ko.observable(true), //menu is visible
		toggleMenu: function() {

			if (this.menu()) { this.menu(false); } //When clicked if is visible hide it
			else { this.menu(true); } //When clicked if it is not visible show it
		},
		filterValue: ko.observable(''), //Location user is looking for
		searchResults: ko.observable(), //Results from the filter to display
		searchedPlaces: function() {

			var stringResults = '';
			//Go through the locations showing them or hiding them
			for (var i = 0; i < locations.length; i++) {

				var locationName = locations[i].title.toLowerCase();

				if( locationName.search(this.filterValue()) === -1 ){//Hide locations
					markers[i].setMap(null);
				}
				else { //Show locations and get their names
					markers[i].setMap(map);
					stringResults+=('<li><strong>'+locations[i].title+'</strong><li>');
				}
			}
			this.searchResults(stringResults);//Display results
		}
	};

	ko.applyBindings(viewModel);
}