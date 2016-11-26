;(function () {
    "use strict";
    function getPage (id,noHistory) {
        LaPa.require('/lib/io.js',function () {
            LaPa.io(false, function (response) {
                if (response) {
                    LaPa.PAGE[id] = {'html':response,'url':id};
                    LaPa.page(id,noHistory);
                } else {
                    if(document.getElementById('LaPaLoader')){
                        document.getElementById('LaPaLoader').style.opacity='0';
                        setTimeout(function () {
                            document.getElementById('LaPaLoader').style.display='none';
                        },500);
                    }
                    if(LaPa.CONF.pageInit)LaPa.CONF.pageInit();
                    LaPa.message('Страница не найдена');
                }
            },id,true,'document');
        });
    }

    function genContent(contentHTML,targetPage) {
        if(!LaPa.EXT.check('genPage'))return false;
        if(targetPage)return LaPa.EXT.get('genPage',targetPage,genContent);
        if(!targetPage){
            if(contentHTML){
                LaPa.targetPage['contentHTML']=contentHTML;
                page(null,LaPa.targetPage);
            }else{
                LaPa.targetUrl = false;
                LaPa.targetPage = false;
                LaPa.message('Страница не найдена');
            }
        }
    }

    function getContent(targetPage) {
        if(targetPage['content']) {
            LaPa.require('/lib/io.js', function () {
                LaPa.io(false, function (response) {
                    if (response) {
                        targetPage['contentHTML'] = response;
                        targetPage = LaPa.EXT.get('preparePage', targetPage);
                        page(null, targetPage);
                    } else {
                        LaPa.targetUrl = false;
                        LaPa.targetPage = false;
                        LaPa.message('Страница не найдена');
                    }
                }, LaPa.CONF.pagesDir + targetPage['content'], true);
            });
        }else{
            genContent(null,targetPage);
        }
    }

    function legacyRenderPage (id,noHistory) {
        if(LaPa.CONF.fastTransitions){
            document.documentElement.innerHTML=LaPa.PAGE[id].html;
            if(LaPa.CONF.loader&&LaPa.CONF.loader.length)document.body.innerHTML+='<div id="LaPaLoader">'+LaPa.CONF.loader+'</div>';
            execScripts();
            LaPa.HOOK.call('readyPage',id,false);
        }else {
            var lapa = window.LaPa;
            document.open();
            document.write(LaPa.PAGE[id].html + '<script>LaPa.HOOK.call(\'readyPage\',\''+id+'\',false);</script>');
            document.close();
            window.LaPa = lapa;
            if(LaPa.CONF.loader&&LaPa.CONF.loader.length)document.body.innerHTML+='<div id="LaPaLoader">'+LaPa.CONF.loader+'</div>';
        }
        LaPa.pageState = 'ready';
        if(!noHistory)LaPa.historyAPI.push(id,window.title,id);
        LaPa.thisPage = id;
        LaPa.targetPage = false;
    }

    function renderPage(targetPage) {
        if(!LaPa.CONF.contentContainer)return LaPa.message('Не указан контейнер страниц');
        document.getElementById(LaPa.CONF.contentContainer).innerHTML=targetPage.contentHTML;
        window.scrollTo(0, 0);
        parseLinks();
        LaPa.HOOK.call('readyPage',LaPa.targetUrl,false);
        LaPa.pageState = 'ready';
        if(!LaPa.noHistory)LaPa.historyAPI.push(LaPa.targetUrl,window.title,LaPa.targetUrl);
        LaPa.noHistory=false;
        LaPa.thisPage = LaPa.targetUrl;
        LaPa.targetPage = false;
        LaPa.targetUrl = false;
    }

    function legacyPage (id,noHistory) {
        try {
            if (LaPa.targetPage)return;
            if (!LaPa.PAGE[id]) {
                if (LaPa.CONF.loader){
                    if(document.getElementById('LaPaLoader')){
                        document.getElementById('LaPaLoader').style.display='block';
                        document.getElementById('LaPaLoader').style.opacity='0';
                        setTimeout(function () {
                            document.getElementById('LaPaLoader').style.opacity='1';
                        },50);
                    }else if(LaPa.CONF.loader.length){
                        document.body.innerHTML+='<div id="LaPaLoader">'+LaPa.CONF.loader+'</div>';
                    }
                }
                if(LaPa.CONF.pageUnload)LaPa.CONF.pageUnload();
                getPage(id,noHistory);
                return;
            }
            LaPa.targetPage = id;
            legacyRenderPage(id,noHistory);
        }catch (e){
            console.log('LaPa Navigation error');
            location.href=id;
            throw e;
        }
    }

    function page(targetURL,targetPage) {
        if(!targetPage){
        var url=targetURL=='/'?[targetURL]:targetURL.split('/');
        var found=false;
        var exit=false;
        for(var i in url){
            if(url[i]=='')continue;
            if(targetPage){
                if(targetPage['pages'][url[i]]){
                    targetPage=targetPage['pages'][url[i]];
                    found=true;
                }else{
                    found=false;
                    exit=true;
                }
            }else{
                if(LaPa.PAGES[url[i]]){
                    targetPage=LaPa.PAGES[url[i]];
                    found=true;
                }else{
                    for(var j in LaPa.PAGES){
                        if(LaPa.PAGES[j].url==targetURL){
                            targetPage=LaPa.PAGES[j];
                            found=true;
                            exit=true;
                        }
                    }
                    if(!exit) {
                        found = false;
                        exit = true;
                    }
                }
            }
        }
        if(!found)return LaPa.message('Страница не найдена');
        }
        LaPa.targetUrl = targetURL||LaPa.targetUrl;
        LaPa.targetPage=targetPage;
        if(!targetPage['contentHTML']) {
            getContent(targetPage);
            return;
        }
        renderPage(targetPage);
    }

    function parseLinks() {
        var listLinks=document.getElementsByTagName('a');
        for(var link in listLinks){
            if(listLinks.hasOwnProperty(link)) {
                if (listLinks[link].onclick == null&&listLinks[link].host==location.host)listLinks[link].onclick = function () {
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
                if (listScripts[s].attributes.lapaskip){nodeScriptReplace(listScripts[s]);continue;}
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
        LaPa.renderPage = legacyRenderPage;
        LaPa.getPage = getPage;
        LaPa.parseLinks = parseLinks;
        if(LaPa.CONF.parseLinks)LaPa.HOOK.reg('readyPage',false,LaPa.parseLinks,'Links fetch');
        if(LaPa.CONF.loader)LaPa.HOOK.reg('readyPage',false,function () {
            if(document.getElementById('LaPaLoader')){
                document.getElementById('LaPaLoader').style.opacity='0';
                setTimeout(function () {
                    document.getElementById('LaPaLoader').style.display='none';
                },500);
            }
        },'Loader remove');
        execScripts(true);
        if (!LaPa.thisPage)LaPa.historyAPI.replace(location.pathname, window.title);
        if (LaPa.CONF.pagesJSON){
            LaPa.require('/lib/io.js',function () {
            LaPa.io(false,function (response) {
                if(response){
                    LaPa.PAGES=response;
                }
            },LaPa.CONF.pagesJSON);});
        }
        LaPa.EXT.reg('preparePage');
        LaPa.EXT.reg('genPage');
        if(LaPa.CONF.pageInit)LaPa.HOOK.reg('readyPage',false,LaPa.CONF.pageInit,'pageInit');
        if(LaPa.CONF.appInit)LaPa.CONF.appInit();
    }, '/lib/page.js');
    LaPa.importLib('/lib/page.js');
})();