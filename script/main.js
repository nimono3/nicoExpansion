let scroll_mode = 2;

chrome.storage.sync.get({
    s_mode: 2,
}, items => {
    scroll_mode = items.s_mode;
});

chrome.runtime.onMessage.addListener(m => {
    if (m.type == 'cs') {
        scroll_mode = m.cs_value;
        chrome.storage.sync.set({ s_mode: m.cs_value },()=>{});
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementsByClassName('CommonHeader')[0].addEventListener('click', function () {
        scroll_p(scroll_mode);
    });
    /*
    var taglist = document.getElementsByClassName('TagList')[0].innerHTML;
    var tagsm = taglist.match(/sm\d+/g);
    var tag_element = document.createElement('a');
    if (tagsm != null) {
        for (var i = 0; i < tagsm.length; i++) {
            if (i % 3 == 0) {
                tag_element.href = "https://www.nicovideo.jp/watch/" + tagsm[i];
                tag_element.textContent = tagsm[i];
                document.getElementsByClassName('VideoDescriptionContainer')[0].appendChild(tag_element);
            }
        }
    }*/
});

function scroll_p(mode) {
    if (mode >= 0) scrollTo(0, 0);
    if (mode == 1) scrollTo(0, document.getElementsByClassName('VideoDescription')[0].getBoundingClientRect().bottom - 36);
    if (mode == 2) scrollTo(0, document.getElementsByClassName('VideoMetaContainer')[0].getBoundingClientRect().bottom - 36);
}