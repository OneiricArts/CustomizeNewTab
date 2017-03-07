
/**
 * Uses the Measurement Protocal
 * https://developers.google.com/analytics/devguides/collection/protocol/v1/reference
 *
 * Firefox does not allow analytics.js because it does not allow injecting remote
 * scripts into extensions.
 */
let GA_TRACKING_ID = 'UA-72036968-3';         // Firefox property
if (devEnv) GA_TRACKING_ID = 'UA-72036968-2'; // DEV_TEST property
const GA_CLIENT_ID = '5555';

function gaFF(message) { // eslint-disable-line no-unused-vars
  fetch('https://www.google-analytics.com/collect', {
    method: 'post',
    body: `v=1&tid=${GA_TRACKING_ID}&cid=${GA_CLIENT_ID}${message}`,
  });
}
