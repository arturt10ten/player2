import { build_html, embed } from "../jsx.to.js";
import { head } from "./head.jsx";
import { Playlist } from "./comp/playlist/playlist.jsx";
import { List } from "./comp/list/list.jsx";
import { Dir } from "./comp/file/file.jsx";
async function main() {
    // let l = new Playlist("/static/pl.json");
    // let elems = await l.elems();
    // let control = await l.controls();

    let dir = new Dir();
    let content = (
        <html>
            {head}
            <body>{dir.html()}</body>
        </html>
    );

    embed(content);
    function reload() {
        let url = new URL(location.href);
        let path = url.searchParams.get("path");
        console.log(path);
        dir.load(path || "/");
    }
    reload();
    addEventListener("popstate", reload);
}

main();
