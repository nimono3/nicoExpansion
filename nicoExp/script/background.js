const xmlobj = xml => ({ xml: xml, getobj: tag_name => xmlobj(xml.match((new RegExp(`<${tag_name}( [^>]+=".*")*>[^]+<\/${tag_name}>`, 'g')) || [])[0] || ""), get: tag_name => ((xml.match(new RegExp(`>[^<]+<\/${tag_name}>`, 'g')) || [])[0] || "").slice(1, (tag_name.length + 3) * -1), attr: at_name => ((xml.match(new RegExp(`${at_name}=("|').*("|')`, 'g')) || [])[0] || "\"").split('=')[1].slice(1, -1) });
function douga_request(douga_id, obj_name, trial) {
    fetch("https://ext.nicovideo.jp/api/getthumbinfo/" + douga_id, { method: 'GET' })
        .then(res => { return res.ok ? res.text() : null; })
        .then(restext => {
            if (trial > 5) { console.log("get video error at:" + douga_id); return; }
            if (!restext) chrome.runtime.sendMessage({ type: "get", mode: "douga", media_id: douga_id, obj_name: obj_name, trial: trial + 1 });
            const resxml = xmlobj(restext);
            if (resxml.getobj("nicovideo_thumb_response").attr("status").toLowerCase() === "ok") {
                chrome.tabs.query({ active: true, currentWindow: true }, e => {
                    e[0] && chrome.tabs.sendMessage(e[0].id, {
                        type: "res", mode: "douga", status: "success",
                        title: resxml.get("title"),
                        thumbnail: resxml.get("thumbnail_url"),
                        description: resxml.get("description"),
                        firetri: resxml.get("first_retrieve"),
                        length: resxml.get("length"),
                        counters: {
                            view: resxml.get("view_counter"),
                            comment: resxml.get("comment_num"),
                            mylist: resxml.get("mylist_counter")
                        },
                        obj_name: obj_name
                    });
                });
                return;
            } else {
                if (resxml.get("code") === "DELETED") {
                    chrome.tabs.query({ active: true, currentWindow: true }, e => {
                        e[0] && chrome.tabs.sendMessage(e[0].id, {
                            type: "res", mode: "douga", status: "success",
                            title: "deleted", thumbnail: "",
                            description: "", firetri: "",
                            length: "0:00",
                            counters: { view: "0", comment: "0", mylist: "0" },
                            obj_name: obj_name
                        });
                    });
                }
                return;
            }
        });
}
function seiga_request(seiga_id, obj_name, trial) {
    fetch("https://seiga.nicovideo.jp/api/illust/info?id=" + seiga_id.slice(2), { method: 'GET' })
        .then(res => { return res.ok ? res.text() : null; })
        .then(restext => {
            if (trial > 5) { console.log("get seiga error. at:" + seiga_id); return; }
            if (!restext) chrome.runtime.sendMessage({ type: "get", mode: "seiga", media_id: douga_id, obj_name: obj_name, trial: trial + 1 });
            const resxml = xmlobj(restext);
            chrome.tabs.query({ active: true, currentWindow: true }, e => {
                e[0] && chrome.tabs.sendMessage(e[0].id, {
                    type: "res", mode: "seiga", status: "success",
                    title: resxml.get("title"),
                    thumbnail: resxml.get("thumbnail_url"),
                    description: resxml.get("description"),
                    created: resxml.get("created"),
                    counters: {
                        view: resxml.get("view_count"),
                        comment: resxml.get("comment_count"),
                        clip: resxml.get("clip_count")
                    },
                    obj_name: obj_name
                });
            });
        });
}
chrome.runtime.onMessage.addListener((m, _, sendRes) => {
    if (m.type === "get") {
        m.mode === "douga" && douga_request(m.media_id, m.obj_name, m.trial);
        m.mode === "seiga" && seiga_request(m.media_id, m.obj_name, m.trial);
    } else if (m.type === "notice") {
        if (m.mode === "append") {
            const colorseed = Array.from(("0" + [5, 7, 11, 15, 19, 21][(m.seed || 0) % 6].toString(3)).slice(-3)).map(s => parseInt(s, 10) * 127);
            if (chrome.browserAction) {
                chrome.browserAction.setBadgeText({ text: " " });
                chrome.browserAction.setBadgeBackgroundColor({ color: [...colorseed, 100] });
            } else if (chrome.action) {
                chrome.action.setBadgeText({ text: " " });
                chrome.action.setBadgeBackgroundColor({ color: [...colorseed, 100] });
            }
        } else if (m.mode === "remove") {
            chrome.browserAction && chrome.browserAction.setBadgeText({ text: "" });
            chrome.action && chrome.action.setBadgeText({ text: "" });
        }
    } else if (m.type === "ctxMenuEnabled") {
        chrome.contextMenus.update(m.id, { enabled: true });
    } else if (m.type === "ctxMenuDisabled") {
        chrome.contextMenus.update(m.id, { enabled: false });
    } else if (m.type === "renameMenu") {
        chrome.contextMenus.update(m.id, { title: m.title || "" });
    }
    sendRes();
    return !0;
});
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({ id: "apndExls", title: decodeURI("%E6%8B%A1%E5%BC%B5%E3%83%9E%E3%82%A4%E3%83%AA%E3%82%B9%E3%83%88"), contexts: ["link"] });
    chrome.contextMenus.create({ id: "apndExls-0", parentId: "apndExls", title: "list0", contexts: ["link"] });
    chrome.contextMenus.create({ id: "apndExls-1", parentId: "apndExls", title: "list1", contexts: ["link"] });
    chrome.contextMenus.create({ id: "apndExls-2", parentId: "apndExls", title: "list2", contexts: ["link"] });
    chrome.contextMenus.create({ id: "apndExls-3", parentId: "apndExls", title: "list3", contexts: ["link"] });
    chrome.contextMenus.create({ id: "apndExls-4", parentId: "apndExls", title: "list4", contexts: ["link"] });
    chrome.contextMenus.update("apndExls", { documentUrlPatterns: ["*://*.nicovideo.jp/*"] });
    chrome.contextMenus.update("apndExls", { targetUrlPatterns: ["*://*.nicovideo.jp/*", "*://nico.ms/*"] });
    chrome.storage.local.get({ exlists: [...Array(5).keys()].map(i => ({ name: "list" + i, list: [] })) }, item => {
        item.exlists.map((ex, i) => chrome.contextMenus.update("apndExls-" + i, { title: ex.name }));
    });
});
chrome.contextMenus.onClicked.addListener((menu, tab) => {
    if (menu.menuItemId.match(/apndExls-\d+/)) {
        if (tab.url.match(/^https?:\/\/.*\.nicovideo\.jp\/.*/)) {
            console.log(menu);
            chrome.tabs.sendMessage(tab.id, { type: "apndExls", index: menu.menuItemId.replace(/apndExls-/g, ""), conturl: menu.linkUrl, contlabel: "" });
        }
    }
});