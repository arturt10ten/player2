import { build_html, embed } from "../jsx.to.js";
import "./swr.js";
import "./null.css";
/**
 * @type {HTMLScriptElement}
 */
const script = document.querySelector("script[data-src]");
const head = (
    <head>
        <title>Player</title>
        <link rel="stylesheet" href="style.css" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {script}
    </head>
);
script.src = script.dataset.src;
script.defer = true;
script.innerText = "";
export { head };
