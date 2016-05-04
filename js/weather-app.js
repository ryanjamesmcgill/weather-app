$(document).ready(function(){
	updateWeather();
	setupTempButton();
	$("#fakeWeather").on("click", fakeWeather);
});

var fakeWeather = function(condition){
	weatherApp = {
		temp_f: "0",
		temp_c: "0",
		icon : condition,
		summary: "You have changed the weather and will now be known as the weather (wo)man.",
		location: "Area-51",
		state: ""
	};
	updateDom();
};

var icon_map = {
	"clear-day": "wi wi-forecast-io-clear-day",
	"clear-night":"wi wi-forecast-io-clear-night",
	"rain":"wi wi-forecast-io-rain",
	"snow":"wi wi-forecast-io-snow",
	"sleet":"wi wi-forecast-io-sleet",
	"wind": "wi wi-forecast-io-wind",
	"fog": "wi wi-forecast-io-fog",
	"cloudy": "wi wi-forecast-io-cloudy",
	"partly-cloudy-day": "wi wi-forecast-io-partly-cloudy-day", 
	"partly-cloudy-night": "wi wi-forecast-io-partly-cloudy-night",
	"hail": "wi wi-forecast-io-hail",
	"thunderstorm": "wi wi-forecast-io-thunderstorm",
	"tornado": "wi wi-forecast-io-tornado"
};

var weatherApp = {
	temp_f: "10",
	temp_c: "5",
	icon: "",
	summary: "",
	location: "",
	state: ""
}

var updateWeather = function(){
	startLoading();
	getCoords();
};

var getCoords = function(){
	var options = {
		enableHighAccuracy: false,
		timeout: 10000,
		maximumAge: 0
	};
	function success(p){
		console.log("got location data", p);
  		/*call weather api*/
  		getWeather(p.coords.latitude, p.coords.longitude);

    };
	function error(err) {
	  console.warn('ERROR from navigator.geolocation(' + err.code + '): ' + err.message);
	  	weatherApp = {
		temp_f: "0",
		temp_c: "0",
		icon : "",
		summary: "Uh-oh we could not get your location, please allow this site to get your location from you browser.",
		location: "????",
		state: ""
		};
		updateDom()
	};

	if (navigator.geolocation){
    	navigator.geolocation.getCurrentPosition(success, error, options);
  	}
};

var getWeather = function(x,y){
	console.log("coords:",x,y);
	var coords = x + ',' + y;
	$.ajax({
        url: 'https://api.forecast.io/forecast/2204c3fc1dc66e870e95fdfae016676a/'+coords,
        dataType: 'jsonp',
        success: function(d){
        	console.log('success from forcast.io',d);
        	weatherApp.temp_f = Math.round(d.currently.apparentTemperature);
        	weatherApp.temp_c = Math.round((weatherApp.temp_f - 32) * (5/9));
        	weatherApp.icon = d.currently.icon;
        	weatherApp.summary = d.hourly.summary;
        	getCity(x,y);
        },
        error: function(err){
        	console.warn('ERROR from forcast.io(' + err.code + '): ' + err.message);
        	weatherApp = {
			temp_f: "0",
			temp_c: "0",
			icon : "",
			summary: "Uh-oh we could not get the current weather information from foracast.io, please check your internet connection and try again later.",
			location: "????",
			state: ""
			};
			updateDom();
		}
    });
};

var getCity = function(x, y){
	var coords = x + ',' + y;
	$.ajax({
        url: 'http://maps.googleapis.com/maps/api/geocode/json?latlng='+coords,
        dataType: 'json',
        success: function(d){
        	console.log('success from googleapis',d);
        	weatherApp.location = d.results[3].formatted_address;
        	updateDom();
        },
        error: function(err){
        	console.warn('ERROR from googleapis(' + err.code + '): ' + err.message);
        	weatherApp = {
			temp_f: "0",
			temp_c: "0",
			icon : "wi wi-na",
			summary: "Uh-oh we could not get geo data from google, please check your internet connection and try again later.",
			location: "????",
			state: ""
			};
			updateDom();
        }
    });
};

var updateDom = function(){
	$(".weatherbox").css("transition","opacity 2.0s ease");
	$(".weatherbox").css("opacity","0.0");
	setTimeout(continueDomUpdate, 2000);
}

var continueDomUpdate = function(){
	//update #icon, replace class with wi wi-forcast.io...
	var icon_class;
	if(icon_map.hasOwnProperty(weatherApp.icon)){
		icon_class = icon_map[weatherApp.icon];
	} else {
		icon_class = "wi wi-na";
	}
	$("#icon").removeClass().addClass(icon_class);

	//update #summary
	$("#summary").html(weatherApp.summary);

	//update #temp-val
	var temp = Math.round(weatherApp.temp_f);
	$("#temp-val").html(temp);

	//update #location
	$("#location").html(weatherApp.location);
	

	//update colors
	updateColors();

	//stop loading and change opacities
	stopLoading();
}

var updateColors =  function(){
	var color = "#8A8A8A";
	switch(weatherApp.icon){
		case "clear-day":
			color = "#fff86f";
			break
		case "clear-night":
			color = "#906090";
			break;
		case "rain":
			color = "#b3cde0";
			break;
		case "snow":
			color = "#efeff2";
			break;
		case "sleet":
			color = "#dadae3";
			break;
		case "wind":
			color = "#c0c5ce";
			break;
		case "fog":
			color = "#c0c5ce";
			break;
		case "cloudy":
			color = "#A3AABA";
			break;
		case "partly-cloudy-day":
			color = "#fffcd3";
			break;
		case "partly-cloudy-night":
			color = "#436464";
			break;
		case "hail":
			color = "#bfbfc1";
			break;
		case "thunderstorm":
			color = "#8f8f91";
			break;
		case "tornado":
			color = "#777779";
			break;
		default:
	}
	var style = {"color":color,
				"background-color":color};
	$("body").css(style);
}

var setupTempButton = function(){
	$("#temp-btn").on("click", function(){
		if($(".wi.active").hasClass("wi-fahrenheit")){
			var temp = weatherApp.temp_c;
			$("#temp-val").text(temp);
			$(".wi.active").removeClass("wi-fahrenheit").addClass("wi-celsius");
			$(".wi.inactive").removeClass("wi-celsius").addClass("wi-fahrenheit");
		} else {
			var temp = weatherApp.temp_f;
			$("#temp-val").html(temp);
			$(".wi.active").removeClass("wi-celsius").addClass("wi-fahrenheit");
			$(".wi.inactive").removeClass("wi-fahrenheit").addClass("wi-celsius");

		}
	});
};

var startLoading = function(){
	weatherApp.state = "loading";
	animateIcon();
}

var stopLoading = function(){
	weatherApp.state = "done";
	$(".weatherbox").css("transition","opacity 5.0s ease");
	$(".weatherbox").css("opacity","1.0");
	$("#temp").css("opacity","1.0");
	$("#summary").css("opacity","1.0");
	$("#location").css("opacity","1.0");
}

var animateIcon = function(){
	$("#icon-container").toggleClass("animate");
	setTimeout(function(){
		if(weatherApp.state === "loading"){
			animateIcon();
		}
	}, 2500);
}






