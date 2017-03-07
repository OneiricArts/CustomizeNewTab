/*eslint-disable */
(function (i, s, o, g, r, a, m) {
 i.GoogleAnalyticsObject = r; i[r] = i[r] || function () {
  (i[r].q = i[r].q || []).push(arguments);
 }, i[r].l = 1 * new Date(); a = s.createElement(o),
m = s.getElementsByTagName(o)[0]; a.async = 1; a.src = g; m.parentNode.insertBefore(a, m);
}(window,document,'script','https://www.google-analytics.com/analytics.js','ga'));
/*eslint-enable */

/* global ga:false */

/*
    how to setup for extension:
    https://davidsimpson.me/2014/05/27/add-googles-universal-analytics-tracking-chrome-extension/
    didn't know i had to do the check, and specify /new_tab.html
*/

let GA_TRACKING_ID = 'UA-72036968-1';         // Chrome property
if (devEnv) GA_TRACKING_ID = 'UA-72036968-2'; // DEV_TEST property
ga('create', GA_TRACKING_ID, 'auto');
ga('set', 'checkProtocolTask', null);
