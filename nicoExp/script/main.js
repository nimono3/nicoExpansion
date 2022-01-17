let scroll_mode = 2;
let tag_link = true;
let range_func = (...arg) => [...Array(arg[arg.length - 1]).keys()].slice(!!(arg.length - 1) * arg[0]);

chrome.storage.local.get({
    s_mode: 2,
    t_link: true
}, items => {
    scroll_mode = items.s_mode;
    tag_link = items.t_link;
});

chrome.runtime.onMessage.addListener(m => {
    if (m.type == 'cs') {
        scroll_mode = m.cs_value;
        chrome.storage.local.set({ s_mode: m.cs_value }, () => { });
    }
    if (m.type == 'tl') {
        tag_link = m.tl_value;
        chrome.storage.local.set({ t_link: m.tl_value }, () => { });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementsByClassName('CommonHeader')[0].addEventListener('click', function () {
        scroll_p(scroll_mode);
    });
    if (tag_link) {
        let reg = /sm\d+/g;
        [...document.getElementsByClassName("TagItem")].map(ti => ti.innerText.match(reg) ? [ti, ti.innerText.match(reg)] : null).filter(_ => _).map(m => {
            m[0].style.paddingRight = (28 + 16 * m[1].length) + "px";
            let t_span = document.createElement("span");
            t_span.innerText = "~";
            t_span.style.color = "#fff";
            t_span.style.verticalAlign = "text-top";
            t_span.style.lineHeight = "16px";
            t_span.style.fontSize = "10px";
            let t_link = document.createElement("a");
            t_link.style.width = t_link.style.height = "16px";
            t_link.style.backgroundColor = "#808080";
            t_link.className = "TagItem-nicoDicLink";
            t_link.style.textDecoration = "none";
            t_link.style.borderRadius = "50%";
            t_link.style.textAlign = "center";
            t_link.appendChild(t_span);
            m[1].map((str, idx) => {
                t_link.style.right = (3 + 19 * (m[1].length - idx)) + "px";
                t_link.href = "https://nico.ms/" + str;
                m[0].appendChild(t_link.cloneNode(1));
            });
            return 0;
        });
    }
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