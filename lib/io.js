;(function() {
    var legacyIo=function (data,onFinish,target,plainData,dataType) {
        target = target || LaPa.CONF.server.requestUrl;
        if(!target){if (onFinish)onFinish(false);return;}
        if(data) data = '?query=' + JSON.stringify(data)+'&rnd=' + new Date().getTime();else data='?rnd=' + new Date().getTime();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', target + data, true);
        //if(dataType)xhr.responseType=dataType;
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
                    //if(dataType)response=xhr.response;
                }else{
                    response = false;
                }
                if (onFinish)onFinish(response);
            }else{
            }
        };
        xhr.send();
    };
    function io(data,onFinish,target,plainData,dataType) {
        target = target || LaPa.CONF.server.requestUrl;
        if(!target){if (onFinish)onFinish(false);return;}
        if(data) data = '?query=' + JSON.stringify(data)+'&rnd=' + new Date().getTime();else data='?rnd=' + new Date().getTime();
        fetch(target + data)
            .then(function(response) {
                if (response.status !== 200) {
                    return false;
                }
                //if (dataType)return response[dataType]();
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