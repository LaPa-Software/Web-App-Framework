;(function () {
    "use strict";
    function getPage (id,noHistory) {
        LaPa.require('/lib/io.js',function () {
            LaPa.testIo(false, function (response) {
                if (response) {
                    LaPa.PAGE[id] = {'html':response,'url':id};
                    LaPa.page(id,noHistory);
                } else {
                    LaPa.message('Страница не найдена');
                }
            },id,true,'document');
        });
    }

    function renderPage (id,noHistory) {
        if(LaPa.CONF.fastTransitions){
            document.documentElement.innerHTML=LaPa.PAGE[id].html;
            LaPa.HOOK.call('readyPage',false,false);
        }else {
            var lapa = window.LaPa;
            document.open();
            document.write(LaPa.PAGE[id].html + '<script>LaPa.HOOK.call(\'readyPage\',false,false);</script>');
            document.close();
            window.LaPa = lapa;
        }
        LaPa.pageState = 'ready';
        if(!noHistory)LaPa.historyAPI.push(id,window.title,id);
        LaPa.thisPage = id;
        LaPa.targetPage = false;
    }

    function page (id,noHistory) {
        try {
            if (LaPa.targetPage)return;
            if (!LaPa.PAGE[id]) {
                getPage(id,noHistory);
                return;
            }
            LaPa.targetPage = id;
            renderPage(id,noHistory);
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