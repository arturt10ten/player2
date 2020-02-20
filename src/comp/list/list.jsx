import { build_html, embed } from "../jsx.to.js";
import css from "./list.css";

let List = arr => (
    <ul class={css["list"]}>
        {arr.map(i => (
            <li class={css["element"]}>{i}</li>
        ))}
    </ul>
);

export { List };
