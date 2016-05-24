(function(){
	'use strict';
	var app = angular.module('imdbModule', ['connectionModule', 'ngRoute']);
	
	app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider){
		var homeTemplate = '<div ng-if="!moviesCtrl.myMovieObj.results" class="jumbotron" id="backBone"></div>';
		//routing config
		$routeProvider
			.when('/movieDetails'	,{ controller	: 'MovieDetailController'	,templateUrl	: './resources/templates/movieDetails.html'})
			.when('/movies'			,{ controller	: 'MoviesController'		,templateUrl	: './resources/templates/movieItems.html'})
			.when('/'				,{ controller	: 'MovieDetailController'	,template		: homeTemplate})
			.otherwise({redirectTo:'/'});
		//$locationProvider.html5Mode({enabled:true}); TODO root | base tag | server usage history API (check ui.router)
	}]).run([function(){

	}]);
	/**
	* ng-controller :: NavigationController
	* --where all navigation from Header is controlled
	*/
	app.controller('NavigationController', ['$scope', '$location', 'movieService', function($scope, $location, movieService) {
		var myScope = this;
		myScope.navObj = {};
		myScope.navObj.loadType = 'L';
		myScope.navObj.isSearchOn = false;
		myScope.navObj.navMenu = [
			 {topic: 'upcoming'		,icon: 'calendar'	,display: 'Upcoming'}
			,{topic: 'now_playing'	,icon: 'log-in' 	,display: 'Now Playing'}
			,{topic: 'popular' 		,icon: 'heart' 		,display: 'Popular'}
			,{topic: 'top_rated'	,icon: 'star' 		,display: 'Top Rated'}
		];
		//myScope.basePath = basePath;
		var myFavorites = [myScope.navObj.navMenu[0].topic,myScope.navObj.navMenu[1].topic,myScope.navObj.navMenu[2].topic,myScope.navObj.navMenu[3].topic];

		myScope.navObj.searchMovies = function(query,page){
			$location.url('movies');
			if(!query){
				movieService.moviesfn({});
				movieService.clearLastQuery();
				movieService.pagination({page:0, pages:0});
				myScope.navObj.isSearchOn = false;
				$location.url('');
				return false;
			}
			
			var favPressed = myFavorites.indexOf(query)>-1 ;
			myScope.navObj.isSearchOn = !favPressed;
			myScope.navObj.searchStr = !favPressed ? myScope.navObj.searchStr  : ''; //??

			var promise = !favPressed ? movieService.searchMovie(query,page) : movieService.typeMovie(query,page);
			promise.then(
				function(resJson) {
					movieService.moviesfn(resJson);
					movieService.pagination({page:resJson.page, pages:resJson.total_pages});
					myScope.navObj.isSearchOn = false;
					$(window).on('scroll', lazyLoaderFn);
				},
				function(errorPayload) {
					//$log.error('failure loading movie', errorPayload);
				}
			);
		}
		myScope.navObj.setLoadType = function(what){
			myScope.navObj.loadType = what;
			var query = movieService.getLastQuery();
			if(query){
				if(myScope.navObj.isLoadType('P')){
					var page = movieService.pagination();
					myScope.navObj.searchMovies(query,page.page);
				}else if(myScope.navObj.isLoadType('L')){
					var favPressed = myFavorites.indexOf(query)>-1, page = movieService.pagination(), promise, results = [];
					var lastSuccessFn = function(resJson) {
						$.each(resJson.results,function(k,v){results.push(v);});
						resJson.results = results;
						movieService.moviesfn(resJson);
						movieService.pagination({page:resJson.page, pages:resJson.total_pages});
						$(window).on('scroll', lazyLoaderFn);
					};
					var successFn = function(resJson) {
						$.each(resJson.results,function(k,v){results.push(v);});
					};
					var errFn = function(errorPayload) {};
					for(var i=1; i<=page.page; i++){
						promise = !favPressed ? movieService.searchMovie(query,i) : movieService.typeMovie(query,i);
						promise.then((i==page.page?lastSuccessFn:successFn),errFn);
					}//some serious bad junk coding
				}
			}else{
				movieService.pagination({page:0, pages:0});
				movieService.moviesfn({});
			}
		}
		myScope.navObj.paginate = function(whr){
			var disabledClass = 'disabled';
			var query = movieService.getLastQuery();
			var page = movieService.pagination();
			switch(whr){
				case +1:
				case -1:
					if(!query || (whr==-1 && query && page.page<=1) || (whr==+1 && query && (page.page==page.pages || page.pages==0)) ){
						return false;
					}
					var favPressed = myFavorites.indexOf(query)>-1 ;
					var promise = !favPressed ? movieService.searchMovie(query,(page.page+whr)) : movieService.typeMovie(query,(page.page+whr));
					promise.then(
						function(resJson) {
							movieService.moviesfn(resJson);
							movieService.pagination({page:resJson.page, pages:resJson.total_pages});
						},
						function(errorPayload) {
							//$log.error('failure loading movie', errorPayload);
						}
					);
					break;
				case 'more':
					if(!query || (query && (page.page==page.pages || page.pages==0)) ){
						return false;
					}
					var favPressed = myFavorites.indexOf(query)>-1 ;
					var promise = !favPressed ? movieService.searchMovie(query,(page.page+1)) : movieService.typeMovie(query,(page.page+1));
					promise.then(
						function(resJson) {
							movieService.moviesfn(resJson,true);
							movieService.pagination({page:resJson.page, pages:resJson.total_pages});
							$(window).on('scroll', lazyLoaderFn);
						},
						function(errorPayload) {
							//$log.error('failure loading movie', errorPayload);
						}
					);
					break;
				case 'previous':
					return (!query || (query && page.page<=1)) ? disabledClass : '';
				case 'next':
					return (!query || (query && (page.page==page.pages || page.pages==0))) ? disabledClass : '';
				case 'isPage':
					return {page:page.page,display:page.page+' of '+page.pages};
			}
		};
		myScope.navObj.loadTypeDisplay = function(lt){
			var pagination = (lt) ? lt==='P' : myScope.navObj.isLoadType('P') ;
			var lazyLoader = (lt) ? lt==='L' : myScope.navObj.isLoadType('L') ;
			return (pagination ? 'Pagination' : (lazyLoader ? 'Lazy-Loader' : ''));
		};

		myScope.navObj.isActive = function(wht){return (movieService.getLastQuery() === wht ? 'active btn-success' : '');}
		myScope.navObj.isLoadType = function(lt){return myScope.navObj.loadType === lt;}
		$location.url('');
	}]);
	
	/**
	* ng-controller :: MoviesController
	* to display all movie thumbnails.
	*/
	app.controller('MoviesController', ['$scope', '$location', 'movieService', 'movieConfig', function($scope, $location, movieService, movieConfig) {
		var myScope = this;
		$scope.$watch(function () {
			myScope.myMovieObj = movieService.moviesfn();
			return movieService;
		}, true);
		myScope.movieConfig = movieConfig;
		myScope.getMovie = function(key){
			var promise = movieService.getMovie(key);
			promise.then(
				function(resJson) {
					movieService.movieDetails(resJson);
					$(window).off('scroll', lazyLoaderFn);
					$location.url('movieDetails');
					movieService.getMovieCredits(key).then(
						function(resJson) {
							var movieDetail = movieService.movieDetails();
							movieDetail.cast = resJson.cast;
							movieDetail.crew = resJson.crew;
							movieService.movieDetails(movieDetail);
						}
					);
				},
				function(errorPayload) {
					//$log.error('failure loading movie', errorPayload);
				}
			);
		}
	}]);

	/**
	* ng-controller :: MovieDetailController
	* Expanded view with full movie details(linked from thumbs)
	*/
	app.controller('MovieDetailController', ['$scope', '$location', 'movieService', 'movieConfig', function($scope, $location, movieService, movieConfig) {
		var myScope = this;
		myScope.panelSt = true; 
		$scope.$watch(function () {
			myScope.movieDetails = movieService.movieDetails();
			if($('.progress-bar').length && !$('.progress-bar').width()){
				$('.progress-bar').animate({'width':((myScope.movieDetails.vote_average*10) +'%')}, {duration: 150, easing: 'swing'});
			}
			return movieService;
		}, true);
		myScope.movieConfig = movieConfig;
		myScope.goBack = function(){
			$location.url('movies');
			$(window).on('scroll', lazyLoaderFn);
		};
		myScope.panel = function(w){
			if(w===1){
				return myScope.panelSt;
			}else{
				myScope.panelSt = !myScope.panelSt;
				$('#movieDetailPane').slideToggle();
			}
		};
		myScope.formatDate	= function(d){
			var mon = ['January','February','March','April','May','June','July','August','September','October','November','December'];
			d = new Date(d);//'<sup>'+(d.getDate()==1 ? 'st': d.getDate()==2 ? 'nd' : d.getDate()==3 ? 'rd' : 'th')+'</sup>' + ' '
			return d.getDate() + ' ' + mon[d.getMonth()] + ', ' + d.getFullYear();
		};
		
		myScope.isReleased	= function(d){
			return ((new Date(d) - new Date()) < 0);
		};
	}]);
	
	
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
	
	app.directive('navigation', [function(){
		return {
			restrict: 'E'
			,templateUrl: './resources/templates/navigation.html'
			,replace: true
			,transclude: true
		};
	}]);
	
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

	app.directive('ngKeepScroll', function ($timeout) {
		return function (scope, element, attrs) {

			//load scroll position after everything has rendered
			$timeout(function () {
				//alert('0')
				var scrollY = parseInt(scope.$eval(attrs.ngKeepScroll));
				$(window).scrollTop(scrollY ? scrollY : 0);
			}, 0);

			//save scroll position on change
			scope.$on("$routeChangeStart", function () {
				//alert('1')
				scope.$eval(attrs.ngKeepScroll + " = " + $(window).scrollTop());
			});
		}
	});

	app.filter('trustAsResourceUrl', ['$sce', function($sce) {
		return function(val) {
			return $sce.trustAsResourceUrl(val);
		};
	}]);

})();

function lazyLoaderFn(){
	if(!$('#fetchMore').hasClass('disabled') && ($(this).scrollTop()+$(this).height()) == $(document).height()){
		$(this).off('scroll');
		$('#fetchMore').trigger('click');
	}
}
