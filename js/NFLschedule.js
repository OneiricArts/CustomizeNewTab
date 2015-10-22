var NFLschedule = (function(){

	function displayInfo(jsonObj) {
		//console.log($('#week_number'));
		$('#week_number').text("Week " + jsonObj.gms.w);
		
		//console.log('----');
		//console.log(jsonObj.gms.g);
		//console.log('----');

		// determines order
		var days = ["Mon", "Thu", "Sun"];
		
		var games_by_days = {
			"Sun": [],
			"Mon": [],
			"Thu": [],
		};

		for (var i = 0; i < jsonObj.gms.g.length; i++) {
			game = jsonObj.gms.g[i];
			
			try {
    			games_by_days[game.d].push(game);	
			} catch (e) {

				/* if its a type error, means can't push.
					probably means that a day (key) was encountered
					that i hadn't though I would see. so just add it
				
					replace with if has key / else ?
				*/
				if (e instanceof TypeError) {
    				games_by_days[game.d] = [game];	
    			} 
			}
		};

		//console.log(games_by_days);


		// go through all days
		for (var i = 0; i < days.length; i++) {
			console.log(days[i] + "...");
			//console.log(games_by_days[days[i]]);

			var $game_div = $('#game_day_template').clone();

			$game_div.removeAttr('id');

			var $game_title = $game_div.find('.card-title');
			var $game_list = $game_div.find('ul');

			

			
			//console.log($game_list);
			$game_title.html(days[i]);

			// go through games for that day
			for (var j = 0; j < games_by_days[days[i]].length; j++) {

				var $game_item = $game_div.find('#game_item_template').clone();
			$game_item.removeAttr('id');

				var $home_team = $game_item.find('#home-team');
				var $away_team = $game_item.find('#away-team');
				var $game_time = $game_item.find('#game-time');

				var game = games_by_days[days[i]][j];

				$home_team.html(game.hnn);
				$away_team.html(game.vnn);
				var arrtime = game.t.split(':');
				var hrs = arrtime[0] - 3;
				var mins = arrtime[1];
 				$game_time.html(hrs + ":" + mins);



 				$game_list.append($game_item);
 				$game_item.removeAttr('style');
			}

			$('#nfl_games').append($game_div);
			$game_div.show();
		}

		//console.log(days.length);
	}

	function getInfo() {

		var url = 'http://www.nfl.com/liveupdate/scorestrip/ss.xml'

		var xhr = new XMLHttpRequest();
		xhr.open("GET", url, true);
		
		xhr.onreadystatechange = function() {
			//console.log('got xml');
			var response = xhr.responseXML;

			if(response) {
				//console.log(response);
				var jsonObj = $.xml2json(response);
				//console.log(jsonObj);
				displayInfo(jsonObj);
			}
		}

		xhr.send();
	}


	/* API for other js code */
	return {
		getInfo: getInfo,
	}

})();