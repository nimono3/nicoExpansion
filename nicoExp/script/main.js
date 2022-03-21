let El;
El = function (tag, ...others) {
    return {
        type: "ElObject",
        children: (others.length) ? others.pop() : [],
        e: {
            tag: tag,
            attr: (others.length) ? others.pop() : {},
            style: (others.length) ? others.pop() : {},
            inText: (others.length) ? others.pop() : ""
        },
        gen: function () {
            const element = document.createElement(this.e.tag);
            if (this.e.inText) element.innerText = this.e.inText;
            Object.keys(this.e.style).map(key => element.style[key] = this.e.style[key]);
            Object.keys(this.e.attr).map(key => element.setAttribute(key, this.e.attr[key]));
            this.children.map(child =>
                child.type === "ElObject" ? element.appendChild(child.gen()) :
                    child instanceof Element ? element.appendChild(child) :
                        typeof child === "string" ? element.insertAdjacentHTML("beforeend", child) : -1);
            return element
        },
        attr: function (attr) {
            Object.keys(attr).map(at => this.e.attr[at] = attr[at]);
            return this;
        },
        class: function (class_name) {
            return this.attr({ class: class_name });
        }
    };
}
El.appendChildren = function (element, children) {
    [children].flat().map(child =>
        child.type === "ElObject" ? element.appendChild(child.gen()) :
            child instanceof Element ? element.appendChild(child) :
                typeof child === "string" ? element.insertAdjacentHTML("beforeend", child) : -1);
    return;
}
Node.prototype.get = function (query) {
    return [...(this.querySelectorAll(query) || [])];
}
let tag_link = true;
let tag_border = "1px solid #e5e8ea";

const range_func = (...arg) => [...Array(arg[arg.length - 1]).keys()].slice(!!(arg.length - 1) * arg[0]);
const prevCount = node => [...node.parentNode.children].reduce((acc, v) => [acc[0] + (acc[1] &= v !== node), (acc[1] &= v !== node)], [0, true])[0];
const listid = parseInt((document.URL.match(/ex\d+/g) || ["ex0"])[0].slice(2), 10);

const exls_default = {
    exlists: [
        { name: "list0", list: [] },
        { name: "list1", list: [] },
        { name: "list2", list: [] },
        { name: "list3", list: [] },
        { name: "list4", list: [] }
    ]
};

