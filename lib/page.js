;(function () {
    "use strict";
    function getPage (id) {
        LaPa.require('/lib/io.js',function () {
            LaPa.testIo(false, function (response) {
                if (response) {
                    LaPa.PAGE[id] = {'html':response,'url':id};
                    LaPa.page(id);
                } else {
                    LaPa.message('Страница не найдена');
                }
            },id,true,'document');
        });
    }

    function renderPage (id) {
        var lapa=window.LaPa;
        document.open();
        document.write(LaPa.PAGE[id].html+'<script>LaPa.HOOK.call(\'readyPage\',false,false);</script>');
        document.close();
        window.LaPa=lapa;
        LaPa.pageState = 'ready';
        LaPa.historyAPI.push(id,window.title,id);
        LaPa.thisPage = id;
        LaPa.targetPage = false;
    }

    function page (id) {
        try {
            if (LaPa.targetPage)return;
            if (!LaPa.PAGE[id]) {
                getPage(id);
                return;
            }
            LaPa.targetPage = id;
            renderPage(id);
        }catch (e){
            console.log('LaPa Navigation error');
            location.href=id;
        }
    }

    function parseLinks() {
        var listLinks=document.getElementsByTagName('a');
        for(var link in listLinks){
            if(listLinks.hasOwnProperty(link)) {
                if (listLinks[link].onclick == null)listLinks[link].onclick = function () {
                    LaPa.page(this.pathname);
                    return false;
                }
            }
        }
    }
    LaPa.HOOK.reg('initLib', false, function () {
        LaPa.PAGE = LaPa.PAGE||{};
        LaPa.page = page;
        LaPa.renderPage = renderPage;
        LaPa.getPage = getPage;
        LaPa.parseLinks = parseLinks;
        if(LaPa.CONF.parseLinks)LaPa.HOOK.reg('readyPage',false,LaPa.parseLinks,'Links fetch');
    }, 'page.js');
})();