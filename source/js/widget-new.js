/**
 * Abstract building block for all widgets.
 * 3rd edition.
 * @abstract
 * @class
 * @requires browser
 * @requires Handelbars (object of compiled templates)
 * @requires jQuery.js
 */
class WidgetNew { // eslint-disable-line no-unused-vars

  constructor() {
    this.data = {};
    this.datakey = '';
    this.initialized = false;
  }

  /**
   * Runs on control button toggle on
   */
  on() {
    if (!this.initialized) { this.initialized = true; this.initOnce(); }
    this.init();
  }

  /**
   * Called only once per widget lifetime, called first time on() is run
   * @abstract
   * @example Can be used to put a modal {HTMLElement} into page
   */
  initOnce() {} // eslint-disable-line class-methods-use-this

  /**
   * Runs on control button toggle on (called from on())
   * @abstract
   */
  init() {}     // eslint-disable-line class-methods-use-this

  /**
   * Runs on control button toggle off
   * @abstract
   */
  off() {}      // eslint-disable-line class-methods-use-this

  /**
   * (async) Sets this.data to the value stored in chrome.local.storage
   * (only if it exists in storage)
   * @example synchronous usage: await this.loadData()
   * @returns {Promise} all async functions return a promise
   */
  async loadData() {
    const loadedData = await browser.storage.local.get(this.datakey);
    if (loadedData[this.datakey]) { this.data = loadedData[this.datakey]; }
  }

  /**
   * (async) Saves current this.data to chrome.local.storage
   * @example synchronous usage (rarely needed): await this.saveData()
   * @returns {Promise} will resolve when set is completed
   */
  saveData() {
    return browser.storage.local.set({ [this.datakey]: this.data });
  }

  /**
   * (static) Compile handlebars tempalte to HTMLElement and inserts into page
   * @static
   * @param {string} templateName name of .handlebars file
   * @param {string} key name of top level data structure passed to template
   * @param {object} dataObj top level data structure being passed to template
   * @param {HTMLElement} $element its html will be replaced with the template
   * @param {boolean} [showAffect] (optional) fade in affect (default=false)
   */
  static displayTemplate(templateName, key, dataObj, $element, showAffect = false) {
    const template = Handlebars.templates[templateName];
    const output = template({ [key]: dataObj });

    if (showAffect) {
      $element.hide();
      $element.html(output);
      $element.fadeIn(500);
    } else {
      $element.html(output);
    }
  }
}