function scroll_p(mode) {
    if (mode >= 0) scrollTo(0, 0);
    if (range_func(1, 1 + 4).includes(mode)) {
        const common_header = document.get("#CommonHeader")[0] || { clientHeight: 36, style: { position: "sticky" } };//取得失敗用
        const correction = common_header.clientHeight * (common_header.style.position === "sticky");
        scrollTo(0, document.get(([
            '.HeaderContainer-row',
            '.TagContainer',
            '.MainContainer',
            '.BottomContainer'
        ])[mode - 1])[0].previousElementSibling.getBoundingClientRect().bottom - correction);
    }
    return;
}
function gen_tag_link() {
    if (document.get(".illust_tag_container").length) {
        document.get(".static")[0].get(".tag").map(t => url_to_id_sv(t.firstElementChild.innerText).sv !== "another" ? [t, url_to_id_sv(t.firstElementChild.innerText).id] : null).filter(_ => _).map(m => {
            let t_list = [...m[0].get("ul")[0].children].slice(-1)[0].cloneNode(1);
            t_list.classList.add("tag-ncEx");
            t_list.style.backgroundColor = "#ccc";
            m[1].map(str => {
                t_list.firstElementChild.href = "https://nico.ms/" + (str.match(/^\d+$/) ? "dic/" : "") + str;
                m[0].get("ul")[0].insertBefore(t_list.cloneNode(1), [...m[0].get("ul")[0].children].slice(-1)[0]);
            });
        });
        document.get(".static")[0].get(".tag").map((e, i) => {
            if (document.get(".tag_list_block")[0].firstElementChild.children[i].get(".delete")[0].style.display === "none")
                e.style.border = "1px solid #d9a300", e.style.margin = "1px 8px 4px 0";
        });
    } else {
        document.get(".TagItem").map(ti => url_to_id_sv(ti.innerText).sv !== "another" ? [ti, url_to_id_sv(ti.innerText).id] : null).filter(_ => _).map(m => {
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
                t_link.href = "https://nico.ms/" + (str.match(/^\d+$/) ? "dic/" : "") + str;//大百科(dic)のみdic/が弾かれるため
                m[0].appendChild(t_link.cloneNode(1));
            });
            return 0;
        });
        document.get(".is-locked").map(il => { il.style.border = "1px solid #d9a300"; });
    }
    return;
}
function ext_tag_link() {
    if (document.get(".illust_tag_container").length) {
        document.get(".tag-ncEx").map(t => t.remove());
        document.get(".static")[0].get(".tag").map((e, i) => {
            e.style.border = tag_border, e.style.margin = "2px 10px 5px 0";
        });
    } else {
        document.get(".TagItem-nicoExpLink").map(tinel => {
            tinel.parentNode.style.paddingRight = "28px";
            tinel.remove();
        });
        document.get(".TagItem").map(il => { il.style.border = tag_border; });
    }
}
const PPC_tab_observers = [];
function gen_ichiba_tab() {
    const PPC_tab = document.get(".PlayerPanelContainer-tab")[0];
    const PPC_content = document.get(".PlayerPanelContainer-content")[0];
    const newtab = El("div", ["ニコニコ市場"]).class("PlayerPanelContainer-tabItem").gen();
    newtab.classList.remove("current");
    PPC_tab.appendChild(newtab);
    newtab.setAttribute("onclick", "document.get(\".PlayerPanelContainer-tabItem\").pop().addEventListener(\"click\",_=>ichiba.reloadMain(),false);");
    const newpanel = El("div").class("IchibaPanelContainer").attr({ style: "height: 100%;" }).gen();
    document.get(".PlayerPanelContainer-tabItem").map((e, i) => {
        e.style.userSelect = "none";
        e.addEventListener("click", _ => {
            if (!e.classList.contains("current")) {
                PPC_tab.get(".current").map(e => e.classList.remove("current"));
                e.classList.add("current");
                if (PPC_content.get(".IchibaPanelContainer").length) {
                    PPC_content.removeChild(PPC_content.get(".IchibaPanelContainer")[0]);
                    if (PPC_content.children.length) {
                        let temp = PPC_content.removeChild(PPC_content.firstElementChild);
                        temp.style.display = "";
                        PPC_content.appendChild(temp);
                    }
                }
                if (e === newtab) {
                    PPC_content.firstElementChild.style.display = "none";
                    PPC_content.appendChild(newpanel);
                    if (!newpanel.children.length && document.get(".IchibaContainer").length) {
                        const ichiba_container = document.get(".IchibaContainer")[0];
                        newpanel.appendChild(ichiba_container);
                        newpanel.get(".Card-main")[0].style.paddingRight = "0";
                        ichiba_container.style.padding = "0";
                        ichiba_container.classList.add("WatchRecommendation-inner");
                        ichiba_container.style.overflowY = "scroll";
                        ichiba_container.style.height = "100%";
                        ichiba_container.classList.remove("Card");
                    }
                }
            }
        }, false);
        PPC_tab_observers.push(new MutationObserver(_ => {
            if (PPC_tab.get(".current").length !== 1) {
                if (e.classList.contains("current")) e.classList.remove("current");
                e.click();
            }
        }));
        PPC_tab_observers[i].observe(e, {
            attributes: true,
            attributeFilter: ["class"]
        });
    });
};
function apndExls(index, content_id, content_label) {
    chrome.storage.local.get(exls_default, item => {
        const exlists = item.exlists;
        exlists[index].list.push({ id: content_id || "sm0", label: content_label || content_id || "sm0" });
        chrome.storage.local.set({ exlists: exlists });
    });
}
function openShare() {
    const share_modal = El("div", { class: "NC-Fade NC-Modal NC-ShareModal MylistShareModal", style: "transition: opacity 200ms ease-in-out 0s; opacity: 1;" }, [
        El("div", { class: "NC-Modal-overlay" }, [
            El("div", { class: "NC-Modal-body" }, [
                El("div", { class: "NC-ShareModal-modal" }, [
                    El("div", { class: "NC-ShareModal-modalTitle" }, ["拡張マイリストの共有/読込"]),
                    El("div", { class: "NC-ShareModal-modalBody" }, [
                        El("div", { class: "NC-ShareModal-sns" }, [
                            El("button", { "aria-label": "twitter", class: "react-share__ShareButton NC-TwitterShareButton", style: "background-color: transparent; border: none; padding: 0px; font: inherit; color: inherit; cursor: pointer;" }, [
                                /*El("div").class("NC-TwitterShareButton-icon")*/
                            ])
                        ]),
                        El("div", { textAlign: "right" }, { class: "NC-ShareModal-form" }, [
                            El("label", { cursor: "pointer" }, {}, [
                                El("div", { textAlign: "left" }, {}, [
                                    El("div", ["ファイルを選択"]).attr({ style: "display: inline-block; width: 160px; height: 20px; text-align: center; background-color: #252525; color: #fafafa;" }),
                                    El("i", ["選択されていません"]).attr({ id: "exls-selectedFile-text" })
                                ]),
                                El("div", { position: "relative", width: "100%", height: "150px", backgroundColor: "#0005", textAlign: "center" }, {}, [
                                    exls_svimg,
                                    El("input").attr({ type: "file", id: "exls-ld-ipt", style: "position: absolute; top: 0; left: 0; right: 0; bottom: 0; opacity: 0;", title: "ドロップしても読み込めます" })
                                ])
                            ]),
                            save_link
                        ])
                    ]),
                    El("button").class("NC-ShareModal-modalClose")
                ])
            ])
        ])
    ]).gen();
    !is_exls_imgload && reload_canvas();
    document.body.style = "padding-right: 17px; overflow: hidden;";
    document.body.insertAdjacentElement("beforeend", share_modal);
    const shareClose = e => (e.target.classList.contains("NC-ShareModal-modalClose") || e.target.classList.contains("NC-Modal-overlay")) && (share_modal.remove(), document.body.style = "");
    document.get("#exls-ld-ipt")[0].value = "";
    document.get("#exls-ld-ipt")[0].onchange = e => {
        const r = new FileReader();
        const file = e.target.files[0];
        file && r.readAsDataURL(file);
        if (file && confirm("このリストの内容は全て削除されます\nよろしいですか？")) {
            document.get("#exls-selectedFile-text")[0].innerText = e.target.files[0].name;
            is_exls_imgload = 1
            r.onload = _ => load_exls(r.result);
        }
    };
    document.get(".NC-ShareModal-modalClose")[0].addEventListener("click", shareClose, false);
    document.get(".NC-Modal-overlay")[0].addEventListener("click", shareClose, false);
    return;
}
function openHeaderMenu() {
    const header_menu = El("div", { class: "WheelStopper", style: "" }, [
        El("div", { class: "Snap ThreePointMenu MylistHeaderMenu MylistHeaderAction-item", style: "top: 384.391px; left: 1255.5px; transform: translateX(-100%);" }, [
            El("button", ["拡張マイリストを編集"]).class("MylistHeaderMenu-item")
        ])
    ]).gen();
    document.body.insertAdjacentElement("beforeend", header_menu);
    header_menu.get(".MylistHeaderMenu-item")[0].onclick = openEditMylist;
    setTimeout(() => document.addEventListener("click", e => e.target.classList.contains("Snap") || (header_menu.remove())), 1);
    return;
}
function openEditMylist() {
    let exls_title_el;
    const edit_modal = El("div", { class: "Fade Modal EditMylistModal MylistEditModalContainer", style: "transition: opacity 200ms ease-in-out 0s; opacity: 1;" }, [
        El("div", { class: "Modal-overlay" }, [
            El("div", { class: "Modal-body" }, [
                El("article", { class: "ModalContent ModalContent_with-header ModalContent_with-footer" }, [
                    El("header", { class: "ModalContent-header" }, [
                        El("h1", ["拡張マイリスト編集"]).class("ModalContent-headerTitle"),
                        El("button").class("ModalContent-headerCloseButton")
                    ]),
                    El("div", { class: "ModalContent-body" }, [
                        El("div", { class: "EditMylistModal-settings" }, [
                            El("section", { class: "TextField" }, [
                                El("h1", { class: "TextField-label" }, [El("span", ["タイトル"]).class("TextField-labelText")]),
                                El("div", { class: "TextField-input" }, [exls_title_el = El("input").attr({ type: "text", class: "TextField-inputForm", id: "undefined-title", name: "title", value: "" }).gen()])
                            ])
                        ])
                    ]),
                    El("footer", { class: "ModalContent-footer" }, [
                        El("button", ["保存"]).class("ModalContent-footerSubmitButton")
                    ])
                ])
            ])
        ])
    ]).gen();
    document.body.style = "padding-right: 17px; overflow: hidden;";
    document.body.insertAdjacentElement("beforeend", edit_modal);
    const editClose = e => e.target.classList.contains("ModalContent-headerCloseButton") && (edit_modal.remove(), document.body.style = "");
    const editCloseBtn = document.get(".ModalContent-headerCloseButton")[0];
    editCloseBtn.addEventListener("click", editClose, false);
    document.get(".Modal-overlay")[0].addEventListener("click", e => e.target.classList.contains("Modal-overlay") && editCloseBtn.click(), false);
    document.get(".ModalContent-footerSubmitButton")[0].addEventListener("click", () => {
        chrome.storage.local.get(exls_default, item => {
            const exls = item.exlists;
            exls[listid].name = exls_title_el.value;
            chrome.storage.local.set({ exlists: exls });
            chrome.runtime.sendMessage({ type: "renameMenu", id: "apndExls-" + listid, title: exls_title_el.value });
            is_exls_imgload = 0;
        });
        document.get(".MylistHeader-name")[0].innerText = exls_title_el.value;
        document.title = exls_title_el.value + " - " + document.title.split(" - ").slice(-1)[0]
        editCloseBtn.click();
    }, false);
    chrome.storage.local.get(exls_default, item => exls_title_el.value = item.exlists[listid].name);
    return;
}
const openMediaMenu = (name, id = "") => {
    const exlist_container = document.get(".ExlistContainer")[0];
    const media_obj_list_el = exlist_container.get(".VideoMediaObjectList")[0];
    const media_obj_el = media_obj_list_el.get(".ExMedia" + name)[0];
    const media_menu = El("div", { class: "WheelStopper", style: "" }, [
        El("div", { class: "Snap ThreePointMenu VideoMenu MylistPageVideoMenu MylistItem-action", style: `top: ${window.pageYOffset + media_obj_el.get(".ThreePointMenu-button")[0].getBoundingClientRect().bottom}px; left: 1255.5px; transform: translateX(-100%);` }, [
            El("button", ["リストから削除"]).class("VideoMenuButtonItem MylistPageVideoMenu-item MenuItem-Remove"),
            ...(url_to_id_sv(id).others.ad ? [El("a", ["ニコニ広告する"]).attr({ class: "VideoMenuLinkItem MenuItem-Nicoad", onclick: `window.open("https://nicoad.nicovideo.jp/${url_to_id_sv(id).others.ad}/publish/${url_to_id_sv(id).id}", null, "top=0,left=0,width=428,height=600")` })] : [])
        ])
    ]).gen();
    document.body.insertAdjacentElement("beforeend", media_menu);
    media_menu.get(".MenuItem-Remove")[0].onclick = () => confirm(`${media_obj_el.get(".NC-MediaObjectTitle")[0].innerText}をリストから削除します\nよろしいですか？`) && ext_some(name);
    setTimeout(() => document.addEventListener("click", e => e.target.classList.contains("Snap") || (media_menu.remove())), 1);
    return;
};
const exlistUpDown = (name, mode) => {
    const exlist_container = document.get(".ExlistContainer")[0];
    const media_obj_list_el = exlist_container.get(".VideoMediaObjectList")[0];
    const media_obj_el = media_obj_list_el.get(".ExMedia" + name)[0];
    const index = prevCount(media_obj_el);
    const newindex = index + (mode - 0.5) * -2;
    if (mode ? media_obj_el.previousElementSibling : media_obj_el.nextElementSibling) {
        chrome.storage.local.get(exls_default, item => {
            const exlists = item.exlists;
            const ex = exlists[listid].list[index];
            media_obj_list_el.insertBefore(media_obj_el, mode ? media_obj_el.previousElementSibling : media_obj_el.nextElementSibling.nextElementSibling);//nextnextがnullのとき仕様で末尾に挿入される
            exlists[listid].list.splice(index, 1);
            exlists[listid].list.splice(newindex, 0, ex);
            chrome.storage.local.set({ exlists: exlists });
            is_exls_imgload = 0;
            const size_el = media_obj_el.nextElementSibling || media_obj_el;
            const moe_marginTop = parseInt(document.defaultView.getComputedStyle(size_el).marginTop.match(/\d+/g)[0], 10);
            scrollBy(0, (size_el.getBoundingClientRect().height + moe_marginTop) * (mode - 0.5) * -2);
        });
    }
}
const saveMemo = name => {
    const media_obj_list_el = document.get(".ExlistContainer")[0].get(".VideoMediaObjectList")[0];
    const media_obj_el = media_obj_list_el.get(".ExMedia" + name)[0];
    const listid = parseInt((document.URL.match(/ex\d+/g) || ["ex0"])[0].slice(2), 10);
    const index = prevCount(media_obj_el);
    chrome.storage.local.get(exls_default, item => {
        const exlists = item.exlists;
        exlists[listid].list[index].label = (media_obj_el.get(".TextField-inputForm")[0] || { value: media_obj_el.get(".MylistItemMemo-preview")[0].innerText }).value;
        chrome.storage.local.set({ exlists: exlists });
        is_exls_imgload = 0;
    });
}
const triangle = `data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%3E%3Cpolygon%20points%3D%224%208%2C%2020%208%2C%2012%2021%22%20stroke-width%3D%221%22%20stroke%3D%22none%22%20fill%3D%22%23bbb%22%20%2F%3E%3C%2Fsvg%3E`;
const gen_media_temp = (name, id, label) => El("div", { class: "CheckboxVideoMediaObject MylistItem MylistItemList-item CheckboxVideoMediaObject_withFooter ExMedia" + name }, [
    El("div", { class: "CheckboxVideoMediaObject-checkboxArea" }, [
        El("div", { class: "Checkbox CheckboxVideoMediaObject-checkbox" }, [
            El("input").attr({ class: "Checkbox-input", type: "checkbox", id: name, name: name, "data-checkboxes-item-id": id }),
            El("label").attr({ class: "Checkbox-check", for: name })
        ])
    ]),
    El("div", { "data-video-thumbnail-comment-hover": true, class: "NC-MediaObject NC-VideoMediaObject MylistItem MylistItemList-item NC-MediaObject_withAction NC-MediaObject_withFooter" }, [
        El("div", { class: "NC-MediaObject-main" }, [
            El("a", { href: id_to_url(id), class: "NC-Link NC-MediaObject-contents", rel: "noopener" }, [
                El("div", { class: "NC-MediaObject-media" }, [
                    El("div", { class: "NC-VideoMediaObject-thumbnail" }, [
                        El("div", { class: "NC-Thumbnail NC-VideoThumbnail NC-VideoMediaObject-thumbnail NC-Thumbnail_sizeCover" }, [
                            El("div").attr({ class: "NC-Thumbnail-image", role: "img", "aria-label": "" }),/*サムネイル*/
                            ...(url_to_id_sv(id).sv === "douga" ? [El("div").class("NC-VideoLength")] : [])
                        ])
                    ])
                ]),
                El("div", { class: "NC-MediaObject-body", style: "position: relative;" }, [
                    El("div", { class: "NC-MediaObject-bodyTitle" }, [
                        El("h2", [label]).class("NC-MediaObjectTitle NC-VideoMediaObject-title NC-MediaObjectTitle_fixed2Line")/*タイトル*/
                    ]),
                    El("div", { class: "NC-MediaObject-bodySecondary" }, [
                        El("div").class("NC-VideoMediaObject-description"),/*動画説明*/
                        El("div", { class: "NC-VideoMediaObject-meta" }, [
                            El("div", { class: "NC-VideoMediaObject-metaAdditional" }, [
                                El("span", { class: "NC-VideoRegisteredAtText" }, [
                                    El("span").class("NC-VideoRegisteredAtText-text")/*投稿日時*/
                                ])
                            ]),
                            El("div", { class: "NC-VideoMediaObject-metaCount" }, ["douga", "seiga"].includes(url_to_id_sv(id).sv) ? [/*各種カウンタ*/
                                El("div", { class: "NC-VideoMetaCount NC-VideoMetaCount_view" }, ["0"]),
                                El("div", { class: "NC-VideoMetaCount NC-VideoMetaCount_comment" }, ["0"]),
                                /*El("div", { class: "NC-VideoMetaCount NC-VideoMetaCount_like" }, ["0"]),*/
                                El("div", { class: "NC-VideoMetaCount NC-VideoMetaCount_mylist" }, ["0"])
                            ] : [])
                        ])
                    ])
                ])
            ]),
            El("div", { class: "NC-MediaObject-action" }, [
                El("div").class("ThreePointMenu-button ThreePointMenu-button_gray"),
                El("div").attr({ class: "ExListUp", style: `width: 24px; height: 24px; margin: 2px 0 0; transform: rotate(180deg); border-radius: 50% 50%; background-size: contain; background-image: url("${triangle}"); cursor: pointer;` }),
                El("div").attr({ class: "ExListDown", style: `width: 24px; height: 24px; margin: 0; border-radius: 50% 50%; background-size: contain; background-image: url("${triangle}"); cursor: pointer;` })
            ])
        ]),
        El("footer", [
            El("div", { class: "MylistItemAddition MylistItem-addition" }, [
                El("div", { class: "MylistItemAddition-row" }, [
                    El("div", { class: "MylistItemAddition-addedAt" }, ["@" + url_to_id_sv(id).others.text]),/*サービス表示*/
                    El("button").class("MylistItemAddition-edit")
                ]),
                El("span", [label]).class("AutoLinkText EditableField MylistItemMemo MylistItemAddition-memo MylistItemMemo-preview")
            ])
        ])
    ])
]).gen();
const gen_media_objs = () => {
    const exlist_container = document.get(".ExlistContainer")[0];
    const media_obj_list_el = exlist_container.get(".TempVideoMediaObjectList")[0] || exlist_container.get(".VideoMediaObjectList")[0];
    [...media_obj_list_el.children].map(e => e.remove());
    const listid = parseInt((document.URL.match(/ex\d+/g) || ["ex0"])[0].slice(2), 10);
    chrome.storage.local.get(exls_default, item => {
        if (item.exlists && item.exlists.length > listid) {
            const exlists = item.exlists;
            const exlist = exlists[listid];
            document.title = (exlist_container.get(".MylistHeader-name")[0].innerText = exlist.name) + " - nicoExp";
            exlist_container.get(".MylistHeader-metaItemValue")[0].innerText = exlist.list.length;
            exlist.list.map((ex, i) => {
                const media_name = i + ex.id.replace(/[^0-9A-Za-z_\-]+/g, "");
                const media_template = gen_media_temp(media_name, ex.id, ex.label);
                media_obj_list_el.appendChild(media_template);
                media_template.get(".NC-Thumbnail-image")[0].style.background = `center center / ${["seiga", "ichiba", "user", "commons"].includes(url_to_id_sv(ex.id).sv) ? "contain" : "cover"} no-repeat #fff`;
                if (["douga", "seiga"].includes(url_to_id_sv(ex.id).sv)) {
                    chrome.runtime.sendMessage({ type: "get", mode: url_to_id_sv(ex.id).sv, media_id: ex.id, obj_name: media_name, trial: 0 });
                } else {
                    media_template.get(".NC-Thumbnail-image")[0].style.backgroundImage = id_to_img(ex.id) && `${[id_to_img(url_to_id_sv(ex.id).id[0])].flat().map(i => `url("${i}")`).join(',')}`;
                }
                if (url_to_id_sv(ex.id).sv === "commons") {
                    const audio_el = El("audio").attr({ src: "https://commons.nicovideo.jp/api/preview/get?cid=" + ex.id.slice(2), controls: true, preload: "audio", style: "position: absolute; bottom: 0; width: 300px; height: 40px;" }).gen();
                    audio_el.onerror = function () { this.controls = false; };
                    (el => el && (el.parentNode.appendChild(audio_el), el.remove()))(media_template.get(".NC-MediaObject-bodySecondary")[0]);
                }
                const item_addition_btn = media_template.get(".MylistItemAddition-edit")[0];
                item_addition_btn.onclick = () => {
                    item_addition_btn.classList.toggle("MylistItemAddkition-edit_is-editing");
                    item_addition_btn.style.backgroundImage = (item_addition_btn.style.backgroundImage || document.defaultView.getComputedStyle(item_addition_btn).backgroundImage);
                    if (item_addition_btn.classList.contains("MylistItemAddkition-edit_is-editing")) {
                        item_addition_btn.style.backgroundImage = item_addition_btn.style.backgroundImage.replace("2NjY2NjYy", "zAwODBmZi");//メモ編集ボタンを青く
                        media_template.get(".MylistItemAddition")[0].appendChild(El("section", { class: "TextField EditableField MylistItemMemo MylistItemAddition-memo MylistItemMemo-edit" }, [
                            El("div", { class: "TextField-input" }, [
                                El("textarea", [media_template.get(".MylistItemMemo-preview")[0].innerText]).attr({ type: "textarea", class: "TextField-inputForm", name: "memo", style: "height: 80px;" })
                            ]),
                            El("div", { class: "TextField-footer" }, [
                                El("button", ["保存"]).class("TextField-footerButton TextField-saveButton"),
                                El("button", ["キャンセル"]).class("TextField-footerButton TextField-cancelButton")
                            ])
                        ]).gen());
                        media_template.get(".TextField-footerButton").map(e =>
                            e.onclick = () => {
                                if (e.classList.contains("TextField-saveButton")) {
                                    saveMemo(media_name, i);
                                }
                                item_addition_btn.click();
                            }
                        );
                    } else {
                        item_addition_btn.style.backgroundImage = item_addition_btn.style.backgroundImage.replace("zAwODBmZi", "2NjY2NjYy");//メモ編集ボタンを通常に
                        media_template.get(".MylistItemAddition")[0].appendChild(El("span", { class: "AutoLinkText EditableField MylistItemMemo MylistItemAddition-memo MylistItemMemo-preview" }, [media_template.get(".TextField-inputForm")[0].value]).gen());
                    }
                    media_template.get(".MylistItemMemo")[0].remove();
                };
                media_template.get(".ThreePointMenu-button")[0].onclick = () => { openMediaMenu(media_name, ex.id) };
                media_template.get(".ExListUp")[0].onclick = () => { exlistUpDown(media_name, true); };
                media_template.get(".ExListUp")[0].onmouseover = media_template.get(".ExListUp")[0].onmouseout = function (e) { this.style.backgroundColor = e.type === "mouseover" ? "#eee" : "#fff0"; };
                media_template.get(".ExListDown")[0].onclick = () => { exlistUpDown(media_name, false) };
                media_template.get(".ExListDown")[0].onmouseover = media_template.get(".ExListDown")[0].onmouseout = function (e) { this.style.backgroundColor = e.type === "mouseover" ? "#eee" : "#fff0"; };
                const checkbox = media_template.get(".Checkbox-input")[0];
                checkbox.onclick = () => {
                    const { true: checked, false: unchecked } = exlist_container.get(".VideoMediaObjectList")[0].get(".Checkbox-input").reduce((acc, e) => ({ [e.checked]: [...acc[e.checked], e.id], [!e.checked]: acc[!e.checked] }), { true: [], false: [] });
                    document.get("#VideoListEditMenu-isAllChecked")[0].checked |= checkbox.checked;
                    checkCheck(checked);
                };
            });
            media_obj_list_el.className = "VideoMediaObjectList";
        }
    });
}
const checkCheck = checked => {
    const vlem = document.get(".VideoListEditMenu")[0];
    if (checked.length) {
        document.get("#VideoListEditMenu-isAllChecked")[0].checked = true;
        vlem.get(".Checkbox-label")[0].innerText = checked.length + "件選択中";
        vlem.get(".VideoListEditMenu-delete")[0].classList.remove("VideoListEditMenuButton_disable");
        vlem.get(".MylistVideoListEditMenu-register")[0].classList.remove("VideoListEditMenuButton_disable");
    } else {
        document.get("#VideoListEditMenu-isAllChecked")[0].checked = false;
        vlem.get(".Checkbox-label")[0].innerText = "すべて選択";
        vlem.get(".VideoListEditMenu-delete")[0].classList.add("VideoListEditMenuButton_disable");
        vlem.get(".MylistVideoListEditMenu-register")[0].classList.add("VideoListEditMenuButton_disable");
    }
}
const ext_some = names => {
    const media_obj_list_el = document.get(".ExlistContainer")[0].get(".VideoMediaObjectList")[0];
    chrome.storage.local.get(exls_default, item => {
        const exlists = item.exlists;
        [names].flat().map(name => {
            const media_obj_el = media_obj_list_el.get(".ExMedia" + name)[0];
            const index = prevCount(media_obj_el);
            media_obj_el.remove();
            exlists[listid].list.splice(index, 1);
        });
        chrome.storage.local.set({ exlists: exlists });
        is_exls_imgload = 0;
        document.get(".MylistHeader-metaItemValue")[0].innerText = exlists[listid].list.length;
    });
};
/*list_image------*/
const exls_canvas = El("canvas").attr({ id: "exls-canvas" }).gen();
const exls_ctx = exls_canvas.getContext("2d");
const exls_svimg = El("img").attr({ id: "exls-save-img", style: "width: 100%; height: 100%;", alt: "読み込み中..." }).gen();
const save_link = El("a", ["保存する"]).attr({ href: "", id: "exls-save-btn", download: "exlist", style: "text-decoration: underline;" }).gen();
let is_exls_imgload = 0;
const split_chars = ["e01a", "e01b", "e020"].map(c => String.fromCharCode(parseInt(c, 16)));
const str_to_image = str => (code => (s => {
    let arr = [];
    for (let i = 0; i < s.length; i += 6) {
        arr.push((s.substr(i, 6) + "00000").substr(0, 6));
    }
    return arr.join('');
})(code.split('').reduce((acc, v) =>
    [...acc, ...[Math.floor(parseInt(v, 16) / 4), parseInt(v, 16) % 4].map(i => ("0" + (i * 85).toString(16)).slice(-2))], []).join('')
))(str.split('').map(s => ("0000" + s.charCodeAt().toString(16)).slice(-4)).join(''));
const reload_canvas = () => {
    exls_svimg.src = "";
    const listid = parseInt((document.URL.match(/ex\d+/g) || ["ex0"])[0].slice(2), 10);
    chrome.storage.local.get(exls_default, item => {
        const exlists = item.exlists;
        let img = str_to_image(
            exlists[listid].name
            + split_chars[0]
            + exlists[listid].list.map(l => l.id + split_chars[2] + l.label).join(split_chars[1])
            + split_chars[0]
            + "El001*"
        );
        exls_canvas.width = 200;
        exls_canvas.height = Math.max(Math.ceil(img.length / 6 / exls_canvas.width), 4);

        let imgd = exls_ctx.getImageData(0, 0, exls_canvas.width, exls_canvas.height);
        let pix = imgd.data;

        [...pix].map((_, i) => pix[i] = (i % 4 != 3 ? parseInt("00" + img.substr((i - Math.floor(i / 4)) * 2, 2), 16) + 0 : 255));
        [...pix].map((_, i) => i % 4 != 3 ? parseInt("00" + img.substr((i - Math.floor(i / 4)) * 2, 2), 16) + 0 : 255)
        exls_ctx.putImageData(imgd, 0, 0);

        save_link.href = exls_svimg.src = exls_canvas.toDataURL();
        save_link.download = exlists[listid].name;
        is_exls_imgload = 1;
    });
};
const image_to_str = img => (code => {
    str = "";
    for (let i = 0; i < code.length; i += 4) {
        str += String.fromCharCode(parseInt((code + "00000").substr(i, 4), 16));
    }
    return str;
})((im => {
    let arr = im;
    let str = "";
    for (let i = 0; i < arr.length; i += 1) {
        str += ("0" + Math.floor(arr[i] / 64).toString(2)).slice(-2);
    }
    let nstr = "";
    for (let i = 0; i < str.length; i += 4) {
        nstr += parseInt((str + "0000").substr(i, 4), 2).toString(16);
    }
    return nstr;
})(img));
const load_exls = url => {
    exls_svimg.src = url;
    exls_svimg.onload = _ => {
        exls_canvas.height = Math.round(exls_svimg.naturalHeight * 200 / exls_svimg.naturalWidth);
        exls_ctx.drawImage(exls_svimg, 0, 0, 200, Math.round(exls_svimg.naturalHeight * 200 / exls_svimg.naturalWidth));

        let imgd = exls_ctx.getImageData(0, 0, exls_canvas.width, exls_canvas.height);
        let pix = imgd.data;
        let img = [...pix].map((c, i) => i % 4 != 3 ? c : "x").filter(v => v != "x");
        let str = image_to_str(img);
        let [meta, stat] = (splited => { return [splited.slice(-1)[0], { name: splited[0], list: splited.slice(1, -1).join(split_chars[0]).split(split_chars[1]) }]; })(str.split(split_chars[0]));
        console.log("original: ", str, "meta: ", meta, "stat: ", stat);

        if (meta.match(/^El\d+\*.*/)) {
            chrome.storage.local.get(exls_default, item => {
                const exlists = item.exlists;
                const exlist = exlists[parseInt((document.URL.match(/ex\d+/g) || ["ex0"])[0].slice(2), 10)];
                exlist.list = stat.list.map(idlbl => (splited => ({ id: splited[0], label: splited[1] }))(idlbl.split(split_chars[2])));
                exlist.name = stat.name;
                chrome.storage.local.set({ exlists: exlists });
                gen_media_objs();
            });
        } else {
            console.log("規格外の画像が読み込まれました");
        }
        exls_svimg.onload = () => { };
        is_exls_imgload = 0;
    };
};
/*------list_image*/

