
## Stylistic Changes

Bootstrap 4 got rid of panels ... I went back to panels. Change that to cards sometime before Bootstrap 4 is stable. But Bootstrap 4 didn't like my glyphs, and after a lot of frustration I decided to ditch it for now.

#Coding Stuff

try {
	games_by_days[game.d].push(game);	
} catch (e) {

	/* if its a type error, means can't push.
		probably means that a day (key) was encountered
		that i hadn't though I would see. so just add it
	*/
	if (e instanceof TypeError) {
		games_by_days[game.d] = [game];	
	} 
}

vs.

if(games_by_days[game.d]) {
	games_by_days[game.d].push(game);
} else {
	games_by_days[game.d] = [game];
}