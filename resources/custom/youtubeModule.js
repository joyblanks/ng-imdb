/*
Need some more work injecting script causes to not to reload only reloads once

<div class="row" ng-if="movie.movieDetails.trailers.youtube.length">
	<div class="col-sm-4" ng-repeat="vid in movie.movieDetails.trailers.youtube | limitTo: 3">
		<div class="embed-responsive embed-responsive-16by9">
			<youtube id="{{vid.source}}" myid="{{vid.source}}" current-time="time" class="embed-responsive-item" ></youtube>
		</div>
	</div>
</div>

DI : in main app 'youtube-service'

*/



var ser = angular.module('youtube-service', []);

ser.directive('youtube', ['youtubeEmbed', '$window', '$interval', function(youtubeEmbed, $window, $interval){
	return {
		restrict: 'E',
		template: '<div id="player_{{myid}}"></div>',
		scope: {
				state: '=',
				currentTime: '=',
				myid: '@'
		},
		link: function(scope, element, attrs){
			//scope.playerState = 
			scope.currentTime = 0;
			youtubeEmbed.yt().then(function(yt){
				$window.onYouTubePlayerAPIReady = function(){
					scope.createPlayer = function(attrs){
						if(scope.player) 
							scope.player.destroy();
						var player = new YT.Player('player_'+attrs.id, { height: 390, width: 640, videoId: attrs.id, playerVars: { 'autoplay': 0, 'controls': 1 } });
						player.addEventListener("onStateChange", function(state){
							console.log("state", state);
							if(state.data==1){
								scope.timer = $interval(function(){
									if(scope.player)
									scope.currentTime = scope.player.getCurrentTime();
								}, 250);
							}else{
								if(scope.timer){
									$interval.cancel(scope.timer);
								}
							}
						});
						return player;
					}
					scope.player = scope.createPlayer(attrs);

					/*scope.$watch(function(){ return attrs.id;}, function(newVal){
						var videoId = newVal;
						scope.player = scope.createPlayer(attrs);
					});*/

					scope.$on('$destroy', function() {
			          // Make sure that the interval is destroyed too
			          if(scope.timer){
			          	$interval.cancel(scope.timer);
			          	scope.timer = null;
			          }
			        });
				}
			});
		}
	};
}]);




ser.factory('youtubeEmbed', ['$document', '$q', '$rootScope', function($document, $q, $rootScope){

	var y = $q.defer();

	function onScriptLoad(){
		y.resolve(window.yt);
	}
	if($('#www-widgetapi-script').length){
		onScriptLoad();
	}else{
		var scriptTag = $document[0].createElement('script');
		scriptTag.type = 'text/javascript';
		scriptTag.async = true;
		scriptTag.src = 'https://www.youtube.com/player_api';
		scriptTag.onreadystatechange = function(){
			if(this.readyState == 'complete')
				onScriptLoad();
		}
		scriptTag.onload = onScriptLoad();

		var s = $document[0].getElementsByTagName('body')[0];
		s.appendChild(scriptTag);
	}

	return {
		yt: function(){ return y.promise; }
	};

}]);