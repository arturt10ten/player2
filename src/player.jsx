import { build_html, embed } from "../jsx.to.js";
import { head } from "./head.jsx";
import { Playlist } from "./comp/playlist/playlist.jsx";
import { List } from "./comp/list/list.jsx";
async function main() {
    let url = new URL(location.href);
    let l = new Playlist(url.searchParams.get("path"));
    let elems = await l.elems();
    let control = await l.controls();
    let content = (
        <html>
            {head}
            <body>
                {control}
                {List(elems)}
            </body>
        </html>
    );

    embed(content);
}

main();
