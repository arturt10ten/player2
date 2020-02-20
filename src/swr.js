if ("serviceWorker" in navigator) {
    window.addEventListener("load", function() {
        navigator.serviceWorker
            .register("/sw.js")
            .then(function(registration) {
                // Регистрация успешна
                console.log(
                    "ServiceWorker registration successful with scope: ",
                    registration.scope,
                );
            })
            .catch(function(err) {
                // Регистрация не успешна
                console.log("ServiceWorker registration failed: ", err);
            });
    });
    // window.addEventListener('beforeinstallprompt', (e) => {
    //  	console.log("hi");
    //  	e.prompt();
    // });
}
