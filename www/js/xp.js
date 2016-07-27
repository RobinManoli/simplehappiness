angular.module('xp', [])

.service('xp', function($timeout, localStorageService) {
	var $this = this;
	// https://github.com/grevory/angular-local-storage
	if ( !localStorageService.get("points") ) localStorageService.set("points", 0)
	this.points = localStorageService.get("points");
	this.add = function(points){
		// smoothen xp points to not make it obvious what causes them... should change to update all accumlated points every minute
		$timeout(function(){
			$this.points += points;
			localStorageService.set("points", $this.points)
		}, 0);
	}
})

/*.service('store', function($window) {
	var $this = this;
	this.save = $window.localStorage.setItem; //("username", username)
	this.load = $window.localStorage.getItem; //("username")
	this.del = $window.localStorage.removeItem; //("username")
})*/