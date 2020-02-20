import { build_html, embed, insert } from "../jsx.to.js";
import css from "./file.css";

import del from "../../res/trash.svg";
import { List } from "../list/list.jsx";

import { svg } from "../../svg.css";

class Dir {
    constructor() {
        this._way = <div class={css["way"]}></div>;
        this._content = <div class={css["content"]}></div>;
        this._html = (
            <div>
                {this._way}
                {this._content}
            </div>
        );
    }
    /**
     *
     * @param {string} path
     */
    async load(path) {
        this._html.classList.add(css["loading"]);
        let way = path
            .split("/")
            .filter(i => i !== "")
            .map(i => i + "/");
        let { html } = ["/", ...way].reduce(
            ({ html, way }, i) => {
                let x = way + i;
                console.log(i);
                html.push(
                    <span
                        class={css["segment"]}
                        onclick={() => {
                            history.pushState(
                                "",
                                x,
                                `?path=${encodeURIComponent(x)}`,
                            );
                            this.load(x);
                        }}
                    >
                        {i}
                    </span>,
                );
                return { html, way: x };
            },
            {
                html: [],
                way: "",
            },
        );
        insert(<div class={css["path"]}>{html}</div>, this._way);
        /**
         * @type {Array<{dir:boolean,name:string}>}
         */
        let data = await fetch("/static/" + path).then(i => i.json());
        let elems = data.map(i => {
            if (i.dir) {
                return (
                    <a
                        class={[css["entery"], css["dir"]]}
                        onclick={() => {
                            history.pushState(
                                "",
                                path + "/" + i.name,
                                `?path=${encodeURIComponent(
                                    path + "/" + i.name,
                                )}`,
                            );
                            this.load(path + "/" + i.name);
                        }}
                    >
                        {i.name}
                    </a>
                );
            }
            if (i.name.endsWith(".pl.json")) {
                return (
                    <a
                        class={[css["entery"], css["playlist"]]}
                        href={`/player.html?path=${encodeURIComponent(
                            "/static/" + path + "/" + i.name,
                        )}`}
                    >
                        {i.name}
                        <img class={svg} src={del} />
                    </a>
                );
            }
            return (
                <a
                    class={[css["entery"], css["unknown"]]}
                    download
                    href={encodeURI("/static/" + path + "/" + i.name)}
                >
                    {i.name}
                </a>
            );
        });
        let list = List(elems);
        insert(list, this._content);
        this._html.classList.remove(css["loading"]);
    }
    html() {
        return this._html;
    }
}
export { Dir };
