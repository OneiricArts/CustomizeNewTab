
## Stylistic Changes

Bootstrap 4 got rid of panels ... I went back to panels. Change that to cards sometime before Bootstrap 4 is stable. But Bootstrap 4 didn't like my glyphs, and after a lot of frustration I decided to ditch it for now.

## //TODO
1. Have View options (upcoming & current games only, favorites, etc.) (theres a filter glyph too) ... lower priority since you can just delete shit.
2. Use (one of) eye-open / fire / bullhorn / bell to signal live game. use one of them plus text in a button for red zone? 
3. Update Needs to add multiple events to live games.
... these will totally get done. 

## Bugs
Currently Downloading / Resetting All games just appends to current list. A refresh fixes this problem (for me and dev work it is adequite for now).

##Coding Stuff

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