let token = null;
async function check_account() {
    let id = await fetch("/api/accounts.js").then(i => i.text());
    if (id) {
        token = id;
        return true;
    } else {
        return false;
    }
}
async function login(login, password) {
    let url = new URL("/api/accounts.js");
    url.searchParams = new URLSearchParams([
        ["login", login],
        ["password", password],
    ]);
    let id = await fetch(url.href).then(i => i.text());
    token = id;
    if (id) return true;
    else return false;
}
async function check_local() {
    try {
        var acc = await navigator.credentials.get({
            password: true,
            mediation: "optional",
        });
        return await login(acc.id, acc.password);
    } catch (err) {
        return false;
    }
}
async function store_local(login, password) {
    try {
        var obj = { id: login, password: password };
        var acc = await navigator.credentials.create({ password: obj });
        await navigator.credentials.store(acc);
    } catch (err) {}
}
async function get_token() {
    if (token != null) return token;
    await check_account();
    await check_local();
    return token;
}
