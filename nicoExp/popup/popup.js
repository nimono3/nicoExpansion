const cs = document.getElementById('click-scroll');
const tag_link = document.getElementById('tag-link');
const exls_sel = document.getElementById("exls-sel");
const split_chars = ["e01a", "e01b", "e020"].map(c => String.fromCharCode(parseInt(c, 16)));
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
const lname_ipt = document.getElementById("myls-lname-ipt");
const exls_canvas = document.getElementById("exls-canvas");
const exls_ctx = exls_canvas.getContext("2d");
const exls_svimg = document.getElementById("exls-save-img");
let is_exls_editing = 0;
let is_exls_optopen = 0;
let is_exls_imgload = 0;
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
    { reg: /(sm|nm|so)\d+/g, url: ["https://www.nicovideo.jp/watch/", "?ref=nicoExp"], name: "douga", color: "#8D8D8D", text: "動画" },
    { reg: /(im)\d+/g, url: ["https://seiga.nicovideo.jp/seiga/", "?track=nicoExp&ref=nicoExp"], name: "seiga", color: "#E3AA3F", text: "静画" },
    { reg: /(mg)\d+/g, url: ["https://seiga.nicovideo.jp/watch/", "?ref=nicoExp"], name: "manga", color: "#88C148", text: "漫画" },
    { reg: /(sg|bk)\d+/g, url: ["https://seiga.nicovideo.jp/watch/", "?ref=nicoExp"], name: "other", color: "#000", text: "その他" },//お題|書籍
    { reg: /(lv)\d+/g, url: ["https://live.nicovideo.jp/watch/", "?ref=nicoExp"], name: "live", color: "#0af", text: "生放送" },
    { reg: /(co)\d+/g, url: ["https://com.nicovideo.jp/community/", ""], name: "community", color: "#258D8D", text: "コミュ" },
    { reg: /(ch)\d+/g, url: ["https://ch.nicovideo.jp/channel/", ""], name: "channel", color: "#0af", text: "チャン" },
    { reg: /(ar)\d+/g, url: ["https://ch.nicovideo.jp/article/", ""], name: "channel", color: "#0af", text: "チャン" },
    { reg: /(nd)\d+/g, url: ["https://chokuhan.nicovideo.jp/products/detail/", ""], name: "other", color: "#000", text: "その他" },//直販
    { reg: /((az([0-9]|[A-Z])+)|((ys|ggbo).+)|((dw|it)\d+))/g, url: ["https://ichiba.nicovideo.jp/item/", ""], name: "ichiba", color: "#FF9900", text: "市場" },
    { reg: /(ap)\d+/g, url: ["https://app.nicovideo.jp/app/", "?track=nicoExp"], name: "app", color: "#0a0", text: "アプリ" },
    { reg: /(jk)\d+/g, url: ["https://jk.nicovideo.jp/watch/", ""], name: "jikkyou", color: "#d00", text: "実況" },
    { reg: /(nc)\d+/g, url: ["https://commons.nicovideo.jp/material/", "?transit_from=nicoExp"], name: "commons", color: "#B091C5", text: "コモンズ" },
    { reg: /(nw)\d+/g, url: ["https://news.nicovideo.jp/watch/", "?news_ref=nicoExp"], name: "news", color: "#ff8000", text: "ニュース" },
    { reg: /(?<=dic\/)\d+/g, url: ["https://dic.nicovideo.jp/id/", ""], name: "dic", color: "#d00", text: "百科" },/*大百科メモ:単語[a],動画[v],生放送[l],コミュニティ[c],ユーザー[u](t/はスマホ記事)*/
    { reg: /mylist\/\d+/g, url: ["https://www.nicovideo.jp/", ""], name: "mylist", color: "#d0f", text: "マイリス" },
    { reg: /user\/\d+/g, url: ["https://www.nicovideo.jp/", ""], name: "user", color: "#00f", text: "ユーザー" },
    { reg: /(gm)\d+/g, url: ["https://game.nicovideo.jp/atsumaru/games/", "?link_in=nicoExp"], name: "game", color: "#0a0", text: "ゲーム" },
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
const change_lname = val => {
    if (val && split_chars.filter(f => ~val.indexOf(f)).length === 0) {
        lname_ipt.value = val;
        exls_sel.options[exls_sel.value - 0].label = val;
        exls_stat.lists[exls_stat.sel].name = val;
        chrome.storage.local.set({ exlists: exls_stat.lists });
    }
};
const exls_dis_reset = () => {
    [...exls_ul.children].map(e => e.remove());
    exls_stat.sel = exls_sel.value - 0;
    lname_ipt.value = exls_stat.lists[exls_stat.sel].name;
    for (const el of exls_stat.lists[exls_stat.sel].list) exls_ul.appendChild(exlsLi(el.id, el.label, exls_ul.childElementCount));
};
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
//canvas
const str_to_code = str => (str.split('').map(s => ("0000" + s.charCodeAt().toString(16)).slice(-4)).join(''));
const code_to_image = code => (s => {
    let arr = [];
    for (let i = 0; i < s.length; i += 6) {
        arr.push((s.substr(i, 6) + "00000").substr(0, 6));
    }
    return arr;
})(code.split('').reduce((acc, v) =>
    [...acc, ...[Math.floor(parseInt(v, 16) / 4), parseInt(v, 16) % 4].map(i => ("0" + (i * 85).toString(16)).slice(-2))], []).join('')
);
const image_to_code = img => {
    let arr = img;
    let str = "";
    for (let i = 0; i < arr.length; i += 1) {
        str += ("0" + Math.floor(arr[i] / 64).toString(2)).slice(-2);
    }
    let nstr = "";
    for (let i = 0; i < str.length; i += 4) {
        nstr += parseInt((str + "0000").substr(i, 4), 2).toString(16);
    }
    return nstr;
};
const code_to_str = code => {
    str = "";
    for (let i = 0; i < code.length; i += 4) {
        str += String.fromCharCode(parseInt((code + "00000").substr(i, 4), 16));
    }
    return str;
};
const reload_canvas = () => {
    let img = code_to_image(str_to_code(
        exls_stat.lists[exls_stat.sel].name
        + split_chars[0]
        + exls_stat.lists[exls_stat.sel].list.map(l => l.id + split_chars[2] + l.label).join(split_chars[1])
        + split_chars[0]
        + "El000*"
    )).join('');
    exls_canvas.width = 200;
    exls_canvas.height = Math.max(Math.ceil(img.length / 6 / exls_canvas.width), 4);

    let imgd = exls_ctx.getImageData(0, 0, exls_canvas.width, exls_canvas.height);
    let pix = imgd.data;

    [...pix].map((_, i) => pix[i] = (i % 4 != 3 ? parseInt("00" + img.substr((i - Math.floor(i / 4)) * 2, 2), 16) + 0 : 255));
    [...pix].map((_, i) => i % 4 != 3 ? parseInt("00" + img.substr((i - Math.floor(i / 4)) * 2, 2), 16) + 0 : 255)
    exls_ctx.putImageData(imgd, 0, 0);

    exls_svimg.src = exls_canvas.toDataURL();
};
const load_exls = url => {
    exls_svimg.src = url;
    is_exls_imgload = 1;
    exls_svimg.onload = () => {
        if (is_exls_imgload) {
            exls_canvas.height = Math.round(exls_svimg.naturalHeight * 200 / exls_svimg.naturalWidth);
            exls_ctx.drawImage(exls_svimg, 0, 0, 200, Math.round(exls_svimg.naturalHeight * 200 / exls_svimg.naturalWidth));

            let imgd = exls_ctx.getImageData(0, 0, exls_canvas.width, exls_canvas.height);
            let pix = imgd.data;
            let img = [...pix].map((c, i) => i % 4 != 3 ? c : "x").filter(v => v != "x");
            let str = code_to_str(image_to_code(img));
            let [meta, stat] = (splited => { return [splited.slice(-1)[0], { name: splited[0], list: splited.slice(1, -1).join(split_chars[0]).split(split_chars[1]) }]; })(str.split(split_chars[0]));
            console.log("original: ", str, "meta: ", meta, "stat: ", stat);

            if (meta.match(/^El\d+\*.*/)) {
                change_lname(stat.name);
                exls_stat.lists[exls_stat.sel].list = [];
                for (let i = 0; i < exls_ul.children.length; i++) del_exls(0);
                stat.list.map(l => {
                    add_exls(...l.split(split_chars[2]));
                });
            } else {
                console.log("規格外の画像が読み込まれました");
            }
            is_exls_imgload = 0;
        }
    };
};
exls_svimg.ondragover = document.getElementById("exls-ld-ipt").onmouseleave = document.getElementById("exls-ld-ipt").ondragleave = e => {
    document.getElementById("exls-ld-ipt").style.display = e.type == "dragover" ? "block" : "none";
}
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
        myid: "",
        qtlist: { name: "", list: [] },
        click_scroll: 2,
        tag_link: true
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
            lname_ipt.value = exls_stat.lists[exls_stat.sel].name;
            document.getElementById("exls-opt").style.display = "none";
            for (const el of exls_stat.lists[exls_stat.sel].list) exls_ul.appendChild(exlsLi(el.id, el.label, exls_ul.childElementCount));
            cs.value = items.click_scroll;
            tag_link.checked = items.tag_link;
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => chrome.tabs.sendMessage(tabs[0].id, { type: 'tag_link', tag_link: tag_link.checked }));
            chrome.tabs.query({ active: true, currentWindow: true }, e => {
                const which = url_to_id_sv(e[0].url);
                let myid = items.myid;
                apnd_ipt.value = e[0].url.match(/^https{0,1}:\/\/.+\.nicovideo\.jp/) && which.sv !== "another" ? which.id[0] + "~" + e[0].title.split(" - ").slice(0, -1).join(" - ") : "";
                document.getElementById("exls-qt-btn").style.display = which.sv === "mylist" ? "inline-block" : "none";
                document.getElementById("url-cp").value = (url =>
                    url.match(/^https{0,1}:\/\/[^q]+\.nicovideo\.jp/) && which.sv !== "another" ? "https://nico.ms/" + which.id[0] :
                        [
                            ...[
                                { reg: /(?<=^https{0,1}:\/\/www\.amazon\.(co\.jp|com)\/dp\/)([A-Z]|\d)+(?=.*$)/g, url: ["https://nico.ms/az", ""] },
                                { reg: /(?<=^https{0,1}:\/\/www\.youtube\.com\/watch\?.*v\=)([a-zA-Z]|-|_|\d)+(?=.*$)/g, url: ["https://youtu.be/", ""] },
                                { reg: /(?<=^https{0,1}:\/\/www\.nicovideo\.jp\/my.*)/g, url: [myid ? "https://nico.ms/user/" : "https://www.nicovideo.jp/my/", myid] }
                            ].map(l => url.match(l.reg) ? l.url.join(url.match(l.reg)[0]) : 0),
                            url
                        ].filter(_ => _)[0]
                )(e[0].url);
            });
        }
    );
    exls_sel.addEventListener('change', () => { exls_dis_reset(); reload_canvas(); });
    cs.addEventListener('change', () => {
        chrome.storage.local.set({ click_scroll: cs.value });
        return false;
    });
    tag_link.addEventListener('change', () => {
        chrome.storage.local.set({ tag_link: tag_link.checked });
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => chrome.tabs.sendMessage(tabs[0].id, { type: 'tag_link', tag_link: tag_link.checked }));
        return false;
    });
});
//==========================================================================
document.getElementById('url-cp-btn').onclick = () => {
    document.getElementById('url-cp').select();
    document.execCommand("copy");
}
document.getElementById('id-jmp-btn').onclick = () => id_jump(document.getElementById('id-jmp-ipt').value);
document.getElementById('id-jmp-ipt').addEventListener('keydown', e => {
    if (e.keyCode == 13) document.getElementById('id-jmp-btn').click();
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
YouTube=>youtu.beで短縮`;

document.getElementById('keyword-nico').onclick = () => searcher_nico("https://nicovideo.jp/search/", "v-key");
document.getElementById('tag-nico').onclick = () => searcher_nico("https://nicovideo.jp/tag/", "v-tag");
document.getElementById('dic-nico').onclick = () => searcher_nico("https://dic.nicovideo.jp/", "dic");
function searcher_nico(link_parts, mode) {
    chrome.tabs.query({ active: true, currentWindow: true }, e => {
        const act_url = e[0].url;
        const act_host = act_url.split('/')[2];
        let search_word = "";
        if (act_host == "www.google.com" | act_host == "www.google.co.jp") {
            search_word = new URLSearchParams(act_url.slice(act_url.indexOf('?'))).get("q");
        } else if (act_host == "www.youtube.com") {
            search_word = new URLSearchParams(act_url.slice(act_url.indexOf('?'))).get("search_query");
        } else {
            search_word = (new URLSearchParams(act_url.split('/').pop().split('?')[0]) + []).slice(0, -1);
        }
        if (mode == "dic") {
            if (url_to_id_sv(search_word) == "video") {
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
document.getElementById("myls-apnd-btn").addEventListener("click", () => {
    if (split_chars.filter(f => ~apnd_ipt.value.indexOf(f)).length === 0) {
        if (apnd_ipt.value) add_exls(...(v => [v[0], v.slice(1).join("~") ? v.slice(1).join("~") : v[0]])(apnd_ipt.value.split("~")));
        apnd_ipt.value = "";
        reload_canvas();
    }
});
apnd_ipt.addEventListener("keydown", e => {
    if (e.keyCode == 13) {
        document.getElementById("myls-apnd-btn").click();
    }
});
document.getElementById("myls-lname-btn").addEventListener("click", e => {
    change_lname(lname_ipt.value);
    reload_canvas();
});
lname_ipt.addEventListener("keydown", e => {
    if (e.keyCode == 13) {
        document.getElementById("myls-lname-btn").click();
    }
});
document.getElementById("exls-edt-btn").addEventListener("click", e => {
    is_exls_editing ^= 1;
    document.getElementById("exls-edt-btn").innerText = is_exls_editing ? "Quit" : "Del";
    exls_ul.style.background = is_exls_editing ? "linear-gradient(to right, #f00, #252525)" : "#252525";
});
document.getElementById("exls-opt-btn").addEventListener("click", e => {
    is_exls_optopen ^= 1;
    document.getElementById("exls-opt-btn").innerText = is_exls_optopen ? "Exit" : "Opt";
    exls_ul.style.display = is_exls_optopen ? "none" : "";
    document.getElementById("exls-opt").style.display = is_exls_optopen ? "" : "none";
    if (is_exls_optopen) reload_canvas();
});
document.getElementById("exls-ld-ipt").addEventListener("change", e => {
    let r = new FileReader();
    r.readAsDataURL(e.target.files[0]);
    r.onload = () => {
        load_exls(r.result);
    }
});
document.getElementById("exls-qt-btn").addEventListener("click", e => {
    chrome.storage.local.get({ qtlist: { name: "", list: [] } }, item => {
        if (item.qtlist.name) {
            exls_stat.lists[exls_stat.sel].list = [...exls_stat.lists[exls_stat.sel].list, ...item.qtlist.list];
            chrome.storage.local.set({ exlists: exls_stat.lists });
            exls_dis_reset();
            reload_canvas();
            lname_ipt.value = item.qtlist.name;
        }
    });
});
document.getElementById("exls-cl-btn").addEventListener("click", e => {
    if (confirm("リスト内容をすべて削除します")) {
        exls_stat.lists[exls_stat.sel].list = [];
        chrome.storage.local.set({ exlists: exls_stat.lists });
        exls_dis_reset();
        reload_canvas();
    }
}, false);