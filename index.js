const path = require("path");
const url = require("url");
const http = require("http");
const fs = require("fs");

const mime = require("mime");

const prerender = require("./prerenderer.js");

const searchBots = [/Googlebot/, /YandexBot/];

// function set_cookie(res, name, val, ttl) {
//     var arr = res.getHeader("Set-Cookie") || [];
//     arr.push(
//         cookie.serialize(name, val, {
//             httpOnly: false,
//             path: "/",
//             maxAge: ttl || 365 * 24 * 60 * 60,
//         }),
//     );
//     res.setHeader("Set-Cookie", arr);
// }
// var cookies = cookie.parse(req.headers.cookie || "");
// if (sessions[c._s] === undefined) {
//     s = new Session();
// } else {
//     s = sessions[c._s];
// }
class ReqRes {
    constructor(req, res) {
        this._req = req;
        this._res = res;
    }
    get req() {
        return this._req;
    }
    get res() {
        return this._res;
    }
    get path() {
        if (!this._path) {
            this._path = path.normalize(this.ask_.pathname);
            if (this._path == "/") this._path = "/index.html";
        }
        return this._path;
    }
    get params() {
        return this.ask_.query;
    }
    get ask_() {
        if (!this._ask_) {
            this._ask_ = url.parse(this.req.url, true);
        }
        return this._ask_;
    }
}

async function handle_file(r) {
    if (r.path.endsWith(".html")) {
        if (!/HeadlessChrome/.test(r.req.headers["user-agent"])) {
            if (searchBots.some(reg => reg.test(r.req.headers["user-agent"]))) {
                r.res.end(
                    (await prerender("http://127.0.0.1:8089" + r.req.url)).html,
                );
                return;
            }
        }
    }
    let acceptEncoding = r.req.headers["accept-encoding"];
    if (!acceptEncoding) {
        acceptEncoding = "";
    }
    let a_headers = {};
    let a_path = r.path;
    let status = 200;
    try {
        try {
            if (!/\bbr\b/.test(acceptEncoding)) throw {};
            await fs.promises.stat("./br/" + a_path);
            a_path = "./br/" + a_path;
            a_headers["Content-Encoding"] = "br";
        } catch (err) {
            await fs.promises.stat("./dist/" + a_path);
            a_path = "./dist/" + a_path;
        }
    } catch (err) {
        a_path = "./404.html";
        status = 404;
        try {
            if (!/\bbr\b/.test(acceptEncoding)) throw {};
            await fs.promises.stat("./br/" + a_path);
            a_path = "./br/" + a_path;
            a_headers["Content-Encoding"] = "br";
        } catch (err) {
            await fs.promises.stat("./dist/" + a_path);
            a_path = "./dist/" + a_path;
        }
    }
    let file = fs.createReadStream(a_path);
    r.res.writeHead(status, {
        "Content-Type": mime.getType(a_path),
        ...a_headers,
    });
    file.on("error", () => {});
    file.pipe(r.res);
}

async function handle_static(r) {
    if (r.req.method == "GET") {
        let acceptEncoding = r.req.headers["accept-encoding"];
        if (!acceptEncoding) {
            acceptEncoding = "";
        }
        let a_headers = {};
        let a_path = r.path;
        let status = 200;
        let stat;
        try {
            stat = await fs.promises.stat("./" + a_path);
            a_path = "./" + a_path;
        } catch (err) {
            a_path = "./404.html";
            status = 404;
            try {
                if (!/\bbr\b/.test(acceptEncoding)) throw {};
                stat = await fs.promises.stat("./br/" + a_path);
                a_path = "./br/" + a_path;
                a_headers["Content-Encoding"] = "br";
            } catch (err) {
                stat = await fs.promises.stat("./dist/" + a_path);
                a_path = "./dist/" + a_path;
            }
        }
        if (stat.isFile()) {
            let file = fs.createReadStream(a_path);
            r.res.writeHead(status, {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": mime.getType(a_path),
                "Content-Length": stat.size,
                ...a_headers,
            });
            file.on("error", () => {});
            file.pipe(r.res);
        }
        if (stat.isDirectory()) {
            let dir = await fs.promises.readdir(a_path, {
                withFileTypes: true,
            });
            r.res.writeHead(200, {
                "Access-Control-Allow-Origin": "*",
                "Content-Type": "application/json",
            });
            r.res.end(
                JSON.stringify(
                    dir
                        .filter(i => i.isDirectory() || i.isFile())
                        .map(i => {
                            return {
                                dir: i.isDirectory(),
                                name: i.name,
                            };
                        }),
                ),
            );
        }
        return;
    }
    if (r.req.method == "PUT") {
        await fs.promises
            .mkdir(path.dirname("./" + r.path), {
                recursive: true,
            })
            .catch(i => {});
        let file = fs.createWriteStream("./" + r.path);
        r.req.on("error", () => {});
        r.req.pipe(file);
        r.req.on("end", () => {
            r.res.end();
        });
        return;
    }
    if (r.req.method == "DELETE") {
        await fs.promises
            .rmdir("./" + r.path, { recursive: true })
            .catch(i => {});
        r.res.writeHead(200, {
            "Access-Control-Allow-Origin": "*",
        });
        r.res.end();
        return;
    }
    if (r.req.method == "OPTIONS") {
        console.log(r.req);
        r.res.writeHead(200, {
            "Access-Control-Allow-Methods": "*",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Max-Age": 100,
        });
        r.res.end();
        return;
    }
    console.log(r.req.method);
}
var server = http
    .createServer(async function http_server_handler(req, res) {
        var r = new ReqRes(req, res);
        if (r.path.startsWith("/static/")) return await handle_static(r);
        if (r.path.startsWith("/api/")) return await handle_api(r);
        return await handle_file(r);
    })
    .listen(8089);
