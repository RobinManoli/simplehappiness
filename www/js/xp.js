angular.module('xp', [])

.service('xp', function($timeout) {
	var $this = this;
	this.points = 0;
	this.add = function(points){
		$timeout(function(){
			$this.points += points;
		}, 5000);
	}
})