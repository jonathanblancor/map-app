var infowindowContent = [{content: ''},{content: ''},{content: ''},{content: ''},{content: ''},{content: ''},{content: ''},{content: ''},{content: ''},{content: ''}];

(function () {

	var locations = [
		{title: "Statue of Liberty", location: {lat: 40.689249, lng: -74.044500}, content: '0'},
		{title: "Madame Tussauds", location: {lat: 40.712784, lng: -74.005941}, content: '1'},
		{title: "Empire State Building", location: {lat: 40.748441, lng: -73.985664}, content: '2'},
		{title: "Madison Square Garden", location: {lat: 40.750704, lng: -73.993752}, content: '3'},
		{title: "National September 11 Memorial & Museum", location: {lat: 40.710580, lng: -74.015583}, content: '4'},
		{title: "American Museum of Natural History", location: {lat: 40.781324, lng: -73.973988}, content: '5'},
		{title: "Times Square", location: {lat: 40.759011, lng: -73.984472}, content: '6'},
		{title: "Metropolitan Museum of Art", location: {lat: 40.779165, lng: -73.962928}, content: '7'},
		{title: "Radio City Music Hall", location: {lat: 40.759977, lng: -73.979975}, content: '8'},
		{title: "St. Patrick's Cathedral", location: {lat: 40.7585, lng: -73.9760}, content: '9'}
		];

		for (var i = 0; i < locations.length; i++) {
		// load Wikipedia API
	  var wikipediaUrl = "https://en.wikipedia.org/w/api.php?action=opensearch&search=" + locations[i].title + "&format=json";

	  //One way of handling errors. Display a message if after 8 sec a response does not arrive
	  // var wikiRequestTimeout = setTimeout(function() {
	  //     $wikiElem.text("Failed to get Wikipedia resources.");
	  // }, 8000);

	  $.ajax(wikipediaUrl, {
	      dataType: "jsonp"
	  }).done(function (data) { //A callback function that is run when the data is successfully returned

	    //Information returned('data') is an array
	    var articlesTitles = data[1];   //Titles for articles is the 1st element, which is also an array
	    var articlesLink = data[3];     //Links for articles is the 3rd element, which is also an array


	    for (var i = 0; i < articlesTitles.length; i++) {
	    	infowindowContent[i].content += ("<span>" + articlesTitles[i] + "</span>");
	        // $wikiElem.append("<li><a href=" + articlesLink[i] + ">" + articlesTitles[i] + "</a></li>");
	    };
// console.log(locations[i].content);
	    // clearTimeout(wikiRequestTimeout); // clear/delete/disable the function called by setTimeout.
	    // console.log(data);
	    // infowindowContent = '';
	  });
	  // console.log(infowindowContent);
	  // locations[i].content = infowindowContent;

	  // console.log(locations[i].content);

	}
})();