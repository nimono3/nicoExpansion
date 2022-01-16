const cs = document.getElementById('click-scroll');
const exls_sel = document.getElementById("exls-sel");
exls_sel.value = 0;
const ex_funcs = ["jpid", "link", "curl", "exls"].reduce((acc, ex_fn_id) => {/*機能の一覧( 描画設定のチェックボックスと機能の要素のelementを管理する )*/
    return {
        ...acc,
        [ex_fn_id]: {
            draw: document.getElementById('draw-' + ex_fn_id),
            div: document.getElementById(ex_fn_id + '-div')
        }
    };
}, {});
const config_sum = document.getElementById("config-sum");/*さんかく*/
const exls_sum = document.getElementById("exls-sum");/*さんかく*/
const exls_ul = document.getElementById("exls-ul");/*拡張マイリス用*/
const apnd_ipt = document.getElementById("myls-apnd-ipt");
let is_exls_editing = 0;
const exls_stat = {
    sel: exls_sel.value - 0,
    lists: [
        { name: "", list: [] },
        { name: "", list: [] },
        { name: "", list: [] },
        { name: "", list: [] },
        { name: "", list: [] }
    ]
};
const ncids = [/*対応作品オブジェクトリスト{reg: id一致, url: [id埋め込み], name: class名などをこれで付ける, color: exls表示時に使用, text: サービス名2~4字 exls用}*/
    { reg: /(sm|nm|so)\d+/g, url: ["https://www.nicovideo.jp/watch/", "?ref=nicoEx"], name: "douga", color: "#8D8D8D", text: "動画" },
    { reg: /(im)\d+/g, url: ["https://seiga.nicovideo.jp/seiga/", "?track=nicoEx&ref=nicoEx"], name: "seiga", color: "#E3AA3F", text: "静画" },
    { reg: /(mg)\d+/g, url: ["https://seiga.nicovideo.jp/watch/", "?ref=nicoEx"], name: "manga", color: "#88C148", text: "漫画" },
    { reg: /(sg|bk)\d+/g, url: ["https://seiga.nicovideo.jp/watch/", "?ref=nicoEx"], name: "other", color: "#000", text: "その他" },//お題|書籍
    { reg: /(lv)\d+/g, url: ["https://live.nicovideo.jp/watch/", "?ref=nicoEx"], name: "live", color: "#0af", text: "生放送" },
    { reg: /(co)\d+/g, url: ["https://com.nicovideo.jp/community/", ""], name: "community", color: "#258D8D", text: "コミュ" },
    { reg: /(ch)\d+/g, url: ["https://ch.nicovideo.jp/channel/", ""], name: "channel", color: "#0af", text: "チャン" },
    { reg: /(ar)\d+/g, url: ["https://ch.nicovideo.jp/article/", ""], name: "channel", color: "#0af", text: "チャン" },
    { reg: /(nd)\d+/g, url: ["https://chokuhan.nicovideo.jp/products/detail/", ""], name: "other", color: "#000", text: "その他" },//直販
    { reg: /((az([0-9]|[A-Z])+)|((ys|ggbo).+)|((dw|it)\d+))/g, url: ["https://ichiba.nicovideo.jp/item/", ""], name: "ichiba", color: "#FF9900", text: "市場" },
    { reg: /(ap)\d+/g, url: ["https://app.nicovideo.jp/app/", "?track=nicoEx"], name: "app", color: "#0a0", text: "アプリ" },
    { reg: /(jk)\d+/g, url: ["https://jk.nicovideo.jp/watch/", ""], name: "jikkyou", color: "#d00", text: "実況" },
    { reg: /(nc)\d+/g, url: ["https://commons.nicovideo.jp/material/", "?transit_from=nicoEx"], name: "commons", color: "#B091C5", text: "コモンズ" },
    { reg: /(nw)\d+/g, url: ["https://news.nicovideo.jp/watch/", "?news_ref=nicoEx"], name: "news", color: "#ff8000", text: "ニュース" },
    { reg: /(?<=dic\/)\d+/g, url: ["https://dic.nicovideo.jp/id/", ""], name: "dic", color: "#d00", text: "百科" },/*大百科メモ:単語[a],動画[v],生放送[l],コミュニティ[c],ユーザー[u](t/はスマホ記事)*/
    { reg: /mylist\/\d+/g, url: ["https://www.nicovideo.jp/", ""], name: "mylist", color: "#d0f", text: "マイリス" },
    { reg: /user\/\d+/g, url: ["https://www.nicovideo.jp/", ""], name: "user", color: "#00f", text: "ユーザー" },
    { reg: /(gm)\d+/g, url: ["https://game.nicovideo.jp/atsumaru/games/", "?link_in=nicoEx"], name: "game", color: "#0a0", text: "ゲーム" },
    { reg: /(td)\d+/g, url: ["https://3d.nicovideo.jp/works/", ""], name: "thrdim", color: "#EC3272", text: "立体" },
    { reg: /(nq)\d+/g, url: ["https://q.nicovideo.jp/watch/", ""], name: "quiz", color: "#da0", text: "クイズ" },
    { reg: /^.+$/g, url: ["https://dic.nicovideo.jp/a/", ""], name: "dic-a", color: "#d00", text: "百科" }
];
const id_jump = id => (url => { if (~url) window.open(url); })(id_to_url(id));
const id_to_url = id => (ret => !!ret ? ret[1].join(ret[0][0]) : -1)(ncids.map(i => [id.match(i.reg), i.url]).filter(_ => _[0])[0]);
const url_to_id_sv = url => ncids.map(i => i.name != "dic-a" ? { id: url.match(i.reg), sv: i.name } : { id: [], sv: "another" }).filter(_ => _.id)[0];
const exlsLi = (id, text, key) => {
    const li_el = document.createElement("li");
    li_el.className = "exls-" + ncids.filter(ncid => id.match(ncid.reg))[0].name;
    li_el.title = id;
    li_el.innerText = text;
    li_el.addEventListener("click", _ => {
        if (!is_exls_editing) {
            id_jump(id);
        } else {
            del_exls(key);
            li_el.remove();
        }
    }, false);
    return li_el;
};
const exlsOpt = (val, lab) => {
    const opt_el = document.createElement("option");
    opt_el.value = val;
    opt_el.label = lab;
    return opt_el;
};
const exls_dis_reset = () => {
    [...exls_ul.children].map(e => e.remove());
    exls_stat.sel = exls_sel.value - 0;
    for (const el of exls_stat.lists[exls_stat.sel].list) exls_ul.appendChild(exlsLi(el.id, el.label, exls_ul.childElementCount));
};
//style
ncids.map(cate => (sheet => {
    sheet.insertRule(`.exls-${cate.name}{background:linear-gradient(to right,${cate.color},#353535 20%,#353535);}`, sheet.cssRules.length);
    sheet.insertRule(`.exls-${cate.name}::before{content:"${cate.text}";font-size:${36 / cate.text.length}px;}`, sheet.cssRules.length);
})([...document.styleSheets].slice(-1)[0]));

