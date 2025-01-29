import test from "ava";
import Eleventy from "@11ty/eleventy";
import fontAwesomePlugin from "../plugin.js";

test("Transform is working", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin);

			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});

test("Transform using a missing (pro) icon", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin);

			eleventyConfig.addTemplate("index.njk", `<i class="fa-solid fa-left"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content.trim(), `<i class="fa-solid fa-left"></i>`);
});

test("Transform using a missing (pro) icon with fail on error", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				failOnError: true,
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fa-solid fa-left"></i>
{% getBundle "fontawesome" %}`);
		}
	});
	elev.disableLogger();

	let e = await t.throwsAsync(() => elev.toJSON());
	t.is(e.originalError.originalError.message, `Could not find icon: fas:left`);
});

test("Transform is working in layout", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin);

			eleventyConfig.addTemplate("_includes/layout.njk", `{{ content | safe }}
{% getBundle "fontawesome" %}`);
			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>`, {
				layout: "layout.njk"
			});
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});

test("Shortcode", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				transform: false,
				shortcode: "icon",
				shortcodeClass: "zicon",
			});

			eleventyConfig.addTemplate("index.njk", `{% icon "far:user" %}
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg class="zicon"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});