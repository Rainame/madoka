// ==UserScript==
// @name         DMZJ Chapter
// @namespace    http://manhua.dmzj.com/
// @version      0.1
// @description  获取动漫之家被屏蔽的漫画章节
// @author       rainame
// @match        http://manhua.dmzj.com/*/*.shtml?cid=*
// @grant        GM_xmlhttpRequest
// @require      https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js
// @require      https://cdn.bootcss.com/fancybox/3.1.20/jquery.fancybox.min.js
// ==/UserScript==

(function($) {

    'use strict';

    if ($('a.error-btn').length === 0 || !(/\?cid=[\d+]/).test(location.search)) { return; }

    $.fancybox.defaults.clickSlide = false;
    $.fancybox.defaults.margin = 0;
    $.fancybox.defaults.afterClose = function() {
        location.href = location.href.substr(0, location.href.lastIndexOf('/') + 1);
    };

    unsafeWindow.stop();

    $('head meta[http-equiv="refresh"]').remove();
    $('head style').remove();
    $('head').append('<link href="https://cdn.bootcss.com/fancybox/3.1.20/jquery.fancybox.min.css" rel="stylesheet">');
    $('body').empty();

    let comicid = location.search.match(/\d+/)[0], chapterid = location.pathname.match(/\d+/)[0];

    GM_xmlhttpRequest({
        method: 'GET',
        url: 'http://v2.api.dmzj.com/chapter/' + comicid + '/' + chapterid + '.json?channel=Android&version=2.6.004',
        onload: function(res) {

            if (res.status !== 200) { return; }

            let data = JSON.parse(res.responseText);

            if (!data || !data.page_url) { return; }

            $('head title').text(data.title);

            let list = [];
            for (let i = 0; i < data.page_url.length; i++) {
                list.push({
                    src : data.page_url[i]
                });
            }
            setTimeout(function(){$.fancybox.open(list);}, 500);
        }
    });
})($);