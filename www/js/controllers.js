angular.module('starter.controllers', [])

.controller('DashCtrl', function($scope, $cordovaMedia, $ionicLoading, $ionicPlatform, $interval, $timeout) {
	$scope.audio = null;
	$scope.audioPosition = 0;
	//$scope.attemptedSetToPos = null;
	//$scope.didSetToPos = null;
	
	$scope.updatePosition = function(){
		//var pos = null;
		$scope.audio.getCurrentPosition(
		// success callback
			function (position) {
				if (position > 0 ) $scope.audioPosition = parseFloat(position);
				else $scope.audioPosition = 0;
				//pos = position;
			}
		);
		//return pos;
	}

	$scope.load = function(src){
		// todo: load context audio and hide other audios' seek buttons
		// https://forum.ionicframework.com/t/how-to-play-local-audio-files/7479/5 android path fix
		if ($ionicPlatform.is('android')){ src = '/android_asset/www/' + src; }
        $scope.audio = new Media(src, null, null, mediaStatusCallback);
		/*var mediaTimer = $interval(function () {
			$scope.updatePosition();
		}, 1000);*/
	}

    $scope.startInterval = function(src) {
		$scope.audioInterval = $interval($scope.updatePosition, 1000);
    }
	
	$scope.stopInterval = function() {
		$interval.cancel($scope.audioInterval);
	}

    $scope.playToggle = function(src) {
		// other than toggles, also prevents multiple plays of same file
		if (!$scope.audio) $scope.load(src);
        if ($scope.audioStatus == 2)
		{
			// pause
			$scope.stopInterval();
			$cordovaMedia.pause($scope.audio);
			$scope.updatePosition();
		}
		else
		{
			// play
			$cordovaMedia.play($scope.audio);
			$scope.updatePosition();
			$scope.startInterval();
		}
    }
	
	$scope.seek = function(delta){
		//$scope.pause(); // pause and remove interval, and update position
		//$interval.cancel($scope.audioInterval);
		$scope.stopInterval(); // clear interval for a while
		//var position = $scope.audioPosition;
		delta = delta * 1000;
		var newpos = $scope.audioPosition * 1000 + delta;
		//$scope.audioPosition = parseInt(newpos/1000); // update without calling update position
		$scope.audioPosition = '...';
		if (newpos < 0) $scope.audio.seekTo(0);
		else $scope.audio.seekTo(newpos/2); // for some strange reason, seekto sets to double the expected value
		$timeout( function(){
			// wait 2 seconds before updating audioInterval, as it shows the wrong time otherwise
			$scope.startInterval();
		}, 100	);
		//$scope.play(); // resume and recreate interval, and update position // fails, only pauses above
		//$scope.updatePosition();
		//$scope.audioInterval = $interval($scope.updatePosition, 1000);
		
/*		$scope.audio.getCurrentPosition( function(position){
			//$cordovaMedia.pause($scope.audio);
			var newpos = position * 1000 + delta;
			$scope.audioPosition = parseInt(newpos/1000)
			newpos = newpos / 2; // for some strange reason, seekto sets to double the expected value
			if (newpos < 0) $scope.audio.seekTo(0);
			else $scope.audio.seekTo(newpos);
			$scope.updatePosition(); // todo: make this return position so no need to getCurrentPosition again in here
			//$scope.attemptedSetToPos = newpos/1000;
			//$cordovaMedia.play($scope.audio);
			// debug and see how the new position is not the same as seekto (works when doing .pause and then .play first)
			//$scope.audio.getCurrentPosition( function(position){
			//	$scope.didSetToPos = position;
			//});
		});*/
	}
 
	$scope.audioStatus = 0;
    var mediaStatusCallback = function(status) {
		$scope.audioStatus = status;
		/*
		Media.MEDIA_NONE 	0
		Media.MEDIA_STARTING 	1
		Media.MEDIA_RUNNING 	2
		Media.MEDIA_PAUSED 	3
		Media.MEDIA_STOPPED 	4
		*/
        if(status == 1) {
            $ionicLoading.show({template: 'Loading...'});
        } else {
            $ionicLoading.hide();
        }
    }
})
	/*$scope.track = {
		url: 'audio/kiirtan.mp3',
		artist: 'This is simple happiness.',
		title: 'Simple Happiness',
		art: 'img/inspiration.jpg'
	}*/
	// https://www.airpair.com/ionic-framework/posts/using-web-audio-api-for-precision-audio-in-ionic web audio api

.controller('ChatsCtrl', function($scope, Chats) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats) {
  $scope.chat = Chats.get($stateParams.chatId);
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});