chrome.runtime.onMessage.addListener((m, _, sendRes) => {
    if (m.type === "tag_link") {
        tag_link = m.tag_link;
        ext_tag_link();
        if (tag_link) gen_tag_link();
    } else if (m.type === "ichiba_tab") {
        chrome.storage.local.get({ ichiba_tab: true }, item => {
            if (item.ichiba_tab) {
                if (document.get(".PlayerPanelContainer-tabItem").length === 2) {
                    gen_ichiba_tab();
                }
            } else {
                if (document.get(".PlayerPanelContainer-tabItem").length !== 2) {
                    let newtab = document.get(".PlayerPanelContainer-tabItem").pop();
                    newtab.click();
                    if (document.get(".PlayerPanelContainer-content")[0].get(".IchibaContainer").length) {
                        let ichiba_container = document.get(".IchibaContainer")[0];
                        document.get(".BottomMainContainer")[0].children[0].appendChild(ichiba_container);
                        ichiba_container.style = "";
                        ichiba_container.classList.add("Card");
                        ichiba_container.classList.remove("WatchRecommendation-inner");
                        ichiba_container.get(".Card-main")[0].style = "";
                    }
                    if (document.get(".PlayerPanelContainer-tabItem").length > 2) {
                        document.get(".PlayerPanelContainer-tab")[0].removeChild(newtab).removeEventListener("click");
                    }
                    document.get(".PlayerPanelContainer-content")[0].removeChild(document.get(".IchibaPanelContainer")[0]);
                }
            }
        });
    } else if (m.type === "quote_list") {
        if (document.get(".Series").length) {
            chrome.storage.local.set({
                qtlist: {
                    name: document.title.match(/((?<=^「).*(?=（全\d+件）」))/g)[0],
                    list: document.get(".NC-Link").reduce((acc, val) =>
                        [...acc, { id: val.href.split("/").pop(), label: val.get("h2")[0].innerText }]
                        , []
                    )
                }
            });
        } else if (document.URL.match(/^https?:\/\/www.nicovideo.jp\/(my|user\/\d+)\/mylist\/\d+/) && !document.get(".ErrorState-title").length) {
            chrome.storage.local.set({
                qtlist: {
                    name: (el => el ? el.innerText : "")(document.get(".MylistHeader-name")[0]),
                    list: document.get(".NC-MediaObject-contents").map(l => l.href.split("/").pop()).reduce((acc, val, idx) =>
                        [...acc, { id: val, label: document.get(".NC-MediaObjectTitle").map(l => l.innerText)[idx] }]
                        , [])
                }
            });
        } else if (document.URL.match(/^https?:\/\/www.nicovideo.jp\/(my|user\/\d+)\/video/) && !document.get(".NC-MediaObject-contents").length) {
            chrome.storage.local.set({
                qtlist: {
                    name: (el => el ? el.innerText : "")(document.get(".UserDetailsHeader-nickname")[0]),
                    list: document.get(".NC-MediaObject-contents").map(l => l.href.split("/").pop()).reduce((acc, val, idx) =>
                        [...acc, { id: val, label: document.get(".NC-MediaObjectTitle").map(l => l.innerText)[idx] }]
                        , []
                    )
                }
            });
        } else if (document.URL.match(/^https?:\/\/seiga.nicovideo.jp\/(my\/)?clip/)) {
            chrome.storage.local.set({
                qtlist: {
                    name: (el => el[0] ? el[0].firstElementChild.innerText : el[1] ? el[1].firstElementChild.innerText : "")([document.get(".title_text")[0], document.get(".ttl_text")[0]]),
                    list: document.get(".text_ttl").reduce((acc, val) =>
                        [...acc, { id: val.firstElementChild.href.split("/").pop(), label: val.firstElementChild.innerText }]
                        , []
                    )
                }
            });
        }
    } else if (m.type === "res") {
        const media_obj_el = (document.get(".ExMedia" + m.obj_name) || [])[0];
        if (media_obj_el) {
            if (m.mode === "douga") {
                if (m.status === "success") {
                    media_obj_el.get(".NC-MediaObjectTitle")[0].innerHTML = m.title;
                    const thumb = media_obj_el.get(".NC-Thumbnail-image")[0];
                    thumb.style.backgroundImage = m.thumbnail && `url("${m.thumbnail}")`;
                    media_obj_el.get(".NC-VideoLength")[0].innerText = m.length;
                    media_obj_el.get(".NC-VideoMediaObject-description")[0].innerHTML = m.description;
                    media_obj_el.get(".NC-VideoRegisteredAtText-text")[0].innerText = m.firetri.replace(/T/g, " ").replace(/-/g, "/").replace(/\+.+/g, "");
                    media_obj_el.get(".NC-VideoMetaCount_view")[0].innerText = parseInt(m.counters.view, 10).toLocaleString();
                    media_obj_el.get(".NC-VideoMetaCount_comment")[0].innerText = parseInt(m.counters.comment, 10).toLocaleString();
                    media_obj_el.get(".NC-VideoMetaCount_mylist")[0].innerText = parseInt(m.counters.mylist, 10).toLocaleString();
                }
            } else if (m.mode === "seiga") {
                if (m.status === "success") {
                    media_obj_el.get(".NC-MediaObjectTitle")[0].innerText = m.title;
                    const thumb = media_obj_el.get(".NC-Thumbnail-image")[0];
                    thumb.style.backgroundImage = m.thumbnail && `url("${m.thumbnail}")`;
                    media_obj_el.get(".NC-VideoMediaObject-description")[0].innerText = m.description;
                    media_obj_el.get(".NC-VideoRegisteredAtText-text")[0].innerText = m.created.replace(/-/g, "/");
                    media_obj_el.get(".NC-VideoMetaCount_view")[0].innerText = parseInt(m.counters.view, 10).toLocaleString();
                    media_obj_el.get(".NC-VideoMetaCount_comment")[0].innerText = parseInt(m.counters.comment, 10).toLocaleString();
                    media_obj_el.get(".NC-VideoMetaCount_mylist")[0].innerText = parseInt(m.counters.clip, 10).toLocaleString();
                }
            }
        }
    } else if (m.type === "apndExls") {
        url_to_id_sv(m.conturl).id[0] ? apndExls(m.index, url_to_id_sv(m.conturl).id[0], m.contlabel || url_to_id_sv(m.conturl).id[0]) : console.log("append exlist error on URL:" + m.conturl);
    }
    sendRes();
    return !0;
});

