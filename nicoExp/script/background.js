const xmlobj = xml => ({ xml: xml, getobj: tag_name => xmlobj(xml.match((new RegExp(`<${tag_name}( [^>]+=".*")*>[^]+<\/${tag_name}>`, 'g')) || [])[0] || ""), get: tag_name => ((xml.match(new RegExp(`>[^<]+<\/${tag_name}>`, 'g')) || [])[0] || "").slice(1, (tag_name.length + 3) * -1), attr: at_name => ((xml.match(new RegExp(`${at_name}=("|').*("|')`, 'g')) || [])[0] || "\"").split('=')[1].slice(1, -1) });
function douga_request(douga_id, obj_name, trial) {
    fetch("https://ext.nicovideo.jp/api/getthumbinfo/" + douga_id, { method: 'GET' })
        .then(res => { return res.ok ? res.text() : null; })
        .then(restext => {
            if (!restext && trial < 3) chrome.runtime.sendMessage({ type: "get", mode: "douga", media_id: douga_id, obj_name: obj_name, trial: trial + 1 });
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
            if (!restext && trial < 3) chrome.runtime.sendMessage({ type: "get", mode: "seiga", media_id: douga_id, obj_name: obj_name, trial: trial + 1 });
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
chrome.runtime.onMessage.addListener(m => {
    if (m.type === "get") {
        m.mode === "douga" && douga_request(m.media_id, m.obj_name, m.trial);
        m.mode === "seiga" && seiga_request(m.media_id, m.obj_name);
    } else if (m.type === "notice") {
        if (m.mode === "append") {
            console.log(22);
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
    }
});