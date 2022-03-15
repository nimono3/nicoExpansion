const xmlobj = xml => ({ xml: xml, getobj: tag_name => xmlobj(xml.getElementsByTagName(tag_name)[0]), get: tag_name => xml.getElementsByTagName(tag_name)[0].textContent, attr: at_name => xml.getAttribute(at_name) });
function douga_request(douga_id, obj_name) {
    const douga_xhr = new XMLHttpRequest();
    douga_xhr.open('GET', "https://ext.nicovideo.jp/api/getthumbinfo/" + douga_id);
    douga_xhr.onreadystatechange = () => {
        if (douga_xhr.readyState === 4) {
            if (douga_xhr.status === 304 || 200 <= douga_xhr.status && douga_xhr.status < 300) {
                const resxml = xmlobj(douga_xhr.responseXML);
                if (resxml.getobj("nicovideo_thumb_response").attr("status").toLowerCase() === "ok") {
                    chrome.tabs.query({ active: true, currentWindow: true }, e => {
                        e[0] && chrome.tabs.sendMessage(e[0].id, {
                            type: "resdouga", status: "success",
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
                }
            }
            console.log("fail");
            chrome.tabs.query({ active: true, currentWindow: true }, e => {
                e[0] && chrome.tabs.sendMessage(e[0].id, { type: "resdouga", status: "fail", obj_name: obj_name });
            });
        }
        return;
    };
    douga_xhr.send();
}
function seiga_request(seiga_id, obj_name) {
    const seiga_xhr = new XMLHttpRequest();
    seiga_xhr.open('GET', "https://seiga.nicovideo.jp/api/illust/info?id=" + seiga_id.slice(2));
    seiga_xhr.onreadystatechange = () => {
        if (seiga_xhr.readyState === 4) {
            if (seiga_xhr.status === 200) {
                const resxml = xmlobj(seiga_xhr.responseXML);
                chrome.tabs.query({ active: true, currentWindow: true }, e => {
                    e[0] && chrome.tabs.sendMessage(e[0].id, {
                        type: "resseiga", status: "success",
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
            } else {
                chrome.tabs.query({ active: true, currentWindow: true }, e => {
                    e[0] && chrome.tabs.sendMessage(e[0].id, { type: "resseiga", status: "fail", obj_name: obj_name });
                });
            }
        }
        return;
    };
    seiga_xhr.send();
}
chrome.runtime.onMessage.addListener(m => {
    if (m.type === "getdouga") {
        douga_request(m.media_id, m.obj_name);
    } else if (m.type === "getseiga") {
        seiga_request(m.media_id, m.obj_name);
    }
});