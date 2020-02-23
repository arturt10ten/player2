import { build_html, embed } from "../jsx.to.js";
import css from "./player.css";
import { head } from "./head.jsx";
import { Playlist } from "./comp/playlist/playlist.jsx";
import { List } from "./comp/list/list.jsx";
async function main() {
    let url = new URL(location.href);
    let p = url.searchParams.get("path");
    if (p == null) {
        embed(
            <html>
                {head}
                <body></body>
            </html>,
        );
        return;
    }
    let l = new Playlist();
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
