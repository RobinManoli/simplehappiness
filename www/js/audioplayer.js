angular.module('audioplayer', [])

.directive('audioPlayer', ['$ionicPlatform', '$timeout', '$ionicLoading', '$cordovaMedia', '$interval', function($ionicPlatform, $timeout, $ionicLoading, $cordovaMedia, $interval) {
	return {
		restrict: 'AE',
		replace: 'true',
		templateUrl: 'templates/audioplayer.html',
		scope: {},
		link: function(scope, elem, attrs) {
			//scope.Math = window.Math;
			scope.isLastAudioPlayer = true;
			// create list of audioplayers, starting with first one
			if (scope.$parent.audioPlayers === undefined) scope.$parent.audioPlayers = [];
			// or if not first one
			else scope.$parent.audioPlayers[scope.$parent.audioPlayers.length-1].isLastAudioPlayer = false;
			scope.$parent.audioPlayers.push( scope );

			scope.showPlayer = false;
			scope.audioFilePath = attrs.audio;
			scope.audioTitle = attrs.title;
			scope.audioLoadFailed = false;
			scope.audioBanner = attrs.banner;
			scope.audio = null;
			scope.audioStatus = 0;
			scope.audioPosition = 0;
			scope.data = {}; // for two-way bindings
			scope.data.sliderPosition = 0;
			scope.data.audioDoPlayNext = false;
			
			scope.playerToggle = function(){
				scope.showPlayer = !scope.showPlayer;
			}
		
			var mediaSuccessCallback = function() {
				// according to documentation: The callback that executes after a Media object has completed the current play, record, or stop action.
				// ^^ https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-media/#media
				if (scope.audioStatus == 4)
				{
					// when audio has finished playing - not sure if triggers also on pressing stop
					scope.$parent.activePlayer = null;
					var index = scope.$parent.audioPlayers.indexOf(scope);
					// if not last audioplayer and do play next track setting is activated
					if ( scope.$parent.audioPlayers.length-1 > index && scope.data.audioDoPlayNext )
					{
							scope.showPlayer = false;
							var player = scope.$parent.audioPlayers[index + 1];
							// start next track from beginning (if played to middle)
							if ( player.audio ) player.seekTo(0);
							if (!player.isLastAudioPlayer) player.data.audioDoPlayNext = true;
							player.showPlayer = true;
							// start playback
							player.playToggle();
					}
				}
			}
			
			var mediaErrorCallback = function(error) {
				/* MediaError.MEDIA_ERR_ABORTED = 1, MediaError.MEDIA_ERR_NETWORK = 2, MediaError.MEDIA_ERR_DECODE = 3, MediaError.MEDIA_ERR_NONE_SUPPORTED = 4 */
				if (error.code == 1) // when file doesn't exist
				{
					scope.audioLoadFailed = true;
					alert("We're really sorry! There was an error playing this file.");
				}
			}
			
			var mediaStatusCallback = function(status) {
				// Media.MEDIA_NONE 	0	Media.MEDIA_STARTING 	1	Media.MEDIA_RUNNING 	2	Media.MEDIA_PAUSED 	3	Media.MEDIA_STOPPED 	4
				scope.audioStatus = status;
				if(status == 1) {
					$ionicLoading.show({template: 'Loading...'});
				} else {
					$ionicLoading.hide();
				}
			}
			
			scope.load = function(){
				// todo: when load context audio hide other audios' seek buttons
				// https://forum.ionicframework.com/t/how-to-play-local-audio-files/7479/5 android path fix
				var src = scope.audioFilePath;
				if ($ionicPlatform.is('android')){ src = '/android_asset/www/' + src; }
				scope.audio = new Media(src, mediaSuccessCallback, mediaErrorCallback, mediaStatusCallback);
				$timeout( function(){
					// wait x seconds before updating audioDuration, as it shows the -1 otherwise
					// since audioLoadFailed might happen after timeout has been initiated, check it here to prevent erroneous duration to show
					if (!scope.audioLoadFailed) scope.audioDuration = scope.audio.getDuration();
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

			scope.playToggle = function() {
				// other than toggles, also prevents multiple plays of same file
				// load file if not loaded
				// or if failed to load (to be able to try again, or show error again -- though this does not work anyway)
				if (!scope.audio && !scope.audioLoadFailed) scope.load();
				// audio load failed, return (to not break other audio players)
				if (scope.audioLoadFailed) return;

				if (scope.audioStatus == 2)
				{
					// PAUSE
					scope.stopInterval();
					scope.$parent.activePlayer = null;
					$cordovaMedia.pause(scope.audio);
					scope.getPosition();
				}
				else
				{
					// PLAY
					// pause other playing audio
					if ( scope.$parent.activePlayer !== undefined && scope.$parent.activePlayer ) scope.$parent.activePlayer.playToggle();
					scope.$parent.activePlayer = scope;
					//$cordovaMedia.play(scope.audio);
					scope.audio.play();
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

