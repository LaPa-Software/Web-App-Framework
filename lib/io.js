;(function() {
    var legacyIo=function (data,onFinish,target,plainData,async) {
        target = target || LaPa.CONF.server.requestUrl;
        if(!target){if (onFinish)onFinish(false);return;}
        if(data) data = '?query=' + JSON.stringify(data)+'&rnd=' + new Date().getTime();else data='?rnd=' + new Date().getTime();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', target + data, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4){
                var response = false;
                if(xhr.status == 200||xhr.status == 0) {
                    if (!plainData) {
                        try {
                            response = JSON.parse(xhr.responseText);
                        } catch (e) {
                            response = false;
                        }
                    }else response = xhr.responseText;
                }else{
                    response = false;
                }
                if (onFinish)onFinish(response);
            }else{
            }
        };
        xhr.send();
    };
    function io(data,onFinish,target,plainData,method) {
        target = target || LaPa.CONF.server.requestUrl;
        method=method||'get';
        if(!target){if (onFinish)onFinish(false);return;}
        var params='';
        if(data){
            params+='?';
            for(var i in data)params += i+'='+data[i]+'&';
        }
        var properties={
            'method':method,
            'cache':'no-cache'
        };
        if(method=='post')properties['body']=JSON.stringify(data);
        fetch(target + (method=='get'?params:''),properties)
            .then(function(response) {
                if (response.status !== 200) {
                    return false;
                }
                if (!plainData)return response.json();
                return response.text();
            })
            .then(function(text) {
                if(onFinish)onFinish(text);
            });
    }
    LaPa.HOOK.reg('initLib',false,function () {
        window.LaPa.legacyIo=legacyIo;
        window.LaPa.io=(typeof fetch == 'undefined')?legacyIo:io;
    },'/lib/io.js');
    LaPa.importLib('/lib/io.js');
})();