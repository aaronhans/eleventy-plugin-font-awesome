import test from "ava";
import Eleventy from "@11ty/eleventy";
import fontAwesomePlugin from "../plugin.js";
import { findIconMetadata, filterAttrs } from "../src/transform.js";

test("Transform", async t => {
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
	t.is(e.originalError.originalError.message, `Error with icon, via class="fa-solid fa-left". Resolved to: {"prefix":"fas","style":"solid","family":"classic","iconName":"left"}. Original error message: Could not find icon: fas:left`);
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
				defaultAttributes: {
					class: "zicon",
				}
			});

			eleventyConfig.addTemplate("index.njk", `{% icon "far:user" %}
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg class="zicon"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});

test("Transform with defaultAttributes", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				defaultAttributes: {
					class: "zicon"
				}
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fa-regular fa-user"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<svg class="zicon"><use href="#far-fa-user" xlink:href="#far-fa-user"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="user" class="svg-inline--fa fa-user" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" id="far-fa-user"><path fill="currentColor" d="M304 128a80 80 0 1 0 -160 0 80 80 0 1 0 160 0zM96 128a128 128 0 1 1 256 0A128 128 0 1 1 96 128zM49.3 464l349.5 0c-8.9-63.3-63.3-112-129-112l-91.4 0c-65.7 0-120.1 48.7-129 112zM0 482.3C0 383.8 79.8 304 178.3 304l91.4 0C368.2 304 448 383.8 448 482.3c0 16.4-13.3 29.7-29.7 29.7L29.7 512C13.3 512 0 498.7 0 482.3z"></path></symbol></svg>`);
});

test("Transform with ignoredClasses", async t => {
	let elev = new Eleventy("./test/virtual/", "./_site", {
		config: function(eleventyConfig) {
			eleventyConfig.addPlugin(fontAwesomePlugin, {
				ignoredClasses: ["fak"],
				failOnError: true,
			});

			eleventyConfig.addTemplate("index.njk", `<i class="fak fa-dot"></i><i class="fa-regular fa-font-awesome"></i>
{% getBundle "fontawesome" %}`);
		}
	});

	let [result] = await elev.toJSON();
	t.is(result.content, `<i class="fak fa-dot"></i><svg><use href="#far-fa-font-awesome" xlink:href="#far-fa-font-awesome"></use></svg>
<svg style="display: none;"><symbol aria-hidden="true" focusable="false" data-prefix="far" data-icon="font-awesome" class="svg-inline--fa fa-font-awesome" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" id="far-fa-font-awesome"><path fill="currentColor" d="M91.7 96C106.3 86.8 116 70.5 116 52C116 23.3 92.7 0 64 0S12 23.3 12 52c0 16.7 7.8 31.5 20 41l0 3 0 48 0 256 0 48 0 64 48 0 0-64 389.6 0c14.6 0 26.4-11.8 26.4-26.4c0-3.7-.8-7.3-2.3-10.7L432 272l61.7-138.9c1.5-3.4 2.3-7 2.3-10.7c0-14.6-11.8-26.4-26.4-26.4L91.7 96zM80 400l0-256 356.4 0L388.1 252.5c-5.5 12.4-5.5 26.6 0 39L436.4 400 80 400z"></path></symbol></svg>`);
});

test("findIconMetadata", async t => {
	t.deepEqual(findIconMetadata("fa-regular fa-user"), { family: "classic", iconName: "user", prefix: "far", style: "regular" });
	t.deepEqual(findIconMetadata("fas fa-starfighter fa-fw"), { family: "classic", iconName: "starfighter", prefix: "fas", style: "solid" });
	t.deepEqual(findIconMetadata("fal fa-arrow-up-right"), { family: "classic", iconName: "arrow-up-right", prefix: "fal", style: "light" });
});

test("filterAttrs", async t => {
	t.deepEqual(filterAttrs({
		class: "fas fa-sparkles fa-2xl"
	}), {
		class: "fa-2xl"
	});
});