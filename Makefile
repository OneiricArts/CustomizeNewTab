# My Makefile yo

.PHONY: handlebars

handlebars:
	@handlebars -m ./ChromeExt/templates/> ./ChromeExt/templates/templates.js
	@echo compiled handlebars
