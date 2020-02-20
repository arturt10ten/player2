const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

const rollup = require("rollup");
const resolve = require("@rollup/plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");
const importAssets = require("rollup-plugin-import-assets");
const babel = require("rollup-plugin-babel");
const includePaths = require("rollup-plugin-includepaths");
const incstr = require("incstr");

const OMT = require("rollup-plugin-off-main-thread");
const postcss = require("rollup-plugin-postcss");
const image = require("rollup-plugin-import-images");
const postCSSUrl = require("postcss-url");

const dist = "./dist/";
const source = "./src/";
const pages = ["index", "player"];
var elems = {};
const nextId = incstr.idGenerator({
    alphabet:
        "_-1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM",
});
const rollup_inp = {
    input: [...pages.map(i => source + i + ".jsx"), source + "/sw.js"],
    plugins: [
        resolve(),
        includePaths({
            paths: [source, "./"],
            extensions: [".js", ".jsx", ".css"],
        }),
        OMT(),
        image({
            include: ["**/*.jpeg", "**/*.jpg", "**/*.png"],
            fileNames: "images/[hash].[ext]",
        }),
        importAssets({
            include: ["**"],
            exclude: [
                "**/*.js",
                "**/*.jsx",
                "**/*.css",
                "**/*.html",
                "**/*.jpg",
                "**/*.jpeg",
                "**/*.png",
            ],
            emitAssets: true,
            fileNames: "assets/[hash].[ext]",
            publicPath: "",
        }),
        terser({
            sourcemap: true,
            module: true,
            compress: {
                module: true,
                passes: 4,
                hoist_props: true,
                toplevel: true,
            },
            mangle: {
                toplevel: true,
                properties: {
                    regex: /^_/,
                },
            },
            output: {
                comments: false,
            },
        }),
        postcss({
            minimize: true,
            extract: dist + "style.css",
            sourceMap: true,
            modules: {
                generateScopedName: function(name, filename, css) {
                    if (!elems[filename]) elems[filename] = {};
                    if (elems[filename][name]) return elems[filename][name];
                    while (true) {
                        let canditate = nextId();
                        if (canditate.includes("ad")) continue;
                        if ("1234567890-".includes(canditate[0])) continue;
                        elems[filename][name] = canditate;
                        return canditate;
                    }
                },
            },
            namedExports(name) {
                return name.replace(/-\w/g, val => val.slice(1).toUpperCase());
            },
            plugins: [
                require("cssnano")({
                    preset: "default",
                }),
                postCSSUrl({
                    url: "inline",
                    assetsPath: "assets",
                    to: dist + "style.css",
                    maxSize: 2,
                    fallback: "copy",
                    hashOptions: { method: "xxhash64", shrink: 16 },
                    useHash: true,
                }),
            ],
        }),
        babel({
            plugins: [
                [
                    "@babel/plugin-transform-react-jsx",
                    {
                        pragma: "build_html",
                    },
                ],
                ["@babel/plugin-syntax-dynamic-import"],
            ],
        }),
    ],
};
const rollup_out = {
    dir: dist,
    format: "amd",
    sourcemap: true,
    entryFileNames: "[name].js",
    chunkFileNames: "[name]-[hash].js",
    sourcemapPathTransform: relativePath => {
        return path.relative("../" + source, relativePath);
    },
};
async function main() {
    const bundle = await rollup.rollup(rollup_inp);
    await bundle.write(rollup_out);
    for (let i = 0; i < pages.length; i++) {
        let js = await fs.promises.readFile(dist + pages[i] + ".js");
        let html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><link rel="preload" href="./style.css" as="style"><script>${js}</script></head><body></body></html>`;
        await fs.promises.writeFile(dist + pages[i] + ".html", html);
    }
    await fs.promises.writeFile(
        dist + "/404.html",
        `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>ERROR 404</body></html>`,
    );
    await compress_dir(dist, "br");
}
main();

async function compress_file(file, dist) {
    let source = await fs.promises.readFile(file);
    let result = await new Promise(res => {
        zlib.brotliCompress(source, (err, comp) => {
            res(comp);
        });
    });
    await fs.promises.writeFile(dist, result);
}
async function compress_dir(from, to) {
    let list = await fs.promises.readdir(from, { withFileTypes: true });
    await fs.promises.mkdir(to).catch(() => {});
    for (let i = 0; i < list.length; i++) {
        let entery = list[i];
        if (entery.isDirectory()) {
            await compress_dir(
                from + "/" + entery.name,
                to + "/" + entery.name,
            );
        }
        if (entery.isFile()) {
            await compress_file(
                from + "/" + entery.name,
                to + "/" + entery.name,
            );
        }
    }
}
