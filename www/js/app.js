// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services','ngCordova','audioplayer','xp','LocalStorageModule'/*,'ionic-audio'*/])

.run(function($ionicPlatform, $window, $rootScope, xp) {
	$ionicPlatform.ready(function() {
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
			cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
			cordova.plugins.Keyboard.disableScroll(true);
		}
		if (window.StatusBar) {
		// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}
		
		// FAILED (even with working click-eventlistener and $apply) to get full body height and update dynamically (for android < 4.4? http://stackoverflow.com/questions/36513877/ionic-ion-content-does-not-scroll-on-loading-dynamic-data)
		//var body = document.body, html = document.documentElement;
		// http://stackoverflow.com/a/1147768
		//$rootScope.docHeight = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );

		// sometimes background image is not showing, because these values get empty string values in angular expressions
		/*$rootScope.windowWidth = window.innerWidth;
		$rootScope.windowHeight = window.innerHeight;
		window.addEventListener('resize', function() {
			$rootScope.$apply(function() {
				$rootScope.windowWidth = window.innerWidth;
				$rootScope.windowHeight = window.innerHeight;
			});
		})*/;
		// so create a function that makes sure these values are set when needed (might require event listener?)
		$rootScope.orientationIsHorizonal = function(){
			return (window.innerWidth > window.innerHeight);
		}
		$rootScope.xp = xp;
	});
})

.filter('secondsToDateTime', function() {
	// {{audioPosition | secondsToDateTime | date:'mm:ss'}}
	// {{audioPosition | secondsToDateTime | date:'HH:mm:ss'}}
    return function(seconds) {
        var d = new Date(0,0,0,0,0,0,0);
        d.setSeconds(Math.round(seconds));
        return d;
    };
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.exercises', {
    url: '/exercises',
    views: {
      'tab-exercises': {
        templateUrl: 'templates/tab-exercises.html',
        controller: 'ExercisesCtrl'
      }
    }
  })

  .state('tab.qna', {
      url: '/qna',
      views: {
        'tab-qna': {
          templateUrl: 'templates/tab-qna.html',
          controller: 'ChatsCtrl'
        }
      }
    })
    .state('tab.chat-detail', {
      url: '/chats/:chatId',
      views: {
        'tab-chats': {
          templateUrl: 'templates/chat-detail.html',
          controller: 'ChatDetailCtrl'
        }
      }
    })

  .state('tab.xp', {
    url: '/xp',
    views: {
      'tab-xp': {
        templateUrl: 'templates/tab-xp.html',
        controller: 'XPCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/tab/exercises');

});
