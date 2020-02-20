import { build_html, embed } from "../jsx.to.js";
import css from "./player.css";
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
                <div class={css["content"]}>
                    {List(elems)}
                    {control}
                </div>
            </body>
        </html>
    );

    embed(content);
}

main();