/*セーブ・ロード系*/
document.getElementById('view-version').innerText = "version-" + chrome.runtime.getManifest().version;
document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.local.get({
        jpid: true,
        link: true,
        curl: true,
        exls: true,
        exlists: [
            { name: "list0", list: [] },
            { name: "list1", list: [] },
            { name: "list2", list: [] },
            { name: "list3", list: [] },
            { name: "list4", list: [] }
        ],
        click_scroll: 2
    },
        items => {
            for (const key in ex_funcs) {
                ex_funcs[key].draw.checked = items[key];
                ex_funcs[key].div.style.display = ex_funcs[key].draw.checked ? "inline" : "none";
                ex_funcs[key].draw.addEventListener('change', e => {
                    chrome.storage.local.set({ [key]: ex_funcs[key].draw.checked });
                    ex_funcs[key].div.style.display = ex_funcs[key].draw.checked ? "inline" : "none";
                    return false;
                });
            }
            for (const key in exls_stat.lists) {
                exls_stat.lists[key] = items.exlists[key];
                document.getElementById("exls-sel").appendChild(exlsOpt(key, exls_stat.lists[key].name))
            }
            for (const el of exls_stat.lists[exls_stat.sel].list) exls_ul.appendChild(exlsLi(el.id, el.label, exls_ul.childElementCount));
            cs.value = items.click_scroll;
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => chrome.tabs.sendMessage(tabs[0].id, { type: 'cs', cs_value: cs.value }));
        }
    );
    exls_sel.addEventListener('change', () => {
        exls_dis_reset()
    });
    cs.addEventListener('change', () => {
        chrome.storage.local.set({ click_scroll: cs.value });
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => chrome.tabs.sendMessage(tabs[0].id, { type: 'cs', cs_value: cs.value }));
        return false;
    });
    chrome.tabs.query({ active: true, currentWindow: true }, e => {
        const which = url_to_id_sv(e[0].url);
        document.getElementById("myls-apnd-ipt").value = which.sv != "another" ? which.id[0] : "";
        document.getElementById("exls-qt-btn").style.display = which.sv === "mylist" ? "none" : "none";
        document.getElementById("url-cp").value = e[0].url
            .replace(/^(http|https):\/\/www.nicovideo.jp\/$/, "https://nico.ms/")
            .replace(/^(http|https):\/\/[^q]+\.nicovideo\.jp\/.+\/([a-z]{2}\d+).*$/, "https://nico.ms/$2")
            .replace(/^(http|https):\/\/www\.nicovideo\.jp\/(user\/\d+)(?!\/mylist).*$/, "https://nico.ms/$2")
            .replace(/^(http|https):\/\/www\.nicovideo\.jp\/(user\/\d+|my)\/(mylist\/\d+).*$/, "https://nico.ms/$3")
            .replace(/^(http|https):\/\/www\.amazon\.(co\.jp|com)\/dp\/(([A-Z]|\d)+).*$/, "https://nico.ms/az$3")
            .replace(/^https{0,1}:\/\/www\.youtube\.com\/watch\?.*v\=(([a-zA-Z]|-|_|\d)+).*$/, "https://youtu.be/$1");
    });
});
//==========================================================================
document.getElementById('url-cp-btn').onclick = () => {
    document.getElementById('url-cp').select();
    document.execCommand("copy");
}
document.getElementById('id-jmp-btn').onclick = () => id_jump(document.getElementById('id-jmp-ipt').value);
document.getElementById('id-jmp-ipt').addEventListener('keydown', e => {
    if (e.keyCode == 13) id_jump(document.getElementById('id-jmp-ipt').value);
});
document.getElementById("jpid-div").title = `対応ページ->
    ニコニコ動画{sm,nm,so}
    静画{im}_漫画{mg}
    生放送{lv}
    コミュニティ{co}
    チャンネル{ch,ar}
    市場(Amazon){az}
    アプリ{ap}
    実況{jk}
    コモンズ{nc}
    ニュース{nw}
    アツマール{gm}
    立体{td}
    大百科{dic/[ページ番号]}
    ユーザーページ{user/}
    マイリスト{mylist/}
    ニコニコQ{nq}
その他の入力では大百科に飛びます`;
document.getElementById("link-div").title = `Google,YouTubeの検索から引用して
ニコニコ動画の検索や大百科へジャンプ
非対応のページではURL最後の"/"以降の文字列を使用`;
document.getElementById("curl-div").title = `ニコニコ動画,静画,生放送など=>nico.msで短縮
ニコニコQ=>短縮不可
Amazon=>nico.msで短縮(ニコニコ市場URL)
YouTube=>youtu.beで短縮`;/*
document.getElementById("exls-div").title = `マイリストのような機能
動画の他、静画,生放送,コモンズ等に対応`;*/

