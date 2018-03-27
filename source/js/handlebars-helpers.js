/**
 * @file One place to register all Handlebar helpers used in project
 * Include before Handlebars templates
 * http://handlebarsjs.com/block_helpers.html
 * http://handlebarsjs.com/partials.html
 */

/* eslint-disable no-console */

/**
 * main case: converting 0 based index to 1 based index
 */
Handlebars.registerHelper('addOne', value => value + 1);

/**
 * Tells handlebars that this is a safe string, and to not escape it
 * Make sure whenever this is called that the input has been santitized and is actually safe
 *  can use Handlebars.Utils.escapeExpression for that
 *
 * https://github.com/wycats/handlebars.js/issues/647
 * https://stackoverflow.com/questions/10654234/how-to-decode-html-entity-with-handlebars
 */
Handlebars.registerHelper('htmlSafeString', inputData => new Handlebars.SafeString(inputData));

/**
 * (For debugging) Log to console
 */
Handlebars.registerHelper('log', (message) => { console.log(message); });

/**
 * (For debugging) Look through data passed into template
 */
Handlebars.registerHelper('lookup', (obj, field, options) => {
  console.log(obj);
  // return obj[field];
  return options.fn(this);
  // return options.inverse(this);
  // return obj.hasOwnProperty(field);
});

Handlebars.partials = Handlebars.templates;
