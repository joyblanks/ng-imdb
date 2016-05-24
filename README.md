# TMDB
A movie search Engine using apiary.io REST API to get data using Angular js and Bootstrap


## ng-imdb
####by Joy Biswas @ joy.blanks@hotmail.com

<img src="https://assets.tmdb.org/images/logos/var_8_0_tmdb-logo-2_Bree.svg" />
## The Movie Database API  

#### INTRODUCTION

The Movie Database (TMDb) was started as a side project in 2008 to help the media center community serve high resolution posters and fan art. What started as a simple image sharing community has [turned into](https://www.themoviedb.org/leaderboard) one of the most actively user edited movie database on the Internet.

With an initital data contribution from a project called [omdb](http://www.omdb.org/) (thank you!), the goal was to create our own product and service. We launched the first version of the database in early 2009. Along with the website we also launched one of first and only free movie data API's.

Today, our service is used by tens of millions of people every week and is often regarded as the single best place to get movie data and images. Whether you're interested in personal movie and TV recommendations, what movies have [won the Oscar for best picture](https://www.themoviedb.org/list/509ec17b19c2950a0600050d), maintaining a personal watchlist, or like to develop applications of your own, we hope you'll love everything our service has to offer.

So explore a little. Search for your favorite movie. Build a list of movies you want to watch. We're really proud of the service we've built and hope you find it as useful as we do.

#### Useful Links

- [API Support](https://www.themoviedb.org/talk/category/5047958519c29526b50017d6)
- [Google+ Developer Group](http://j.mp/TMDbDevelopers)
- [Pingdom](http://stats.pingdom.com/jatptlnse0fd/520297)

To be notified about our service status and deprecation notices, please join our Google+ community.

#####Variables / Setup / API Key
Use a factory to setup variables/dependencies for the API. Get API Key from The Movie Database API
```
connectionApp.factory('movieConfig', [function(){
	var httpProt = window.location.protocol == 'https:' ? 'https' : 'http';
	return {
		 imgServer 		: httpProt+'://image.tmdb.org'
		,api_key		: 'XXXXXXX*************XXXXXXX'
		,repeatCount	: 6
		,verysmall		: '/t/p/w45'
		,thumbnail		: '/t/p/w130'
		,backdrop		: '/t/p/w780'
	}
	//IMAGES:: $original = "images/themoviedb/p/original"; ($w45, $w92, $w130, $w154, $w185, $w780)
}]);
```
##### $http Call
Connecting via REST to the API
```
/**
* ng-service :: movieService 
* This is the movieService (angular.service) to make ajax promises and return to caller
*/
connectionApp.service('movieService', ['$http', '$q', 'movieConfig', function($http, $q, movieConfig) {
	var httpProt = 'https';//window.location.protocol == 'https:' ? 'https' : 'http';
	var myKey = 'api_key='+movieConfig.api_key+'&randm='+Math.random();
	//var viaCORS = true;//else will proxy server (implementation in getStuff.php on PHP server code attached)
	
	//class type vars
	var movies = {};
	var paginator = {page:0,pages:0};
	var lastQuery = '';
	var movieDetail = 0;

	function promiseMe(url){
		var deferred = $q.defer();
		//url = viaCORS ? url : 'http://joykalocal/ng-imdb/getStuff.php?url='+encodeURIComponent(url);
		$http.get(url)
			.success(function(data) { 
				deferred.resolve(data); 
			})
 			.error(function(msg, code) {
				deferred.reject(msg);
			});
		return deferred.promise;
	};
	
	this.moviesfn = function(_json,append){
		if(_json===undefined)
			return movies;
		if(append){
			$.each(_json.results,function(k,v){ movies.results.push(v); });
			movies.page = _json.page;
		}else movies=_json;
	};
	this.getLastQuery = function(){return lastQuery};
	this.clearLastQuery = function(){lastQuery=''};
	this.pagination = function(wht){
		if(wht===undefined)
			return paginator;
		else paginator = {page:wht.page,pages:wht.pages};
	};

	this.movieDetails = function(wht){
		if(wht===undefined){
			return movieDetail;
		}else movieDetail = wht;
	};
	
	this.searchMovie= function(query,page) {
		lastQuery = query;
		return promiseMe(httpProt+'://api.themoviedb.org/3/search/movie?'+myKey+'&query='+query+'&page='+(page?page:1));
	};
	this.typeMovie= function(mode,page) {
		lastQuery = mode;
		return promiseMe(httpProt+'://api.themoviedb.org/3/movie/'+mode+'?'+myKey+'&page='+(page?page:1));
 	};
 	this.getMovie = function(key){
 		return promiseMe(httpProt+'://api.themoviedb.org/3/movie/'+key+'?'+myKey+'&append_to_response=releases,trailers');
 	};
	this.getMovieCredits = function(key){
 		return promiseMe(httpProt+'://api.themoviedb.org/3/movie/'+key+'/credits?'+myKey);
 	};
}]);
```

####Directives
-Cast & Crew
```
app.directive('credit', [function(){
	return {
		scope: {
			credit:'@', movie:'&'
		}
		,restrict: 'A'
		,templateUrl: './resources/templates/credit.html'
		,replace: true
		,transclude: true
		,link: function(scope, element, attributes){
			scope.movie = scope.movie();
		}
	};
}]);
```
-Navigation 


(Controller `app.controller('NavigationController', ['$scope', '$location', 'movieService', function($scope, $location, movieService) { *** });`)
```
app.directive('navigation', [function(){
	return {
		restrict: 'E'
		,templateUrl: './resources/templates/navigation.html'
		,replace: true
		,transclude: true
	};
}]);
```
-Movie List
```
app.directive('movieItems', [function(){
	// Runs during compile
	return {
		// name: '',
		// priority: 1,
		// terminal: true,
		scope: {}, // {} = isolate, true = child, false/undefined = no change
		controller: function($scope, $element, $attrs, $transclude) {
		},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		templateUrl: './resources/templates/movieItems.html',
		// replace: true,
		// transclude: true,
		// compile: function(tElement, tAttrs, function transclude(function(scope, cloneLinkingFn){ return function linking(scope, elm, attrs){}})),
		link: function($scope, iElm, iAttrs, controller) {
		}
	};
}]);
```



#### Third Party Libraries

There are a number of community contributed libraries. You can check them out [here](https://www.themoviedb.org/documentation/api/wrappers-libraries).

#### JSON & JSONP Response Format

Unlike previous versions of the API, v3 only supports a single format, JSON. XML and YAML support are being officially dropped. JSONP is also officially supported, just add a 

callback parameter to your request and the response will be encapsulated in the value you specified.

#### Request Rate Limiting

We do enforce a small amount of rate limiting. Our current limits are 40 requests every 10 seconds and are limited by IP address, not API key. You can use the 'X-RateLimit' headers that get returned with every request to keep track of your current limits. If you exceed the limit, you will receive a 429 HTTP status with a 'Retry-After' header. As soon your cool down period expires, you are free to continue making requests.

#### Status Codes

At different times while using our API you might come across an error and/or status code. For a detailed look at what these codes mean, [check out the list](https://www.themoviedb.org/documentation/api/status-codes) on our website.

#### HTTPS / SSL

v3 now supports SSL. Just make an https:// call instead of http:// and you're all set.

#### Required Parameters

Every request needs a valid API key and you can set this value as an HTTP parameter. A full request example looks like so:

https://api.themoviedb.org/3/movie/550?api_key=###

#### Languages

Our API supports translations just be aware that we no longer fall back to English in the event that a field hasn't been translated. If you make a request for the German translation and the overview hasn’t been translated, the field will be empty. There’s a few reasons for this but the main one is that in an effort to encourage users to add data to TMDb, it’s important for them to see when the data is missing.

If you want to fall back to English, you can make the separate call yourself and fill in missing data.

#### Image Languages

- poster_path: The poster_path will query the language you specify first and default back to 'en' if one is not found. In the event that an 'en' poster isn't present, we will simply try to grab the highest rated.
- backdrop_path: Since 99% of backdrops don't contain a language so to speak, we simply query for the highest rated backdrop that belongs to the given entry.
- still_path: Like backdrops, TV episode images don't inherently have languages so to speak. We query for the highest rated. 

In the event you query one of the distinct /image methods, there is a new way you can query additional languages for images. Think of this as kind of like a fallback. This is especially useful to grab 2 things. First, finding the backdrops and posters in a users specified language but also to grab all of the images that _haven't_ been tagged yet. Here's an example:

https://api.themoviedb.org/3/movie/550/images?api_key=###&language=en&include_image_language=en,null

Notice the include_image_language parameter. We're looking for all images that match English and those that haven't been set (null).

#### Appending Responses

The [movie](http://docs.themoviedb.apiary.io/#movies), [tv](http://docs.themoviedb.apiary.io/#tv) and [person](http://docs.themoviedb.apiary.io/#person) methods support a new parameter called 

append_to_response. When this parameter is present, the API will make an additional request behind the scenes to fetch the data you're asking for. A simple example would be if you wanted the default movie, release and trailer data. Until now, you would have to issue three separate requests. Now, you can issue one. Here's what that request looks like:

https://api.themoviedb.org/3/movie/550?api_key=###&append_to_response=releases,trailers

This request is the same as making these 3 separate requests, all we're doing is combining the responses into a single response for you. With this in mind, remember all parameters and responses will be the same as documented. Each appended request will map to an object in the JSON response with the same name.

You can of course pass the new 

include_image_language param to the images too!

https://api.themoviedb.org/3/movie/550?api_key=###&append_to_response=images&include_image_language=en,null

#### Configuration

In an effort to lower our response sizes and add simplicity to the actual API methods, we are now using a central [configuration](http://docs.themoviedb.apiary.io/#configuration). The data provided with this method is required for building full image URLs, or getting a list of available image sizes.

#### Apiary Transparent Proxy

This is an optional service you can use to help troubleshoot requests. You are not required to use it in any capacity. In real world use, we expect you to use our production end point.


##Snapshots
<img src="snp1.png" />
<img src="snp2.png" />