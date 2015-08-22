var connectionApp = angular.module('connectionModule', []);

//http://stackoverflow.com/questions/15666048/service-vs-provider-vs-factory
//https://www.airpair.com/angularjs/posts/top-10-mistakes-angularjs-developers-make

/**
* ng-factory :: movieConfig
* This is the movieConfig (angular.factory) to have config data 
* (TODO put in config/provider)
*/
connectionApp.factory('movieConfig', [function(){
	var httpProt = window.location.protocol == 'https:' ? 'https' : 'http';
	return {
		 imgServer 		: httpProt+'://image.tmdb.org'
		,api_key		: '08b9b2257cdb93fc6a09e38654115b8b'
		,repeatCount	: 6
		,verysmall		: '/t/p/w45'
		,thumbnail		: '/t/p/w130'
		,backdrop		: '/t/p/w780'
	}
	//IMAGES:: $original = "images/themoviedb/p/original"; ($w45, $w92, $w130, $w154, $w185, $w780)
}]);

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