// ==UserScript==
// @name         动漫之家助手
// @namespace    https://manhua.dmzj.com/
// @version      0.1
// @description  获取动漫之家被屏蔽的漫画目录及章节
// @author       rainame
// @match        https://manhua.dmzj.com/*
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @require      https://cdn.bootcss.com/jquery/3.2.1/jquery.min.js
// @require      https://cdn.bootcss.com/fancybox/3.1.20/jquery.fancybox.min.js
// @noframes
// ==/UserScript==

(function($, unsafeWindow) {

    'use strict';

    if (typeof unsafeWindow.ajax_myScribe_json === 'function') {
        unsafeWindow.ajax_myScribe_json = exportFunction(function() {
            var url = "https://interface.dmzj.com/api/subscribe/getSubscribe";
            unsafeWindow.$.ajax(cloneInto({
                type: 'get',
                url: url,
                cache: false,
                dataType: 'jsonp',
                data: "type_id=0",
                timeout: 30000,
                success: function (res) {
                    var html = '';
                    if (!res) {
                        html = '<div class="no_content">你还没有订阅过作品哦</div>';
                        unsafeWindow.$("#scribe_more").hide();
                    }
                    else {
                        unsafeWindow.$("#scribe_more").show();
                        var json = res.slice(0, 8);
                        for (var i = 0; i < json.length; i++) {
                            var is_read = json[i].sub_readed === 0 ? '<span class="subcribe_new"></span>' : '';
                            html += '<li><span class="tip"></span>';
                            html += '<a class="book_title wid" title="' + json[i].sub_name + '" onclick="mark_read(' + json[i].sub_id + ',' + "'" + json[i].sub_type + "'" + ')" href="' + json[i].sub_id_url + '" target="_blank">' + json[i].sub_name + '</a>';
                            html += '';
                            html += '<a class="book_num" title="' + json[i].sub_update + '" onclick="mark_read(' + json[i].sub_id + ',' + "'" + json[i].sub_type + "'" + ')" href="' + json[i].sub_url + '?cid=' + json[i].sub_id + '" target="_blank">' + json[i].sub_update + '</a>';
                            html += is_read + '</li>';
                        }
                    }
                    unsafeWindow.$("#my_scribe_con").html(html);
                }
            }, unsafeWindow, {cloneFunctions: true}));
        }, unsafeWindow);
    }

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
    else if ((/^\/[a-z]+\/\d+\.shtml$/).test(location.pathname)) {

        if ($('a.error-btn').length === 0 || !(/\?cid=[\d+]/).test(location.search)) { return; }

        $.fancybox.defaults.clickSlide = false;
        $.fancybox.defaults.margin = 0;
        $.fancybox.defaults.buttons = ['fullScreen', 'close'];
        $.fancybox.defaults.afterClose = function() {
            location.href = location.href.substr(0, location.href.lastIndexOf('/') + 1);
        };
        $.fancybox.defaults.beforeLoad = function (instance, slide) {
            if (slide.type !== 'image' || !slide.opts.realsrc) { return; }
            GM_xmlhttpRequest({
                method: 'GET',
                url: slide.opts.realsrc,
                headers: {'Referer': 'http://images.dmzj.com/'},
                responseType: 'blob',
                onload: function(res) {
                    if (res.status !== 200) { return; }
                    slide.src = unsafeWindow.URL.createObjectURL(res.response);
                    slide.$image.hide('fast', function () {
                        slide.$slide.empty()
                        instance.setImage(slide);
                        $(this).fadeIn();
                    });
                }
            });
        };
        $.fancybox.defaults.afterLoad = function(instance, slide) {
            if (slide.type !== 'image') { return; }
            unsafeWindow.URL.revokeObjectURL(slide.src);
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
                        src : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAIGNIUk0AAHolAACAgwAA+f8AAIDpAAB1MAAA6mAAADqYAAAXb5JfxUYAAAATSURBVHjaYvj//z8DAAAA//8DAAj8Av7TpXVhAAAAAElFTkSuQmCC',
                        opts : {
                            realsrc : data.page_url[i]
                        }
                    });
                }

                setTimeout(function(){$.fancybox.open(list);}, 500);
            }
        });
    }
})($, unsafeWindow);