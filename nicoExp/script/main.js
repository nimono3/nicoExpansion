let tag_link = true;
let tag_border = "1px solid #e5e8ea";

const range_func = (...arg) => [...Array(arg[arg.length - 1]).keys()].slice(!!(arg.length - 1) * arg[0]);

const scroll_p = mode => {
    if (mode >= 0) scrollTo(0, 0);
    if (range_func(1, 1 + 4).includes(mode))
        scrollTo(0, document.getElementsByClassName(([
            'HeaderContainer-row',
            'TagContainer',
            'MainContainer',
            'BottomContainer'
        ])[mode - 1])[0].previousElementSibling.getBoundingClientRect().bottom - 36);
    return;
}
const gen_tag_link = () => {
    let reg = /(sm|im)\d+/g;
    if (document.getElementsByClassName("illust_tag_container").length) {
        [...document.getElementsByClassName("static")[0].getElementsByClassName("tag")].map(t => t.firstElementChild.innerText.match(reg) ? [t, t.firstElementChild.innerText.match(reg)] : null).filter(_ => _).map(m => {
            let t_list = [...m[0].getElementsByTagName("ul")[0].children].slice(-1)[0].cloneNode(1);
            t_list.classList.add("tag-ncEx");
            t_list.style.backgroundColor = "#ccc";
            m[1].map(str => {
                t_list.firstElementChild.href = "https://nico.ms/" + str;
                m[0].getElementsByTagName("ul")[0].insertBefore(t_list.cloneNode(1), [...m[0].getElementsByTagName("ul")[0].children].slice(-1)[0]);
            });
        });
        [...document.getElementsByClassName("static")[0].getElementsByClassName("tag")].map((e, i) => {
            if (document.getElementsByClassName("tag_list_block")[0].firstElementChild.children[i].getElementsByClassName("delete")[0].style.display === "none")
                e.style.border = "1px solid #d9a300", e.style.margin = "1px 8px 4px 0";
        });
    } else {
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
    return;
}
const ext_tag_link = () => {
    if (document.getElementsByClassName("illust_tag_container").length) {
        [...document.getElementsByClassName("tag-ncEx")].map(t => t.remove());
        [...document.getElementsByClassName("static")[0].getElementsByClassName("tag")].map((e, i) => {
            e.style.border = tag_border, e.style.margin = "2px 10px 5px 0";
        });
    } else {
        [...document.getElementsByClassName("TagItem-nicoExpLink")].map(tinel => {
            tinel.parentNode.style.paddingRight = "28px";
            tinel.remove();
        });
        [...document.getElementsByClassName("TagItem")].map(il => { il.style.border = tag_border; });
    }
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
            chrome.storage.local.get({ header_scroll: 2 }, item => scroll_p(parseInt(item.header_scroll)));
        });
        chrome.storage.local.get({
            tag_link: true
        }, items => {
            tag_link = items.tag_link;
            ext_tag_link();
            if (tag_link) gen_tag_link();
        });
    } else if (document.getElementsByClassName("Series").length){
        chrome.storage.local.set({
            qtlist: {
                name: document.title.match(/((?<=^「).*(?=（全\d+件）」))/g)[0],
                list: [...document.getElementsByClassName('NC-Link')].reduce((acc, val) =>
                    [...acc, { id: val.href.split("/").pop(), label: val.getElementsByTagName("h2")[0].innerText }]
                    , []
                )
            }
        });
    }
});
window.onload = () => {
    const myid = (img => img ? (i => i ? i.tagName == "IMG" ? i.src.split("/").pop().split(".jpg")[0] : "" : "")(img.pop()) : "")([...document.getElementById("CommonHeader").getElementsByTagName("img")]);
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
    } else if (document.getElementsByClassName("VideoPage").length) {
        chrome.storage.local.set({
            qtlist: {
                name: (el => el ? el.innerText : "")(document.getElementsByClassName("UserDetailsHeader-nickname")[0]),
                list: [...document.getElementsByClassName('NC-MediaObject-contents')].map(l => l.href.split("/").pop()).reduce((acc, val, idx) =>
                    [...acc, { id: val, label: [...document.getElementsByClassName('NC-MediaObjectTitle')].map(l => l.innerHTML)[idx] }]
                    , []
                )
            }
        });
    } else if (document.getElementsByClassName("illust_tag_container").length) {
        const tag_observer = new MutationObserver(() => {
            ext_tag_link();
            if (tag_link) gen_tag_link();
        });
        tag_observer.observe(document.getElementsByClassName("static")[0].getElementsByTagName("ul")[0], { childList: true });
        tag_border = document.getElementsByClassName("tag")[0].style.border;
        chrome.storage.local.get({
            tag_link: true
        }, items => {
            tag_link = items.tag_link;
            ext_tag_link();
            if (tag_link) gen_tag_link();
        });
    } else if (document.getElementById("my_clip") || document.getElementsByClassName("clip_block_outer").length) {
        chrome.storage.local.set({
            qtlist: {
                name: (el => el[0] ? el[0].firstElementChild.innerText : el[1] ? el[1].firstElementChild.innerText : "")([document.getElementsByClassName("title_text")[0], document.getElementsByClassName("ttl_text")[0]]),
                list: [...document.getElementsByClassName('text_ttl')].reduce((acc, val) =>
                    [...acc, { id: val.firstElementChild.href.split("/").pop(), label: val.firstElementChild.innerText }]
                    , []
                )
            }
        });
    }
}