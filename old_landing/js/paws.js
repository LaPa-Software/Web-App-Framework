;(function () {
    function runPaws() {
        pawPutInterval = setInterval(function () {
            putPaw();
            createDomainsBox(false, true);
        }, 1500);
    }

    function putPaw() {
        if (pawCount > 200) {
            pawCount = 0;
            document.getElementById('paws-track').innerHTML = '';
        }
        if (pawPosition == true) {
            pawPosition = false;
            offsetStyle = 'lower-paw';
        } else {
            pawPosition = true;
            offsetStyle = 'upper-paw';
        }
        var paw = document.createElement('img');
        paw.src = '/css/paw.svg';
        paw.name = 'paw';
        paw.onmouseover = function () {
            this.style.opacity = '1';
        };
        paw.onmouseout = function () {
            this.style.opacity = '0';
        };
        paw.classList.add(offsetStyle);
        document.getElementById('paws-track').appendChild(paw);
        pawCount++;
        setTimeout(function () {
            paw.style.opacity = '0'
        }, 2000);
    }

    function stopPaws() {
        clearInterval(pawPutInterval);
    }

    function LoadDomainsList() {
        var xhr = new XMLHttpRequest();
        var url = 'http://' + location.host + '/api.php?listHosts' + '&rnd=' + new Date().getTime();
        xhr.open('GET', url, true);
        xhr.responseType = 'text';
        xhr.onload = function () {
            if (this.status == 200) {
                //localStorage.setItem('LaPaListHosts',this.response);
                createDomainsBox(this.response);
            }
        };
        xhr.send();
    }

    function createDomainsBox(list, first) {
        if (window.list) return;
        if (list) {
            var domains = '';
            list = JSON.parse(list);
            for (var i in list) {
                //domains+='<img src="domains/'+list[i]+'.png"/>';
                domains += '<div class="item" style="background-image: url(\'domains/' + list[i] + '.png\');\" onclick="location.href=\'http://' + list[i] + '\';"><span class="item-title">' + list[i] + '</span></div>';
            }
            document.getElementById('hostsListBox').innerHTML = domains;
            window.list = true;
        } else {
            /*if(localStorage.getItem('LaPaListHosts')){
                createDomainsBox(localStorage.getItem('LaPaListHosts'))
            }else{*/
            LoadDomainsList();
            //};
        }
    }

    LaPa.HOOK.reg('initLib', false, function () {
        window.pawPosition = false;
        window.pawCount = 0;
        window.runPaws = runPaws;
        window.stopPaws = stopPaws;
        window.LoadDomainsList = LoadDomainsList;
        window.createDomainsBox = createDomainsBox;
        window.list = false;
        LaPa.HOOK.reg('readyPage', false, window.runPaws, 'Paws decorate');
    }, 'js/paws.js');
    LaPa.importLib('js/paws.js');
})();