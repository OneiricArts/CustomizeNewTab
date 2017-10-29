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