document.getElementById('keyword-nico').onclick = () => searcher_nico("https://nicovideo.jp/search/", "v-key");
document.getElementById('tag-nico').onclick = () => searcher_nico("https://nicovideo.jp/tag/", "v-tag");
document.getElementById('dic-nico').onclick = () => searcher_nico("https://dic.nicovideo.jp/", "dic");
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
document.getElementById("exls-det").addEventListener("toggle", _ => {
    exls_sum.innerText = document.getElementById("exls-det").open ? "▼" : "▶";
}, false);
document.getElementById("config-det").addEventListener("toggle", _ => {
    config_sum.innerText = document.getElementById("config-det").open ? "▼" : "▶";
}, false);
document.getElementById("myls-apnd-btn").addEventListener("click", e => {
    chrome.tabs.query({ active: true, currentWindow: true }, e => {
        apnd_ipt.value ? add_exls(apnd_ipt.value, (id => id == url_to_id_sv(e[0].url).id[0] ? e[0].title.split(" - ").slice(0, -1).join(" - ") : id)(apnd_ipt.value)) : -1;
        apnd_ipt.value = "";
    });
});
document.getElementById("myls-apnd-ipt").addEventListener("keydown", e => {
    if (e.keyCode == 13) {
        chrome.tabs.query({ active: true, currentWindow: true }, e => {
            apnd_ipt.value ? add_exls(apnd_ipt.value, (id => id == url_to_id_sv(e[0].url).id[0] ? e[0].title.split(" - ").slice(0, -1).join(" - ") : id)(apnd_ipt.value)) : -1;
            apnd_ipt.value = "";
        });
    }
});
document.getElementById("exls-edt-btn").addEventListener("click", e => {
    is_exls_editing ^= 1;
    document.getElementById("exls-edt-btn").innerText = is_exls_editing ? "Quit" : "Delete";
    exls_ul.style.background = is_exls_editing ? "linear-gradient(to right, #f00, #252525)" : "#252525";
});
document.getElementById("exls-qt-btn").addEventListener("click", e => {/*popupから直接ページを読み取ろうとして失敗
    [...document.getElementsByClassName('NC-MediaObject-contents')].map(l => l.href.split("/").pop()).reduce((acc, val, idx) =>
        [...acc, { id: val, label: [...document.getElementsByClassName('NC-MediaObjectTitle')].map(l => l.innerHTML)[idx] }]
        , []
    ).map(qts => console.log(qts.id, qts.label));*/
});
const add_exls = (id, label) => {
    const apnd_obj = { id, label };
    if (exls_stat.lists[exls_stat.sel].list.length <= 100) {
        exls_ul.appendChild(exlsLi(apnd_obj.id, apnd_obj.label, exls_ul.childElementCount));
        exls_stat.lists[exls_stat.sel].list.push({ ...apnd_obj });
        chrome.storage.local.set({ exlists: exls_stat.lists });
    }
};
const del_exls = num => {
    exls_stat.lists[exls_stat.sel].list.splice(num, 1);
    chrome.storage.local.set({ exlists: exls_stat.lists });
    exls_dis_reset()
}