// ==UserScript==
// @name         动漫之家助手
// @namespace    http://manhua.dmzj.com/
// @version      0.1
// @description  获取动漫之家被屏蔽的漫画目录及章节
// @author       rainame
// @include      /^http://manhua.dmzj.com/[a-z]+/*$/
// @match        http://manhua.dmzj.com/*/*.shtml?cid=*
// @grant        GM_xmlhttpRequest
// @require      https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js
// @require      https://cdn.bootcss.com/fancybox/3.1.20/jquery.fancybox.min.js
// ==/UserScript==

(function($) {

    'use strict';

    if ((/^\/[a-z]+\/*$/).test(location.pathname)) {

        if (!unsafeWindow.g_comic_id) { return; }

        if ($('img[src="/css/img/4004.gif"]').length === 0) {
            $('div.cartoon_online_border li a,div.cartoon_online_border_other li a').each(function() {
                this.href += ('?cid=' + unsafeWindow.g_comic_id);
            });
            return;
        }

        $('div.middleright div.middleright_mr:eq(0) ul.cartoon_online_button').remove();
        $('div.middleright div.middleright_mr:eq(0) div.cartoon_online_border').remove();

        let pagenum = 160;

        GM_xmlhttpRequest({
            method: 'GET',
            url: 'http://v2.api.dmzj.com/comic/' + unsafeWindow.g_comic_id + '.json?channel=Android&version=2.6.004',
            onload: function(res) {

                if (res.status !== 200) { return; }

                let data = JSON.parse(res.responseText);

                if (!data || !data.chapters) { return; }

                let part = [];
                for (let x = 0; x < data.chapters.length; x++) {
                    let list = data.chapters[x].data.reverse(), ary = [], chapter, prefix;
                    for (let i = 0; i < list.length; i++) {
                        chapter = list[i];
                        prefix = ((x === 0 && (/^\d/).test(chapter.chapter_title)) ? '第' : '');
                        ary.push('<li><a title="' + unsafeWindow.g_comic_name + '-' + prefix + chapter.chapter_title + '" href="/' + unsafeWindow.g_comic_url + chapter.chapter_id + '.shtml?cid=' + unsafeWindow.g_comic_id + '"' + ((i === list.length - 1) ? ' class="color_red"' : '') + '>' + prefix + chapter.chapter_title + '</a></li>');
                    }

                    let border = [];
                    if (x === 0) {
                        let h2 = $('div.middleright div.middleright_mr:eq(0) div.photo_part:eq(0) h2:eq(0)');
                        h2.text(h2.text() + '全集');

                        let maxpage = Math.ceil(list.length / pagenum), button = [];
                        for (let i = 1; i <= maxpage; i++) {
                            button.push('<li class="t1 ' + ((i === maxpage) ? 'b1' : 'b2') + '" style="cursor: pointer;">第' + i + '页</li>');
                            border.push('<div class="cartoon_online_border"' + ((i === maxpage) ? '' : ' style="display:none"') + '><ul>' + ary.splice(0, pagenum).join('') + '</ul><div class="clearfix"></div></div>');
                        }

                        let JQButton = $('<ul class="cartoon_online_button margin_top_10px">' + button.join('') + '</ul>');
                        JQButton.children('li').each(function(i) {
                            $(this).click(function() {
                                $('.t1').addClass('b2');
                                $(this).removeClass('b2');
                                $(this).addClass('b1');
                                $(".cartoon_online_border").hide();
                                $(".cartoon_online_border").eq(i).show();
                            });
                        });

                        part.unshift(JQButton);
                    }
                    else {
                        let photo_part = '<div class="photo_part" style="margin-top: 20px;"><div class="h2_title2"><span class="h2_icon h2_icon22"></span><h2>' + unsafeWindow.g_comic_name + ' 漫画其它版本：' + data.chapters[x].title + '</h2></div></div>';
                        border.push('<div class="cartoon_online_border_other" style="border-top: 1px dashed #0187c5;"><ul>' + ary.join('') + '</ul><div class="clearfix"></div></div>');
                        part.unshift(photo_part);
                    }

                    part.unshift(border.join(''));
                }

                for (let x = 0; x < part.length; x++) {
                    $('#last_read_history').after(part[x]);
                }
            }
        });
    }
    else {

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
    }
})($);