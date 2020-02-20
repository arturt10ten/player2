const fs = require("fs");
const path = require("path");
const urljoin = require("url-join");
const crypto = require("crypto");
const { createFilter } = require("rollup-pluginutils");

function hash(content) {
    return crypto
        .createHmac("sha256", content)
        .digest("hex")
        .substr(0, 16);
}

function makeFileName(name, hash, ext, pattern) {
    return pattern
        .replace("[name]", name)
        .replace("[hash]", hash)
        .replace("[ext]", ext);
}
async function generate_image(id, pluginOptions, ext, size, source_hash) {
    const base_name = path.basename(id).split(".")[0];
    const tmp_name = `/tmp/${source_hash}.${ext}`;
    try {
        await fs.promises.access(tmp_name);
    } catch (err) {
        await new Promise(res => {
            const { exec } = require("child_process");
            var child = exec(
                `convert '${id}' -resize "${size}>" -quality 80 '${ext}:${tmp_name}'`
            );
            child.on("exit", code => {
                res(code);
            });
        });
    }
    const source = await fs.promises.readFile(tmp_name).catch(() => {
        return fs.promises.readFile(id);
    });
    fs.promises.unlink(tmp_name);
    const fileName = makeFileName(
        base_name,
        source_hash,
        ext,
        pluginOptions.fileNames
    );
    return { fileName, source, ext };
}
module.exports = function svelte(options = {}) {
    const defaultPluginOptions = {
        include: [/\.gif$/i, /\.jpg$/i, /\.png$/i],
        exclude: [],
        emitAssets: true,
        fileNames: "assets/[name]-[hash].[ext]",
        publicPath: ""
    };

    const pluginOptions = Object.assign({}, defaultPluginOptions);
    Object.keys(options).forEach(key => {
        if (!(key in defaultPluginOptions))
            throw new Error(`unknown option ${key}`);
        pluginOptions[key] = options[key];
    });

    const filter = createFilter(pluginOptions.include, pluginOptions.exclude);

    const assets = {};

    return {
        name: "images",

        async load(id) {
            // console.log(id);
            if (!filter(id)) return null;
            let source_hash = hash(await fs.promises.readFile(id));
            let results = await Promise.all(
                ["png", "jpg", "webp"].map(async ext => {
                    return await generate_image(
                        id,
                        pluginOptions,
                        ext,
                        "1240x720",
                        source_hash
                    );
                })
            );
            if (pluginOptions.emitAssets) {
                assets[id] = results;
            }
            // let str = "";
            // results.forEach(({ fileName, source, ext }) => {
            //     str += `let ${ext}='${urljoin(
            //         pluginOptions.publicPath,
            //         fileName
            //     )}';`;
            //     str += `export {${ext}};`;
            //     if (ext == "png") {
            //         str += `export default '${urljoin(
            //             pluginOptions.publicPath,
            //             fileName
            //         )}';`;
            //     }
            // });

            return `export default {${results
                .map(
                    ({ fileName, source, ext }) =>
                        `${ext}:'${urljoin(
                            pluginOptions.publicPath,
                            fileName
                        )}'`
                )
                .join(",")}};`;
        },

        generateBundle(options, bundle) {
            if (!pluginOptions.emitAssets) return;

            const bundleAsset = (dest, data) => {
                bundle[dest] = {
                    fileName: dest,
                    isAsset: true,
                    source: data
                };
            };

            for (const chunk of Object.values(bundle)) {
                if (chunk.isAsset === true) continue;

                for (const f of Object.keys(chunk.modules).filter(filter)) {
                    assets[f].forEach(i => {
                        bundleAsset(i.fileName, i.source);
                        chunk.imports.push(i.fileName);
                    });
                }
            }
        }
    };
};
