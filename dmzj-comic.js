// ==UserScript==
// @name         DMZJ Comic
// @namespace    http://manhua.dmzj.com/
// @version      0.1
// @description  获取动漫之家被屏蔽的漫画目录，以及在章节链接中加入COMICID
// @author       rainame
// @include      /^http://manhua.dmzj.com/[a-z]+/*$/
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function($) {

    'use strict';

    if (!g_comic_id) { return; }

    if ($('img[src="/css/img/4004.gif"]').length === 0) {
        $('div.cartoon_online_border li a').each(function() {
            this.href += ('?cid=' + g_comic_id);
        });
        return;
    }

    $('div.middleright div.middleright_mr:eq(0) ul.cartoon_online_button').remove();
    $('div.middleright div.middleright_mr:eq(0) div.cartoon_online_border').remove();

    let pagenum = 160;

    GM_xmlhttpRequest({
        method: 'GET',
        url: 'http://v2.api.dmzj.com/comic/' + g_comic_id + '.json?channel=Android&version=2.6.004',
        onload: function(res) {

            if (res.status !== 200) { return; }

            let data = JSON.parse(res.responseText);

            if (!data || !data.chapters) { return; }

            let list = data.chapters[0].data.reverse(), ary = [], chapter;
            for (let i = 0; i < list.length; i++) {
                chapter = list[i];
                ary.push('<li><a title="' + g_comic_name + '-第' + chapter.chapter_title + '" href="/' + g_comic_url + chapter.chapter_id + '.shtml?cid=' + g_comic_id + '"' + ((i === list.length - 1) ? ' class="color_red"' : '') + '>第' + chapter.chapter_title + '</a></li>');
            }

            let maxpage = Math.ceil(list.length / pagenum), button = [], border = [];
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

            $('#last_read_history').after(border.join('')).after(JQButton);
        }
    });
})($);