const puppeteer = require("puppeteer");

const RENDER_CACHE = new Map();

async function render(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    try {
        await page.goto(url, { waitUntil: "networkidle0" });
    } catch (err) {
        console.error(err);
        throw new Error("page.goto/waitForSelector timed out. " + url);
    }
    const html = await page.content();
    await browser.close();
    return html;
}

async function ssr(url) {
    const start = Date.now();
    if (!RENDER_CACHE.has(url)) RENDER_CACHE.set(url, render(url));
    let html = await RENDER_CACHE.get(url);
    const ttRenderMs = Date.now() - start;
    console.info(`Headless rendered page in: ${ttRenderMs}ms`);
    return { html, ttRenderMs };
}

module.exports = ssr;
