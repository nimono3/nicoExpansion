let scroll_mode = 2;
let tag_link = true;
let tag_border = "1px solid #e5e8ea";

const range_func = (...arg) => [...Array(arg[arg.length - 1]).keys()].slice(!!(arg.length - 1) * arg[0]);

const scroll_p = mode => {
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
const gen_tag_link = () => {
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
        t_link.style.backgroundColor = "#b2bac2";
        t_link.setAttribute("class", "TagItem-nicoDicLink TagItem-nicoExpLink");
        t_link.setAttribute("target", "_blank");
        t_link.setAttribute("rel", "noopener");
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
    [...document.getElementsByClassName("is-locked")].map(il => { il.style.border = "1px solid #d9a300"; });
}
const ext_tag_link = () => {
    [...document.getElementsByClassName("TagItem-nicoExpLink")].map(tinel => {
        tinel.parentNode.style.paddingRight = "28px";
        tinel.remove();
    });
    [...document.getElementsByClassName("TagItem")].map(il => { il.style.border = tag_border; });
}

chrome.runtime.onMessage.addListener(m => {
    if (m.type == 'tag_link') {
        tag_link = m.tag_link;
        ext_tag_link();
        if (tag_link) gen_tag_link();
    }
});

document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementsByClassName("VideoTitle").length) {
        const tag_observer = new MutationObserver(() => {
            ext_tag_link();
            if (tag_link) gen_tag_link();
        });
        tag_observer.observe(document.getElementsByClassName("TagList")[0], { childList: true });
        tag_border = document.getElementsByClassName("TagItem")[0].style.border;
        document.getElementsByClassName('CommonHeader')[0].addEventListener('click', () => {
            chrome.storage.local.get({ click_scroll: 2 }, items => {
                scroll_mode = items.click_scroll;
                scroll_p(scroll_mode);
            });
        });
        chrome.storage.local.get({
            tag_link: true
        }, items => {
            tag_link = items.tag_link;
        });
        ext_tag_link();
        if (tag_link) gen_tag_link();
    }
});
window.onload = () => {
    if (document.getElementsByClassName("UserPage").length) {
        const myid = (img => img ? img.pop().src.split("/").pop().split(".jpg")[0] : "")([...document.getElementsByClassName("CommonHeader")[0].getElementsByTagName("img")]);
        if (myid) chrome.storage.local.set({ myid: myid });
        if (document.getElementsByClassName("MylistPage").length) {
            if (document.getElementsByClassName("ErrorState-title").length) {
                if (document.getElementsByClassName("ErrorState-title")[0].innerText.match(/非公開/) && document.getElementsByClassName("UserDetailsHeader-accountID")[0].innerText.match(/\d+/g)[0] === myid) {
                    const list_link = document.createElement("a");
                    list_link.href = "https://www.nicovideo.jp/my/mylist/" + document.getElementsByClassName("CommonHeader")[0].getAttribute("data-common-header").match(/(?<=mylist\\\/)\d+/g)[0];
                    document.getElementsByClassName("ErrorState-title")[0].parentNode.parentNode.appendChild(list_link);
                    list_link.appendChild(document.getElementsByClassName("ErrorState-title")[0].parentNode);
                    document.getElementsByClassName("ErrorState-title")[0].parentNode.style.backgroundColor = "#fff";
                    document.getElementsByClassName("ErrorState-title")[0].parentNode.style.border = "5px solid #d3d3d3";
                }
            } else {
                chrome.storage.local.set({
                    qtlist: {
                        name: (el => el ? el.innerText : "")(document.getElementsByClassName("MylistHeader-name")[0]),
                        list: [...document.getElementsByClassName('NC-MediaObject-contents')].map(l => l.href.split("/").pop()).reduce((acc, val, idx) =>
                            [...acc, { id: val, label: [...document.getElementsByClassName('NC-MediaObjectTitle')].map(l => l.innerHTML)[idx] }]
                            , []
                        )
                    }
                });
            }
        }
    }/* else if (document.getElementsByClassName("my_clip").length) {
        const myid = document.getElementsByClassName("my_menu_profile_image")[0].firstElementChild.src.split("/").pop().split(".jpg")[0];
        chrome.storage.local.set({ myid: myid });
    }*/
}