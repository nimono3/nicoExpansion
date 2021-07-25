var cs = document.getElementById('click-scroll');
var sl = document.getElementById('sm-link');
var dl = document.getElementById('draw-link');
var ld = document.getElementById('link-div');

document.getElementById('view-version').innerHTML = "version-"+chrome.runtime.getManifest().version;

document.addEventListener('DOMContentLoaded', function () {
    chrome.storage.sync.get({
        click_scroll: 2,
        sm_link: true,
        draw_link: true
    },
        items => {
            cs.value = items.click_scroll;
            sl.checked = items.sm_link;
            dl.checked = items.draw_link;
            if (dl.checked) {
                ld.style.display = "inline";
            } else {
                ld.style.display = "none";
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
    sl.addEventListener('change', e => {
        chrome.storage.sync.set({ sm_link: sl.checked });
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
});

document.getElementById('video-nico').onclick = function () {
    searcher_nico("https://nicovideo.jp/search/");
}
document.getElementById('seiga-nico').onclick = function () {
    searcher_nico("https://seiga.nicovideo.jp/search/");
}
document.getElementById('live-nico').onclick = function () {
    searcher_nico("https://live.nicovideo.jp/search?keyword=");
}
document.getElementById('dic-nico').onclick = function () {
    searcher_nico("https://dic.nicovideo.jp/a/");
}
function searcher_nico(link_parts) {
    chrome.tabs.query({ active: true, currentWindow: true }, e => {
        var act_url = e[0].url;
        var act_host = act_url.split('/')[2];
        var search_word = "";
        if (act_host == "www.google.com") {
            search_word = new URLSearchParams(act_url.slice(act_url.indexOf('?'))).get("q");
        } else if (act_host == "www.youtube.com") {
            search_word = new URLSearchParams(act_url.slice(act_url.indexOf('?'))).get("search_query");
        } else if (act_host == "www.nicovideo.jp") {
            search_word = (new URLSearchParams(act_url.split('/').pop().split('?')[0]) + []).slice(0, -1);
        }
        window.open(link_parts + search_word);
    })
}