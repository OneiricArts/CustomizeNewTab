## What is it?
![Screenshot](./screenshots/README.png?raw=true)

[![Get it in the Chrome Web Store](https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png)](https://chrome.google.com/webstore/detail/sports-new-tab-page-beta/cbdhcjkifbkbckpoejnakoekiheijpei)

[Get it on the Chrome Store](https://chrome.google.com/webstore/detail/sports-new-tab-page-beta/cbdhcjkifbkbckpoejnakoekiheijpei)

This extension replaces Chrome's New Tab Page with one that provides a sports-oriented experience. See live scores for current NBA, NFL, NHL, and MLB games, plus some other features:

* see close NBA games highlighted
* see which NFL games feature a team in the red zone (scoring threat)
* see NBA box score and detailed stats for all games

### State of Extension

The first part of developing this extension was basically making something that worked and people liked using (functionality and performance). That part went really well. **Now, I am focused on improving code quality and eliminating technical debt.** I was considering rewriting the entire thing and leveraging ES6/7 features from the beginning, but I have written it well enough that I can rewrite it in parts and still be able to simultaneously add functionality/bug fixes.

Rough outline of plan (~~striked through~~ means completed):

1. ~~Building a prototype to answer:~~  
   - ~~Is it technically possible for me to build a sports-centric new tab page with live scores, box scores, etc? Do I find it useful? Do other people find it useful? Yes Yes Yes~~
2. ~~Build a functioning protype with functionality and performance that is signifincantly better than other alternatives.~~
   - ~~Context aware highlighting to provide real time info. that leads to me being able to catch good moments of games~~
   - ~~Build system that results in a optimized final build of the extension & fast start-up time~~ 
3. Clean code base so that a new dev could pick it up very easily (track with [project](https://github.com/OneiricArts/CustomizeNewTab/projects/1)/milestone)
   - async/promises to eliminate callback hell and make logic more readable (~~including promisified wrappers around Chrome APIs~~)
   - restructure objects that are too strongly tied in the current OO design, remphasize truely shared features (now that I have a good knowledge of the APIs and how I want widgets to behave)
   - Comprehensive automated tests
   - ~~Metrics to monitor performance, error rates, and telemetry data~~
   - Firefox port, will also ensure cross platform code
4. Start adding more functionality again
   - Beautiful backgrounds that don't degregade performance (start leveraging background scripts)
   - Bookmark Bar widget to reach feature parity with Chrome's default new tab page
   - Today's events from Google Calendar
   - Progressive Web App for mobile (PWAs in Android continue to get better)

### More info in Wiki

Information on building (uses gulp.js) and other general info (permissions, future plans, etc.) [in project wiki](https://github.com/OneiricArts/CustomizeNewTab/wiki/).

### Acknowledgements  

> "If I have seen further, it is by standing on the shoulders of giants." - Isaac Newton

Icon made by [freepik](http://www.flaticon.com/authors/freepik) from www.flaticon.com  [link](http://www.flaticon.com/free-icon/scoreboard-tied_79638#term=scores&page=1&position=13)

Open Source Libraries: [Bootstrap4](https://v4-alpha.getbootstrap.com/), [jQuery](https://jquery.com/), [Handlebars](http://handlebarsjs.com/), [Lodash](https://lodash.com/)

Build Tools: [Gulp.js](http://gulpjs.com/), [Bable.js](https://babeljs.io/), [Babili](https://github.com/babel/babili) (+used [UglifyJS](https://github.com/mishoo/UglifyJS2))

+S/O to [VS Code](https://code.visualstudio.com/) ([JSDoc](http://usejsdoc.org/) style comments in code primarily used for [IntelliSense](https://code.visualstudio.com/docs/languages/javascript#_intellisense))

and more!