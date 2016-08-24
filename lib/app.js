;(function () {
    "use strict";
    function getPage(id, noHistory,response,forceLoad) {
        // TODO: User defined API for loading pages
        if (response) {
            if(response['init'])response['init']=Function(response['init']);
            LaPa.PAGE[id] = response;
            LaPa.page(id,noHistory);
        } else {
            if(forceLoad)location.href=id;else LaPa.message('Страница не найдена');
        }
    }

    function renderPage(id, noHistory) {
        document.body.innerHTML = LaPa.PAGE[id].body;
        window.title = LaPa.PAGE[id].title || CONF.title;
        if (LaPa.PAGE[id].init)try {
            LaPa.PAGE[id].init();
        } catch (e) {
            console.log('Error while initialising page: ' + id);
            throw e
        }
        LaPa.HOOK.call('readyPage', false, false);
        LaPa.pageState = 'ready';
        if (!noHistory)LaPa.historyAPI.push(id, window.title);
        LaPa.thisPage = id;
        LaPa.targetPage = false;
    }

    function page(id, noHistory) {
        try {
            if (LaPa.targetPage)return;
            if (!LaPa.PAGE[id]) {
                if(LaPa.CONF.getPageAPI)LaPa.CONF.getPageAPI(id,noHistory);else getPage(id,null,false,true);
                return;
            }
            LaPa.targetPage = id;
            renderPage(id, noHistory);
        } catch (e) {
            console.log('LaPa Navigation error');
            LaPa.message('При открытии страницы произошла ошибка');
            throw e
        }
    }

    function parseLinks() {
        var listLinks = document.getElementsByTagName('a');
        for (var link in listLinks) {
            if (listLinks.hasOwnProperty(link)) {
                if (listLinks[link].onclick == null)listLinks[link].onclick = function () {
                    LaPa.page(this.pathname);
                    return false;
                }
            }
        }
    }

    LaPa.HOOK.reg('initLib', false, function () {
        LaPa.PAGE = LaPa.PAGE || {};
        LaPa.page = page;
        LaPa.getPage = getPage;
        LaPa.QUERY = function () {
            // This function is anonymous, is executed immediately and
            // the return value is assigned to QueryString!
            var query_string = {};
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                // If first entry with this name
                if (typeof query_string[pair[0]] === "undefined") {
                    query_string[pair[0]] = decodeURIComponent(pair[1]);
                    // If second entry with this name
                } else if (typeof query_string[pair[0]] === "string") {
                    var arr = [query_string[pair[0]], decodeURIComponent(pair[1])];
                    query_string[pair[0]] = arr;
                    // If third or later entry with this name
                } else {
                    query_string[pair[0]].push(decodeURIComponent(pair[1]));
                }
            }
            return query_string;
        }();
        LaPa.parseLinks = parseLinks;
        if (LaPa.CONF.parseLinks)LaPa.HOOK.reg('readyPage', false, LaPa.parseLinks, 'Links fetch');
        if (!LaPa.thisPage&&LaPa.CONF.initPage)LaPa.page(LaPa.CONF.initPage);
    }, '/lib/app.js');
    LaPa.importLib('/lib/app.js');
})();