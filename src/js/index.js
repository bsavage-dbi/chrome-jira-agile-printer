(function() {
    'use strict';
    function injectJs(link) {
        var scr = document.createElement('script');
        scr.type = 'text/javascript';
        scr.src = link;
        (document.head || document.body || document.documentElement).appendChild(scr);
    }

    function injectCss(link) {
        var scr = document.createElement('link');
        scr.type = 'text/css';
        scr.href = link;
        scr.rel = 'stylesheet';
        (document.head || document.body || document.documentElement).appendChild(scr);
    }

    function request(url, callback) {
        var xhr = new XMLHttpRequest();
        try {
            xhr.onreadystatechange = function() {
                if (xhr.readyState != 4) {
                    return;
                }

                callback(xhr.response);
            };

            xhr.onerror = function(error) {
                console.error(error);
            };

            xhr.open('GET', url, true);
            xhr.send(null);
        } catch (e) {
            console.error(e);
        }
    }

    request(chrome.extension.getURL('templates.html'), function(html) {
        (document.head || document.body || document.documentElement).innerHTML += html;
    });
    injectJs(chrome.extension.getURL('print.min.js'));
    request(chrome.extension.getURL('app.min.css'), function(css) {
        (document.head || document.body || document.documentElement).innerHTML += '<style>' + css + '</style>';
    });
})();