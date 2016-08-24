;(function () {
    "use strict";
    function getPage (id,noHistory) {
        LaPa.require('/lib/io.js',function () {
            LaPa.io(false, function (response) {
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
            execScripts();
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

    function execScripts(preFetch) {
        var listScripts=document.getElementsByTagName('script');
        for(var s in listScripts){
            if(!listScripts.hasOwnProperty(s))continue;
            if(listScripts[s].src) {
                if (LaPa.SCRIPTS[listScripts[s].src])continue;
                LaPa.SCRIPTS[listScripts[s].src]=preFetch?true:nodeScriptReplace(listScripts[s]);
            }else{
                if(!preFetch)nodeScriptReplace(listScripts[s]);
            }
        }
    }
    function nodeScriptReplace(node) {
        if ( nodeScriptIs(node) === true ) {
            node.parentNode.replaceChild( nodeScriptClone(node) , node );
        }
        else {
            var i        = 0;
            var children = node.childNodes;
            while ( i < children.length ) {
                nodeScriptReplace( children[i++] );
            }
        }

        return node;
    }
    function nodeScriptIs(node) {
        return node.tagName === 'SCRIPT';
    }
    function nodeScriptClone(node){
        var script  = document.createElement("script");
        script.text = node.innerHTML;
        for( var i = node.attributes.length-1; i >= 0; i-- ) {
            script.setAttribute( node.attributes[i].name, node.attributes[i].value );
        }
        return script;
    }
    LaPa.HOOK.reg('initLib', false, function () {
        LaPa.PAGE = LaPa.PAGE||{};
        LaPa.SCRIPTS = {};
        LaPa.page = page;
        LaPa.renderPage = renderPage;
        LaPa.getPage = getPage;
        LaPa.parseLinks = parseLinks;
        if(LaPa.CONF.parseLinks)LaPa.HOOK.reg('readyPage',false,LaPa.parseLinks,'Links fetch');
        execScripts(true);
    }, '/lib/page.js');
    LaPa.importLib('/lib/page.js');
})();