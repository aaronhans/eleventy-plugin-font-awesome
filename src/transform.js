import debugUtil from "debug";
import matchHelper from "posthtml-match-helper";

import { mergeAttrs, faIconToHtml } from "./icon-to-html.js";
import PREFIXES from "./prefixes.js";

const VALID_CLASSES = [
	"fa-fw"
]

const debug = debugUtil("Eleventy:FontAwesome");

function filterAttrs(attrs = {}) {
	if(attrs.class && typeof attrs.class === "string") {
		let newClass = attrs.class.split(" ").filter(cls => {
			if(VALID_CLASSES.includes(cls)) {
				return true;
			}

			return !cls.startsWith("fa-");
		}).join(" ");
		if(newClass) {
			attrs.class = newClass;
		} else {
			delete attrs.class;
		}
	}
	return attrs;
}

function findIconMetadata(className = "") {
	let classes = className.split(" ");
	let style;
	let family = "classic"; // optional, defaults to classic
	let iconName;
	let extras = new Set();

	for(let cls of classes) {
		if(!cls.startsWith("fa-")) {
			continue;
		}
		cls = cls.slice("fa-".length);

		if(PREFIXES.styles.includes(cls)) {
			style = cls;
		} else if(PREFIXES.families.includes(cls)) {
			family = cls;
		} else if(VALID_CLASSES.includes(cls)) {
			extras.add(cls);
		} else if(!iconName || cls.length > iconName.length) {
			iconName = cls;
		}
	}

	return { style, family, iconName, extras }
}

function classToIconSelector(className = "") {
	const { style, family, iconName } = findIconMetadata(className);
	if(style && family && iconName) {
		let prefix = PREFIXES.map[family][style];
		return `${prefix}:${iconName}`;
	}
}

function Transform(eleventyConfig, options = {}) {
	let transformSelector = options.transform || "i[class]";
	let bundleName = options.bundle;
	let managers = eleventyConfig.getBundleManagers();
	if(!managers[bundleName]) {
		throw new Error(`Missing ${bundleName} Bundle Manager for Font Awesome icon plugin.`);
	}

	eleventyConfig.htmlTransformer.addPosthtmlPlugin(
		"html",
		function (context = {}) {
			let pageUrl = context?.url;
			return function (tree, ...args) {
				tree.match(matchHelper(transformSelector), function (node) {
					let selector = classToIconSelector(node.attrs.class);
					if(selector) {
						try {
							let { ref, html } = faIconToHtml(selector);
							if(pageUrl && managers[bundleName] && html) {
								managers[bundleName].addToPage(pageUrl, [ html ]);

								return {
									tag: "svg",
									attrs: filterAttrs(mergeAttrs(node.attrs, options.defaultAttributes)),
									content: [
										{
											tag: "use",
											attrs: {
												href: `#${ref}`,
												"xlink:href": `#${ref}`,
											}
										}
									]
								};
							}
						} catch(e) {
							if(options.failOnError) {
								throw new Error(`Error with icon, via class="${node?.attrs?.class || "(unknown)"}". Resolved to: ${JSON.stringify(findIconMetadata(node.attrs.class))}. Original error message: ${e.message}`, {
									cause: e
								});
							} else {
								debug("Could not find icon: %o (ignoring via `failOnError` option)", selector);
								return node;
							}
						}
					}

					return node;
				});
			};
		}, // pluginOptions = {},
	);
}

export { Transform };
