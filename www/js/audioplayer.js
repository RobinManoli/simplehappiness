angular.module('audioplayer', [])

.directive('audioPlayer', ['$ionicPlatform', '$timeout', '$ionicLoading', '$cordovaMedia', '$interval', function($ionicPlatform, $timeout, $ionicLoading, $cordovaMedia, $interval) {
	return {
		restrict: 'AE',
		replace: 'true',
		templateUrl: 'templates/audioplayer.html',
		scope: {},
		link: function(scope, elem, attrs) {
			scope.audioFilePath = attrs.file;
			scope.audioTitle = attrs.title;
			scope.audio = null;
			scope.audioStatus = 0;
			scope.audioPosition = 0;
			scope.data = {}; // for two-way bindings
			scope.data.sliderPosition = 0;
			
			var mediaStatusCallback = function(status) {
				// Media.MEDIA_NONE 	0	Media.MEDIA_STARTING 	1	Media.MEDIA_RUNNING 	2	Media.MEDIA_PAUSED 	3	Media.MEDIA_STOPPED 	4
				scope.audioStatus = status;
				if(status == 1) {
					$ionicLoading.show({template: 'Loading...'});
				} else {
					$ionicLoading.hide();
				}
			}
			
			scope.load = function(src){
				// todo: when load context audio hide other audios' seek buttons
				// https://forum.ionicframework.com/t/how-to-play-local-audio-files/7479/5 android path fix
				if ($ionicPlatform.is('android')){ src = '/android_asset/www/' + src; }
				scope.audio = new Media(src, null, null, mediaStatusCallback);
				$timeout( function(){
					// wait x seconds before updating audioDuration, as it shows the -1 otherwise
					scope.audioDuration = scope.audio.getDuration();
				}, 500	);
			}

			scope.getPosition = function(){
				scope.audio.getCurrentPosition(
					// success callback
					function (position) {
						// todo: remove parseFloat
						if (position > 0 ) scope.audioPosition = parseFloat(position);
						else scope.audioPosition = 0;
						scope.data.sliderPosition = scope.audioPosition;
					}
				);
			}

			scope.startInterval = function(src) {
				scope.audioInterval = $interval(scope.getPosition, 1000);
				//$scope.audioInterval = $interval(function(){ $scope.audioPosition += 1; $scope.data.sliderPosition = $scope.audioPosition; }, 1000); // less cpu - count without checking real position
			}
			
			scope.stopInterval = function() {
				$interval.cancel(scope.audioInterval);
			}

			scope.playToggle = function(src) {
				// other than toggles, also prevents multiple plays of same file
				if (!scope.audio) scope.load(src);
				if (scope.audioStatus == 2)
				{
					// pause
					scope.stopInterval();
					$cordovaMedia.pause(scope.audio);
					scope.getPosition();
				}
				else
				{
					// play
					$cordovaMedia.play(scope.audio);
					scope.getPosition();
					scope.startInterval();
				}
			}

			scope.seekTo = function(position){
				scope.stopInterval(); // clear interval for a while
				if ( position < 0 ) position = 0;
				if ( position > scope.audioDuration ) position = scope.audioDuration;
				scope.audio.seekTo(position*1000); // for some strange reason, seekto sets to double the expected value, at least on kiirtan.mp3 @ dmtech (android)
				scope.audioPosition = position;
				$timeout( function(){
					// wait x seconds before updating audioInterval, as getPosition shows the wrong time before seekTo is done
					scope.startInterval();
				}, 100	);
			}

			scope.sliderChange = function(){
				// move to slider position if no position value received
				// similar implementation http://atomx.io/2015/01/ionic-range-slider-when-playing-a-file-with-ngcordovas-cordovamedia/
				scope.seekTo( scope.data.sliderPosition );
			}
			
			scope.seek = function(delta){
				scope.seekTo( scope.audioPosition + delta );
			}
		},
	};
}]);

