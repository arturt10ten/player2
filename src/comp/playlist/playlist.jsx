import { build_html, embed, insert } from "../jsx.to.js";
import css from "./playlist.css";

import prev from "../../res/previous.svg";
import play from "../../res/multimedia.svg";
import pause from "../../res/pause.svg";
import stop from "../../res/stop.svg";
import next from "../../res/next.svg";

import { svg } from "../../svg.css";

class Playlist {
    constructor(url) {
        this._audio = new Audio();
        this._status = this._init(url);
    }
    async _init(url) {
        this._data = await fetch(url).then(i => i.json());
        this._cur = 0;
        this._elements = this._data.map(i => (
            <a class={css["element"]}>{i.split("/").pop()}</a>
        ));
        this._audio.src = this._data[this._cur];
        this._elements[this._cur].classList.add(css["active"]);
        this._audio.addEventListener("ended", () => {
            this.go_next();
        });
        this._elements.forEach((i, j) => {
            i.addEventListener("click", () => {
                this.set(j);
            });
        });
        this._info = (
            <div class={css["info"]}>
                <span>{this._data[this._cur]}</span>
            </div>
        );
        this._bar = <div></div>;
        this._audio.addEventListener("timeupdate", () => {
            this._bar.style.width = `${(100 * this._audio.currentTime) /
                this._audio.duration}%`;
        });
        this._control = (
            <div>
                {this._info}
                <div class={css["bar"]}>{this._bar}</div>
                <div class={css["control"]}>
                    <img
                        class={[css["btn"], svg]}
                        src={prev}
                        onclick={() => {
                            this.go_prev();
                        }}
                    />
                    <img
                        class={[css["btn"], svg]}
                        src={stop}
                        onclick={() => {
                            this.stop();
                        }}
                    />
                    <img
                        class={[css["btn"], svg]}
                        src={play}
                        onclick={() => {
                            this.play();
                        }}
                    />
                    <img
                        class={[css["btn"], svg]}
                        src={pause}
                        onclick={() => {
                            this.pause();
                        }}
                    />
                    <img
                        class={[css["btn"], svg]}
                        src={next}
                        onclick={() => {
                            this.go_next();
                        }}
                    />
                </div>
            </div>
        );
    }
    async set(num) {
        await this._status;
        this._elements[this._cur].classList.remove(css["active"]);
        this._cur = num % this._data.length;
        this._audio.currentTime = 0;
        this._audio.src = this._data[this._cur];
        this._elements[this._cur].classList.add(css["active"]);
        this._audio.play();
        insert(<span>{this._data[this._cur]}</span>, this._info);
    }
    async go_next() {
        await this.set(this._cur + 1);
    }
    async go_prev() {
        await this.set(this._cur + this._data.length - 1);
    }
    async play() {
        this._audio.play();
    }
    async pause() {
        this._audio.pause();
    }
    async stop() {
        this._audio.pause();
        this._audio.currentTime = 0;
    }
    async elems() {
        await this._status;
        return this._elements;
    }
    async controls() {
        await this._status;
        return this._control;
    }
}

export { Playlist };
