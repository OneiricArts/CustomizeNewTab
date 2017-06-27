/**
 * Promisfied wrappers around chrome.* APIs
 * https://developer.chrome.com/extensions/api_index
 *
 * following Firefox api structure (which return promises) so this can simply
 * be excluded in FF build
 * https://developer.mozilla.org/en-US/Add-ons/WebExtensions
 *
 * @namespace
 */
const browser = { // eslint-disable-line no-unused-vars

  /**
   * {@link https://developer.chrome.com/extensions/storage | chrome.storage documentation}
   */
  storage: {

    /**
     * {@link https://developer.mozilla.org/en-US/Add-ons/WebExtensions/API/storage/local | storage.local }
     */
    local: {

      /**
       * (async) Gets one or more items from chrome.storage.local
       * @static
       * @param {*} key (type: string or array of string or object keys)
       * A single key to get, list of keys to get, or a dictionary specifying default
       * values (see description of the object). An empty list or object will return
       * an empty result object. Pass in null to get the entire contents of storage.
       * @returns {Promise<Object>} On success, returns: Object with items in their
       * key-value mappings. ({key: value}, empty if not found)
       */
      get(key) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.get(key, (result) => {
            const err = chrome.runtime.lastError;
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
      },

      /**
       * (async) Sets one or more items to chrome.storage.local
       * @static
       * @param {Object} object which gives each key/value pair to update storage with
       * @returns {Promise} resolves on success, rejects on error, no other return
       */
      set(object) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.set(object, () => {
            const err = chrome.runtime.lastError;
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      },

      /**
       * (async) Removes all items from chrome.storage.local
       * @static
       * @returns {Promise} resolves on success, rejects on error, no other return
       */
      clear() {
        return new Promise((resolve, reject) => {
          chrome.storage.local.clear(() => {
            const err = chrome.runtime.lastError;
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      },

    },
  },

  /**
   * {@link https://developer.chrome.com/extensions/topSites | topSites documentation}
   */
  topSites: {

    /**
     * (async) Gets a list of top sites (that are displayed on the default new tab page)
     * @static
     * @returns {Promise<Array>} on success, returns mostVisitedURLs, an array of
     * {mostVisitedURL} objects (which contain {string} url and {string} title)
     */
    get() {
      return new Promise((resolve, reject) => {
        chrome.topSites.get((mostVisitedURLs) => {
          const err = chrome.runtime.lastError;
          if (err) {
            reject(err);
          } else {
            resolve(mostVisitedURLs);
          }
        });
      });
    },

  },
};
