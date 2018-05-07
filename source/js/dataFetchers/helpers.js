const helpers = {}; // eslint-disable-line no-unused-vars

/**
 * Calculates offset between [US East Coast (EST or EDT)] and [UTC]
 *
 * To determine if the US East coast is in either
 * EST (Eastern Standard Time) or EDT (Eastern Daylight Savings Time)
 * the function first determines if day light savings time is on
 *
 * https://stackoverflow.com/questions/11887934/how-to-check-if-the-dst-daylight-saving-time-is-in-effect-and-if-it-is-whats
 * https://www.timeanddate.com/time/zones/est
 * https://www.timeanddate.com/time/zones/edt
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTimezoneOffset
 *
 * @param {Date} [date=(new Date())] - date on which to calculate offset
 * @returns {number} offset (4 or 5)
 *
 */
const etUtcOffset = (date = new Date()) => {
  const jan = new Date(date.getFullYear(), 0, 1);
  const jul = new Date(date.getFullYear(), 6, 1);

  const stdTimezoneOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  const dalightSavingsTime = date.getTimezoneOffset() < stdTimezoneOffset;

  // EST + 5 = UTC
  // EDT + 5 = UTC
  const EST_UTC_OFFSET = 5;
  const EDT_UTC_OFFSET = 4;
  return dalightSavingsTime ? EDT_UTC_OFFSET : EST_UTC_OFFSET;
};

const etToUTC = (date) => {
  date.setUTCHours((date.getHours() + etUtcOffset(date)) % 24);
  return date;
};

/**
 * Convert date in EST/EDT or UTC to user (current system) local time
 * @param {Date} date
 * @param {boolean} utc - has to be UTC || (EST/EDT)
 */
helpers.toLocalTime = (date, utc = false) => {
  let convertedDate = date;

  if (!utc) {
    convertedDate = etToUTC(convertedDate);
  }

  const options = { hour: '2-digit', minute: '2-digit' };
  return convertedDate.toLocaleTimeString([], options).split(' ')[0];
};
