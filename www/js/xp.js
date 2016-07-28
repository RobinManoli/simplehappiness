angular.module('xp', [])

.controller('XPCtrl', function($scope) {
	//$scope.moment = moment;
	//$scope.now = moment();
	var sessions = []; // todo: store as array in localStorage
	for (var i = 30; i >= 0; i--)
	{
		var score = Math.floor((Math.random() * 5)); // 0-5 score depending on how much practice that day
		if (!score) continue;
		var xp = Math.floor((Math.random() * 1000));
		var unixtime = moment().add(-i, 'days').unix();
		sessions.push( {score:score, xp:xp, unixtime:unixtime} ); // make sure to test empty weeks and days
	}
	
	var startDate = moment.unix( sessions[0].unixtime ).day(1); // start at first day (monday=1) of the week of the first session
	var now = moment();

	$scope.weeks = [];
	//$scope.weeks = sessions;
	//console.log(sessions);
	var diffWeeks = now.diff(startDate, 'weeks'); // not that startDate.week() > now.week() if startDate was end of last year and now the beginning of this year

	// create empty calendar
	for (var i = 0; i <= diffWeeks; i++)
	{
		$scope.weeks.push([]) // create array for each week
		for (var day = 0; day < 7; day++)
		{
			//var dayMoment = moment(startDate.unixtime).weeks(i).days(day);
			$scope.weeks[i].push({}) // create object for each day
			// mark days that are in the future
			if (i == diffWeeks)
			{
				// compensate from first day being sunday to monday
				var nowday = now.day() - 1;
				if (nowday < 0) nowday = 6;
				if (day > nowday) $scope.weeks[i][day].future = true;
			}
		}
	}
	//console.log($scope.weeks, diffWeeks);

	// fill calendar
	for(var i in sessions)
	{
		var session = sessions[i];
		session.moment = moment.unix(session.unixtime);
		var week = session.moment.diff(startDate, 'weeks');
		// compensate from first day being sunday to monday
		var day = session.moment.day() - 1;
		if (day < 0) day = 6;
		session.today = !session.moment.diff(now, 'days');
		//console.log(session, session.moment, week);
		$scope.weeks[week][day] = session;
		//var week = session.week();
		//if ( $scope.weeks.indexOf(week) < 0 ) $scope.weeks.push(week);
		//if (!(week in $scope.weeks)) $scope.weeks[week] = [];
		//$scope.weeks[week].push(session)
	}
})

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