let scroll_mode = 2;
let range_func = (...arg) => [...Array(arg[arg.length - 1]).keys()].slice(!!(arg.length - 1) * arg[0]);

chrome.storage.local.get({
    s_mode: 2,
}, items => {
    scroll_mode = items.s_mode;
});

chrome.runtime.onMessage.addListener(m => {
    if (m.type == 'cs') {
        scroll_mode = m.cs_value;
        chrome.storage.local.set({ s_mode: m.cs_value }, () => { });
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
    //if (!(range_func(1, 1 + 4).includes(mode))) return;
    if (mode <= 0) return;//POWER_PLAY
    if (mode >= 5) return;//--
    scrollTo(0, document.getElementsByClassName(([
        'HeaderContainer-row',
        'TagContainer',
        'MainContainer',
        'BottomContainer'
    ])[mode - 1])[0].previousElementSibling.getBoundingClientRect().bottom - 36);
    return;
}