const getEl = { id: id => document.getElementById(id) };
const addEL = (el, type, func) => { el.addEventListener(type, func, false); };
const addELs = array => array.map(arr => addEL(...arr));
const header_scroll = getEl.id('click-scroll');
const ex_funcs = ["jpid", "link", "curl", "exls"].reduce((acc, ex_fn_id) => ({/*機能の一覧( 描画設定のチェックボックスと機能の要素のelementを管理する )*/
    ...acc,
    [ex_fn_id]: {
        draw: getEl.id('draw-' + ex_fn_id),
        div: getEl.id(ex_fn_id + '-div')
    }
}), {});
chrome.browserAction && chrome.browserAction.setBadgeText({ text: "" });
chrome.action && chrome.action.setBadgeText({ text: "" });

/*セーブ・ロード*/
const tag_link = getEl.id('tag-link');
const ichiba_tab = getEl.id('ichiba-tab');
const exls_sel = getEl.id("exls-sel");
exls_sel.value = 0;
getEl.id('view-version').innerText = "version-" + chrome.runtime.getManifest().version;
addEL(document, 'DOMContentLoaded', _ => {
    chrome.storage.local.get({
        jpid: true,
        link: true,
        curl: true,
        exls: true,
        exls_sel: 0,
        exlists: [
            { name: "list0", list: [] },
            { name: "list1", list: [] },
            { name: "list2", list: [] },
            { name: "list3", list: [] },
            { name: "list4", list: [] }
        ],
        myid: "",
        qtlist: { name: "", list: [] },
        header_scroll: 2,
        tag_link: true,
        ichiba_tab: true
    },
        items => {
            for (const key in ex_funcs) {
                ex_funcs[key].draw.checked = items[key];
                ex_funcs[key].div.style.display = ex_funcs[key].draw.checked ? "inline" : "none";
                addEL(ex_funcs[key].draw, 'change', e => {
                    chrome.storage.local.set({ [key]: ex_funcs[key].draw.checked });
                    ex_funcs[key].div.style.display = ex_funcs[key].draw.checked ? "inline" : "none";
                    return false;
                });
            }
            for (const key in exls_stat.lists) {
                exls_stat.lists[key] = items.exlists[key];
                getEl.id("exls-sel").appendChild(exlsOpt(key, exls_stat.lists[key].name))
            }
            exls_stat.sel = exls_sel.value = items.exls_sel;
            lname_ipt.value = exls_stat.lists[exls_stat.sel].name;
            getEl.id("exls-opt").style.display = "none";
            for (const el of exls_stat.lists[exls_stat.sel].list) exls_ul.appendChild(exlsLi(el.id, el.label, exls_ul.childElementCount));
            header_scroll.value = items.header_scroll;
            tag_link.checked = items.tag_link;
            ichiba_tab.checked = items.ichiba_tab;
            chrome.tabs.query({ active: true, currentWindow: true }, e => {
                chrome.tabs.sendMessage(e[0].id, { type: 'tag_link', tag_link: tag_link.checked });
                chrome.tabs.sendMessage(e[0].id, { type: 'ichiba_tab', ichiba_tab: ichiba_tab.checked });
                const which = url_to_id_sv(e[0].url);
                let myid = items.myid;
                const amazon_pattern = /(?<=^https{0,1}:\/\/www\.amazon\.(co\.jp|com)\/[^?]+\/)([A-Z]|\d)+(?=.*$)/g;
                let cont_title = e[0].title.match(/(クリップしたイラスト)|(さんのシリーズ)/) ? items.qtlist.name : e[0].title.split(" - ").slice(0, -1).join(" - ");
                apnd_ipt.value = e[0].url.match(/^https?:\/\/.+\.nicovideo\.jp/) && which.sv !== "another" ? which.id[0] + (e[0].title.split(" - ").length > 1 ? "~" : "") + cont_title : "";
                if (!apnd_ipt.value && e[0].url.match(amazon_pattern)) apnd_ipt.value = "az" + e[0].url.match(amazon_pattern) + "~" + e[0].title.split(" | ").slice(0, -4).join(" | ");
                getEl.id("exls-qt-btn").style.display =
                    (which.sv === "mylist" || which.sv === "clip" || which.sv === "series" || which.sv === "user-v" || e[0].url.match(/^https?:\/\/seiga\.nicovideo\.jp\/my\/clip/)) && !e[0].url.match(/garage/) ? "inline-block" : "none";
                getEl.id("url-cp").value = (url =>
                    url.match(/^https?:\/\/[^q]+\.nicovideo\.jp/) && which.sv !== "another" && which.sv !== "clip" ? "https://nico.ms/" + which.id[0] :
                        [
                            ...[
                                { reg: amazon_pattern, url: ["https://nico.ms/az", ""] },
                                { reg: /(?<=^https?:\/\/www\.youtube\.com\/watch\?.*v\=)([a-zA-Z]|-|_|\d)+(?=.*$)/g, url: ["https://youtu.be/", ""] },
                                { reg: /(?<=^https?:\/\/www\.nicovideo\.jp\/my.*)/g, url: [myid ? "https://nico.ms/user/" : "https://www.nicovideo.jp/my/", myid] },
                                { reg: /(?<=^https?:\/\/seiga\.nicovideo\.jp\/my\/)clip\/\d+/g, url: ["https://seiga.nicovideo.jp/", ""] }
                            ].map(l => url.match(l.reg) ? l.url.join(url.match(l.reg)[0]) : 0),
                            url
                        ].filter(_ => _)[0]
                )(e[0].url);
            });
        }
    );
    addELs([
        [exls_sel, _ => { chrome.storage.local.set({ exls_sel: exls_sel.value }); exls_dis_reset(); reload_canvas(); }],
        [header_scroll, _ => chrome.storage.local.set({ header_scroll: header_scroll.value })],
        [tag_link, _ => {
            chrome.storage.local.set({ tag_link: tag_link.checked });
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => chrome.tabs.sendMessage(tabs[0].id, { type: 'tag_link', tag_link: tag_link.checked }));
        }],
        [ichiba_tab, _ => {
            chrome.storage.local.set({ ichiba_tab: ichiba_tab.checked });
            chrome.tabs.query({ active: true, currentWindow: true }, tabs => chrome.tabs.sendMessage(tabs[0].id, { type: 'ichiba_tab', ichiba_tab: ichiba_tab.checked }));
        }]
    ].map(arr => [arr[0], "change", arr[1]]));
});
/*ExList--{*/
const exls_ul = getEl.id("exls-ul");
const apnd_ipt = getEl.id("myls-apnd-ipt");
const lname_ipt = getEl.id("myls-lname-ipt");
const exls_canvas = getEl.id("exls-canvas");
const exls_ctx = exls_canvas.getContext("2d");
const exls_svimg = getEl.id("exls-save-img");
let is_exls_editing = 0;
let is_exls_optopen = 0;
let is_exls_imgload = 0;
const exls_stat = {
    sel: 0,
    lists: [
        { name: "", list: [] },
        { name: "", list: [] },
        { name: "", list: [] },
        { name: "", list: [] },
        { name: "", list: [] }
    ]
};
addEL(getEl.id("open-nc-page"), "click", () => window.open(`https://www.nicovideo.jp/my/mylist/ex${exls_stat.sel}`));
const exlsLi = (id, text, key) => {
    const li_el = document.createElement("li");
    li_el.className = "exls-" + ncids.filter(ncid => id.match(ncid.reg))[0].name;
    li_el.title = id;
    li_el.innerText = text;
    addEL(li_el, "click", _ => {
        if (!is_exls_editing) {
            id_jump(id);
        } else {
            del_exls(key);
            li_el.remove();
        }
    });
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
    exls_ul.appendChild(exlsLi(apnd_obj.id, apnd_obj.label, exls_ul.childElementCount));
    exls_stat.lists[exls_stat.sel].list.push({ ...apnd_obj });
    chrome.storage.local.set({ exlists: exls_stat.lists });
};
const del_exls = num => {
    exls_stat.lists[exls_stat.sel].list.splice(num, 1);
    chrome.storage.local.set({ exlists: exls_stat.lists });
    exls_dis_reset()
}
//canvas
const split_chars = ["e01a", "e01b", "e020"].map(c => String.fromCharCode(parseInt(c, 16)));
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
        + "El001*"
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
    exls_svimg.style.height = "";
    exls_svimg.onload = _ => {
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
                    if (l.split(split_chars[2]).length === 2) add_exls(...l.split(split_chars[2]));
                });
            } else {
                console.log("規格外の画像が読み込まれました");
            }
            is_exls_imgload = 0;
        }
    };
};
exls_svimg.ondragover = getEl.id("exls-ld-ipt").onmouseleave = getEl.id("exls-ld-ipt").ondragleave = e => {
    getEl.id("exls-ld-ipt").style.display = e.type == "dragover" ? "block" : "none";
}
ncids.map(cate => (sheet => {
    sheet.insertRule(`.exls-${cate.name}{background:linear-gradient(to right,${cate.color},#353535 20%,#353535);}`, sheet.cssRules.length);
    sheet.insertRule(`.exls-${cate.name}::before{content:"${cate.text}";font-size:${36 / cate.text.length}px;}`, sheet.cssRules.length);
})([...document.styleSheets].slice(-1)[0]));
addELs([/*EventListeners*/
    [getEl.id("myls-apnd-btn"), "click", _ => {
        if (split_chars.filter(f => ~apnd_ipt.value.indexOf(f)).length === 0) {
            if (apnd_ipt.value) add_exls(...(v => [v[0], v.slice(1).join("~") ? v.slice(1).join("~") : v[0]])(apnd_ipt.value.split("~")));
            apnd_ipt.value = "";
            reload_canvas();
        }
    }],
    [apnd_ipt, "keydown", e => {
        if (e.keyCode == 13) getEl.id("myls-apnd-btn").click();
    }],
    [getEl.id("myls-lname-btn"), "click", _ => {
        change_lname(lname_ipt.value);
        reload_canvas();
    }],
    [lname_ipt, "keydown", e => {
        if (e.keyCode == 13) getEl.id("myls-lname-btn").click();
    }],
    [getEl.id("exls-edt-btn"), "click", _ => {
        is_exls_editing ^= 1;
        getEl.id("exls-edt-btn").innerText = is_exls_editing ? "Quit" : "Del";
        exls_ul.style.background = is_exls_editing ? "linear-gradient(to right, #f00, #252525)" : "#252525";
    }],
    [getEl.id("exls-opt-btn"), "click", _ => {
        is_exls_optopen ^= 1;
        getEl.id("exls-opt-btn").innerText = is_exls_optopen ? "Exit" : "Opt";
        exls_ul.style.display = is_exls_optopen ? "none" : "";
        getEl.id("exls-opt").style.display = is_exls_optopen ? "" : "none";
        if (is_exls_optopen) reload_canvas();
    }],
    [getEl.id("exls-ld-ipt"), "change", e => {
        let r = new FileReader();
        r.readAsDataURL(e.target.files[0]);
        is_exls_imgload = 1
        r.onload = _ => load_exls(r.result);
        getEl.id("exls-ld-ipt").value = "";
    }],
    [getEl.id("exls-qt-btn"), "click", _ => {
        chrome.storage.local.get({ qtlist: { name: "", list: [] } }, item => {
            if (item.qtlist.name) {
                exls_stat.lists[exls_stat.sel].list = [...exls_stat.lists[exls_stat.sel].list, ...item.qtlist.list];
                chrome.storage.local.set({ exlists: exls_stat.lists });
                exls_dis_reset();
                reload_canvas();
                lname_ipt.value = item.qtlist.name;
            }
        });
    }],
    [getEl.id("exls-cl-btn"), "click", _ => {
        if (confirm("リスト内容をすべて削除します")) {
            exls_stat.lists[exls_stat.sel].list = [];
            chrome.storage.local.set({ exlists: exls_stat.lists });
            exls_dis_reset();
            reload_canvas();
        }
    }]
]);
/*}--ExList*/
addELs([
    [getEl.id('url-cp-btn'), "click", _ => {
        getEl.id('url-cp').select();
        document.execCommand("copy");
    }],
    [getEl.id('id-jmp-btn'), "click", _ => id_jump(getEl.id('id-jmp-ipt').value)],
    [getEl.id('id-jmp-ipt'), 'keydown', e => {
        if (e.keyCode == 13) getEl.id('id-jmp-btn').click();
    }],
    [getEl.id("exls-det"), "toggle", _ => getEl.id("exls-sum").innerText = getEl.id("exls-det").open ? "▼" : "▶"],
    [getEl.id("config-det"), "toggle", _ => getEl.id("config-sum").innerText = getEl.id("config-det").open ? "▼" : "▶"]
]);
addELs([
    { el: getEl.id('keyword-nico'), arg: ["https://nicovideo.jp/search/", "v-key"] },
    { el: getEl.id('tag-nico'), arg: ["https://nicovideo.jp/tag/", "v-tag"] },
    { el: getEl.id('dic-nico'), arg: ["https://dic.nicovideo.jp/", "dic"] }
].map(s => [s.el, "click", _ => searcher_nico(...s.arg)]));
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
getEl.id("jpid-div").title = `対応ページ->
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
getEl.id("link-div").title = `Google,YouTubeの検索から引用して
ニコニコ動画の検索や大百科へジャンプ
非対応のページではURL最後の"/"以降の文字列を使用`;
getEl.id("curl-div").title = `ニコニコ動画,静画,生放送など=>nico.msで短縮
ニコニコQ=>短縮不可
Amazon=>nico.msで短縮(ニコニコ市場URL)
YouTube=>youtu.beで短縮`;