document.addEventListener('DOMContentLoaded', () => {
    if (document.URL.match(/^https?:\/\/www\.nicovideo\.jp\/my/)) {
        const myid = document.get(".UserDetailsHeader-accountID")[0] ? document.get(".UserDetailsHeader-accountID")[0].childNodes[1].textContent : "";
        if (myid) chrome.storage.local.set({ myid: myid });
    } else {
        const commonheader_observer = new MutationObserver(() => {
            commonheader_observer.disconnect();
            const myid = (img => img ? (i => i ? i.tagName == "IMG" ? i.src.split("/").pop().split(".jpg")[0] : "" : "")(img.pop()) : "")(document.get("#CommonHeader")[0].get("img"));
            if (myid !== "blank") chrome.storage.local.set({ myid: myid });
        });
        document.get("#CommonHeader")[0] ? commonheader_observer.observe(document.get("#CommonHeader")[0], { childList: true }) : commonheader_observer.disconnect();
    }
    if (document.URL.match(/^https?:\/.+\.nicovideo\.jp\/.*/)) {
        /*
        if (document.URL.match(/ranking|search/)) {
            const presskey = {};
            const over_el = [];
            const downfunc = e => {
                presskey[e.key] = true;
                console.log(over_el);
                if (over_el.length) {
                    if (checkKeys(presskey, 1, 2, 3, 4, 5)) {
                        chrome.storage.local.get(exls_default, item => {
                            (tooltip => {
                                tooltip.innerText = item.exlists[getKey(presskey, 1, 2, 3, 4, 5) - 1].name;
                                tooltip.style.left = over_el.slice(-1)[0].getBoundingClientRect().left + over_el.slice(-1)[0].clientWidth / 2 + "px";
                                tooltip.style.transform = "translateX(-50%)";
                            })([...document.get(".NC-WatchLaterButton-tooltip"), ...document.get(".Tooltip")].pop());
                        });
                    } else {
                        const tooltip = [...document.get(".NC-WatchLaterButton-tooltip"), ...document.get(".Tooltip")].pop();
                        tooltip && (tooltip.innerText = "あとで見る");
                    }
                }
            };
            document.addEventListener("keydown", downfunc);
            const upfunc = e => {
                presskey[e.key] = false;
                const tooltip = [...document.get(".NC-WatchLaterButton-tooltip"), ...document.get(".Tooltip")].pop();
                tooltip && (tooltip.innerText = "あとで見る");
            };
            document.addEventListener("keyup", upfunc);
            const checkKeys = (obj, ...keys) => keys.reduce((acc, key) => acc || obj[key], false);
            const clearObj = obj => Object.keys(obj).map(k => obj[k] = null);
            const getKey = (obj, ...keys) => keys.reduce((acc, key) => acc || (obj[key] && key + ""), null);
            document.addEventListener("click", e => {
                if (e.target.classList.contains("ExAddButton-button") && checkKeys(presskey, 1, 2, 3, 4, 5)) {
                    e.preventDefault();
                    const link_et_title = {
                        link: e.target.classList.contains("WatchLaterButton-button") ? e.target.parentNode.parentNode.get("a")[0].href : e.target.parentNode.parentNode.parentNode.parentNode.href,
                        title: e.target.classList.contains("WatchLaterButton-button") ? e.target.parentNode.parentNode.get(".thumb")[0].alt : e.target.parentNode.parentNode.get(".NC-Thumbnail-image")[0].getAttribute("aria-label")
                    };
                    console.log(getKey(presskey, 1, 2, 3, 4, 5) - 1, " / ", url_to_id_sv(link_et_title.link).id[0], " / ", link_et_title.title);
                }
                clearObj(presskey);
            });
            document.addEventListener("mouseover", changeTooltip);
        }*/
    }
    if (url_to_id_sv(document.URL).sv !== "another") {
        console.log("Here is niconicontents page.");
        const timeouts = [];
        document.addEventListener("keydown", e => {
            if (["input", "textarea"].includes(e.target.tagName.toLowerCase())) return;//文字入力中は避ける
            const list_keycode = Array.from(`!"#$%`).indexOf(e.key);
            if (~list_keycode) {
                chrome.storage.local.get(exls_default, item => {
                    const exlists = item.exlists;
                    if (exlists.length <= list_keycode) return;
                    exlists[list_keycode].list.push({ id: url_to_id_sv(document.URL).id[0], label: document.title.split(" - ").slice(0, -1).join(" - ") });
                    chrome.storage.local.set({ exlists: exlists });
                    if (url_to_id_sv(document.URL).sv === "douga") {
                        const notice = El("div", { class: "NoticeMessage GeneralNoticeContainer-message GeneralNoticeContainer-transition-enter-done" }, [
                            El("pre", [exlists[list_keycode].name + " に追加しました"])
                        ]).gen();
                        document.get(".GeneralNoticeContainer")[0].appendChild(notice);
                        setTimeout(() => notice.remove(), 2500);
                    } else {
                        timeouts.map(t => clearTimeout(t));
                        chrome.runtime.sendMessage({ type: "notice", mode: "append", seed: exlists[list_keycode].list.length });
                        timeouts.push(setTimeout(() => chrome.runtime.sendMessage({ type: "notice", mode: "remove" }), 1200));
                    }
                });
            }
        }, false);
    }
    if (document.URL.match(/^https?:\/\/www\.nicovideo\.jp\/watch\//)) {
        if (document.get(".ErrorMessage")[0]) return;
        const tag_observer = new MutationObserver(() => {
            ext_tag_link();
            if (tag_link) gen_tag_link();
        });
        const taglist = document.get(".TagList")[0];
        if (taglist) {
            tag_observer.observe(taglist, { childList: true });
            tag_border = taglist.childElementCount && document.get(".TagItem")[0].style.border;
            chrome.storage.local.get({
                tag_link: true
            }, items => {
                tag_link = items.tag_link;
                ext_tag_link();
                if (tag_link) gen_tag_link();
            });
        }
        document.get("#CommonHeader")[0].addEventListener('click', e => {
            if ((e.path || []).length <= 10 && (e.target.tagName || "").toLowerCase() !== "a")
                chrome.storage.local.get({ header_scroll: 2 }, item =>
                    scroll_p(parseInt(item.header_scroll))
                );
        });
        const panel_observer = new MutationObserver(() => {
            if (document.get(".PlayerPanelContainer")[0]) {
                panel_observer.disconnect();
            } else {
                return;
            }
            chrome.storage.local.get({ ichiba_tab: true }, item => {
                if (item.ichiba_tab) {
                    gen_ichiba_tab();
                }
            });
        });
        const mcpp = document.get(".MainContainer-playerPanel")[0];
        mcpp && panel_observer.observe(mcpp, { childList: true });
    } else if (document.URL.match(/https?:\/\/www\.nicovideo\.jp\/(my|user\/\d+)\/mylist\/(ex)?\d+/)) {
        const userpage_loaded = () => {
            if (document.URL.match(/https?:\/\/www\.nicovideo\.jp\/(my|user\/\d+)\/mylist\/ex\d+/)) {
                console.log(`load ${listid} of Exlist`);
                const exlist_container = El("div", { class: "ExlistContainer" }, [
                    El("header", { class: "MylistHeader" }, [
                        El("section", { class: "MylistHeader-section" }, [
                            El("h1", { class: "MylistHeader-name" }, ["ex"]),
                            El("div", { class: "MylistHeader-meta" }, [
                                El("span", { class: "MylistHeader-metaItem" }, ["全", El("span", { class: "MylistHeader-metaItemValue" }, ["0"]), "件"])
                            ])
                        ]),
                        El("div", { class: "MylistHeaderAction MylistHeader-action" }, [
                            El("button").attr({ class: "ShareButton MylistShareButton MylistHeaderAction-item" }),
                            El("div").class("ThreePointMenu-button")
                        ])
                    ]),
                    El("div", { class: "VideoListEditMenu MylistVideoListEditMenu MylistVideoListEditMenu_disable VideoListEditMenu_disable" }, [
                        El("div", { class: "Checkbox" }, [
                            El("input").attr({ class: "Checkbox-input", type: "checkbox", name: "VideoListEditMenu-isAllChecked", id: "VideoListEditMenu-isAllChecked" }),
                            El("label").attr({ class: "Checkbox-check", for: "VideoListEditMenu-isAllChecked" }),
                            El("label", { class: "Checkbox-label", for: "VideoListEditMenu-isAllChecked" }, ["すべて選択"])
                        ]),
                        El("div", [
                            El("menu", { class: "MylistVideoListEditMenu-additional" }, [
                                El("button", ["IDをコピーする"]).class("VideoListEditMenuButton MylistVideoListEditMenu-register VideoListEditMenuButton_disable")
                            ]),
                            El("span").class("VideoListEditMenu-divider"),
                            El("button", { class: "VideoListEditMenuButton VideoListEditMenu-delete VideoListEditMenuButton_disable" }, ["削除"])
                        ])
                    ]),
                    El("div").class("TempVideoMediaObjectList")
                ]).gen();
                const mylist_container = document.get(".MylistContainer")[0];
                El.appendChildren(mylist_container, exlist_container);
                exlist_container.get(".MylistShareButton")[0].addEventListener("click", openShare, false);
                exlist_container.get(".ThreePointMenu-button")[0].addEventListener("click", openHeaderMenu, false);
                document.get(".SubMenuLinkList")[0].addEventListener("click", () => exlist_container.remove(), false);//元からあるマイリスト一覧のクリックを検知
                const all_check = document.get("#VideoListEditMenu-isAllChecked")[0];
                all_check.onclick = () => {
                    let { true: checked, false: unchecked } = [...exlist_container.get(".VideoMediaObjectList")[0].get(".Checkbox-input")].reduce((acc, e) => ({ [e.checked]: [...acc[e.checked], e.id], [!e.checked]: acc[!e.checked] }), { true: [], false: [] });
                    if (document.get("#VideoListEditMenu-isAllChecked")[0].checked) {
                        unchecked.map(id => document.getElementById(id).checked = true);
                        exlist_container.get(".VideoListEditMenu")[0].get(".Checkbox-label")[0].innerText = (checked.length + unchecked.length) + "件選択中";
                    } else {
                        checked.map(id => document.getElementById(id).checked = false);
                        exlist_container.get(".VideoListEditMenu")[0].get(".Checkbox-label")[0].innerText = "すべて選択";
                    }
                    checked = [...exlist_container.get(".VideoMediaObjectList")[0].get(".Checkbox-input")].reduce((acc, e) => ({ [e.checked]: [...acc[e.checked], e.id], [!e.checked]: acc[!e.checked] }), { true: [], false: [] }).true;
                    checkCheck(checked);
                }
                const delete_btn = exlist_container.get(".VideoListEditMenu-delete")[0];
                delete_btn.onclick = () => {
                    const checked = [...exlist_container.get(".VideoMediaObjectList")[0].get(".Checkbox-input")].reduce((acc, e) => ({ [e.checked]: [...acc[e.checked], e.id], [!e.checked]: acc[!e.checked] }), { true: [], false: [] }).true;
                    if (checked.length && confirm(`${checked.length}件のコンテンツをリストから削除しますか？`)) {
                        ext_some(checked);
                        all_check.click();
                    }
                };
                const copy_btn = exlist_container.get(".MylistVideoListEditMenu-register")[0];
                copy_btn.onclick = () => {
                    const checked = [...exlist_container.get(".VideoMediaObjectList")[0].get(".Checkbox-input")].reduce((acc, e) => ({ [e.checked]: [...acc[e.checked], e.getAttribute("data-checkboxes-item-id")], [!e.checked]: acc[!e.checked] }), { true: [], false: [] }).true;
                    if (checked.length) {
                        navigator.clipboard.writeText([...new Set(checked)].join(" "));
                        all_check.click();
                    }
                };

                const container_loaded = () => {
                    document.get(".ErrorState")[0].style.display = "none";
                    gen_media_objs();
                };
                const mlcontainer_observer = new MutationObserver(() => {
                    mlcontainer_observer.disconnect();
                    container_loaded();
                });
                document.get(".ErrorState")[0] ? (mlcontainer_observer.disconnect(), container_loaded()) : mlcontainer_observer.observe(document.get(".MylistContainer")[0], { childList: true });
            } else {
                const container_loaded = () => {
                    if (document.get(".ErrorState-title").length) {
                        if (document.get(".ErrorState-title")[0].innerText.match(/非公開/)) {
                            const link_to_my = El("a", [...document.get(".ErrorState")[0].children]).attr({ href: document.URL.replace(/user\/\d+/g, "my"), style: "display: block;" }).gen();
                            document.get(".ErrorState")[0].appendChild(link_to_my);
                            link_to_my.style.backgroundColor = "#fff";
                            link_to_my.style.border = "5px solid #d3d3d3";
                        }
                    }
                };
                const mlcontainer_observer = new MutationObserver(() => {
                    mlcontainer_observer.disconnect();
                    container_loaded();
                });
                document.get(".ErrorState")[0] ? (mlcontainer_observer.disconnect(), container_loaded()) : mlcontainer_observer.observe(document.get(".MylistContainer")[0], { childList: true });
            }
        };
        const userpage_observer = new MutationObserver(() => { userpage_observer.disconnect(); userpage_loaded(); });
        const userpagemain = document.get(".UserPage-main")[0];
        userpagemain && userpage_observer.observe(userpagemain, { childList: true });
    } else if (document.URL.match(/^https?:\/\/seiga\.nicovideo\.jp\/seiga\/im\d+/)) {
        if (document.get(".error-wrapper")[0]) {
            return;
        }
        const tag_observer = new MutationObserver(() => {
            ext_tag_link();
            if (tag_link) gen_tag_link();
        });
        tag_observer.observe(document.get(".static")[0].get("ul")[0], { childList: true });
        tag_border = document.get(".tag")[0].style.border;
        chrome.storage.local.get({
            tag_link: true
        }, items => {
            tag_link = items.tag_link;
            ext_tag_link();
            if (tag_link) gen_tag_link();
        });
    }
});