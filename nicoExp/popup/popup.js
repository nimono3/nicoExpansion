var cs = document.getElementById('click-scroll');//--------
var dl = document.getElementById('draw-link');//--------
var dj = document.getElementById('draw-jid');//
var ld = document.getElementById('link-div');//--------
var jd = document.getElementById('jid-div');//jump id
var config_sum = document.getElementById("config-sum");

document.getElementById('view-version').innerHTML = "version-" + chrome.runtime.getManifest().version;

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get({
        click_scroll: 2,
        draw_link: true,
        draw_jid: true
    },
        items => {
            cs.value = items.click_scroll;
            dl.checked = items.draw_link;
            dj.checked = items.draw_jid;
            if (dl.checked) {
                ld.style.display = "inline";
            } else {
                ld.style.display = "none";
            }
            if (dj.checked) {
                jd.style.display = "inline";
            } else {
                jd.style.display = "none";
            }
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
                chrome.tabs.sendMessage(tabs[0].id, { type: 'cs', cs_value: cs.value });
            });
        });

    cs.addEventListener('change', e => {
        chrome.storage.sync.set({ click_scroll: cs.value });
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { type: 'cs', cs_value: cs.value });
        });
        return false;
    });
    dl.addEventListener('change', e => {
        chrome.storage.sync.set({ draw_link: dl.checked });
        if (dl.checked) {
            ld.style.display = "inline";
        } else {
            ld.style.display = "none";
        }
        return false;
    });
    dj.addEventListener('change', e => {
        chrome.storage.sync.set({ draw_jid: dj.checked });
        if (dj.checked) {
            jd.style.display = "inline";
        } else {
            jd.style.display = "none";
        }
        return false;
    });
});

//==========================================================================

document.getElementById('id-jump').onclick = function () {
    id_jump(document.getElementById('id-in').value);
}
document.getElementById('id-in').addEventListener('keydown', e => {
    if (e.keyCode == 13) {
        id_jump(document.getElementById('id-in').value);
    }
});
function id_jump(id) {
    var url = id_to_url(id)
    if (~url) {
        window.open(url);
    }
}
function id_to_url(id) {
    for (const i of [
        { reg: /(sm|nm|so)\d+/, url: ["https://www.nicovideo.jp/watch/", "?ref=nicoEx"] },//動画
        { reg: /(im)\d+/, url: ["https://seiga.nicovideo.jp/seiga/", "?track=nicoEx&ref=nicoEx"] },//静画
        { reg: /(sg|mg|bk)\d+/, url: ["https://seiga.nicovideo.jp/watch/", "?ref=nicoEx"] },//お題|漫画|書籍
        { reg: /(lv)\d+/, url: ["https://live.nicovideo.jp/watch/", "?ref=nicoEx"] },//生放送
        { reg: /(co)\d+/, url: ["https://com.nicovideo.jp/community/", ""] },//コミュニティ
        { reg: /(ch)\d+/, url: ["https://ch.nicovideo.jp/channel/", ""] },//チャンネル
        { reg: /(ar)\d+/, url: ["https://ch.nicovideo.jp/article/", ""] },//--
        { reg: /(nd)\d+/, url: ["https://chokuhan.nicovideo.jp/products/detail/", ""] },//直販
        { reg: /((az([0-9]|[A-Z])+)|((ys|ggbo).+)|((dw|it)\d+))/, url: ["https://ichiba.nicovideo.jp/item/", ""] },//Amazon
        { reg: /(ap)\d+/, url: ["https://app.nicovideo.jp/app/", "?track=nicoEx"] },//アプリ
        { reg: /(jk)\d+/, url: ["https://jk.nicovideo.jp/watch/", ""] },//実況
        { reg: /(nc)\d+/, url: ["https://commons.nicovideo.jp/material/", "?transit_from=nicoEx"] },//コモンズ
        { reg: /(nw)\d+/, url: ["https://news.nicovideo.jp/watch/", "?news_ref=nicoEx"] },//ニュース
        { reg: /dic\/\d+/, url: ["https://dic.nicovideo.jp/id/", ""] },//大百科
        { reg: /user\/\d+/, url: ["https://www.nicovideo.jp/", ""] },//ユーザーページ
        { reg: /mylist\/\d+/, url: ["https://www.nicovideo.jp/", ""] },//マイリスト
        { reg: /(gm)\d+/, url: ["https://game.nicovideo.jp/atsumaru/games/", "?link_in=nicoEx"] },//ゲーム
        { reg: /(td)\d+/, url: ["https://3d.nicovideo.jp/works/", ""] },//立体
        { reg: /(nq)\d+/, url: ["https://q.nicovideo.jp/watch/", ""] },//Q
        { reg: /.+/, url: ["https://dic.nicovideo.jp/a/", ""] }//その他:大百科
    ]) {
        if (id.match(i.reg)) return i.url[0] + id + i.url[1];
    }
    return -1;
}

document.getElementById('keyword-nico').onclick = function () {
    searcher_nico("https://nicovideo.jp/search/", "v-key");
}
document.getElementById('tag-nico').onclick = function () {
    searcher_nico("https://nicovideo.jp/tag/", "v-tag");
}
document.getElementById('dic-nico').onclick = function () {
    searcher_nico("https://dic.nicovideo.jp/", "dic");
}
function searcher_nico(link_parts, mode) {
    chrome.tabs.query({ active: true, currentWindow: true }, e => {
        var act_url = e[0].url;
        var act_host = act_url.split('/')[2];
        var search_word = "";
        if (act_host == "www.google.com" | act_host == "www.google.co.jp") {
            search_word = new URLSearchParams(act_url.slice(act_url.indexOf('?'))).get("q");
        } else if (act_host == "www.youtube.com") {
            search_word = new URLSearchParams(act_url.slice(act_url.indexOf('?'))).get("search_query");
        } else {
            search_word = (new URLSearchParams(act_url.split('/').pop().split('?')[0]) + []).slice(0, -1);
        }
        if (mode == "dic") {
            if (search_word.slice(0, 2) == "sm" | search_word.slice(0, 2) == "nm") {
                search_word = "v/" + search_word;
            } else {
                search_word = "a/" + search_word;
            }
        }
        window.open(link_parts + search_word);
    });
}

document.getElementById("config-det").addEventListener("toggle", e => {
    if (document.getElementById("config-det").open) {
        config_sum.innerText = "▼";
    } else {
        config_sum.innerText = "▶";
    }
}, false);