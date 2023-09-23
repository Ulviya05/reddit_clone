const BASE_URL = "http://127.0.0.1:5000"
const user_id = localStorage.getItem("id");

if(!user_id) {
    window.location.href = 'login.html';
}
else {
    // Add a request interceptor
    axios.interceptors.request.use(function (config) {
        config.headers.Authorization = user_id;
        return config;
    });
}

const urlParams = new URL(window.location.toLocaleString()).searchParams;
const reply_id = urlParams.get('reply_id') || "ALL";

function getMessages() {
    loading(true);
    setTimeout(() => {
        axios.get(`${BASE_URL}/message/${reply_id}`)
        .then(function (response) {
            loading(false);
            const { data } = response; 
            const messages = data.messages.map(el => {
                const message = makeMessage(el, "message");
                let replies = "";
                if(el.replies.length > 0) {
                    replies = `
                        <div class="replies">
                            <div class="line"><span>&nbsp;</span></div>
                            <div class="messages" id="message-${el._id}">
                                ${el.replies.map(el2 => {
                                    const reply_messages = makeMessage(el2, "reply")
                                    let reply_replies = "";
                                    if(el2.replies.length > 0) {
                                        reply_replies = `
                                            <div class="replies">
                                                <div class="line"><span>&nbsp;</span></div>
                                                <div class="messages">
                                                    ${el2.replies.map(el3 => {
                                                        const rep = makeMessage(el3, "reply")
                                                        let load_more = '';
                                                        if(el3.replies.length > 0) {
                                                            load_more = `<button class = "load" onclick="setParams('${el3._id}')">Load More</button>`
                                                        }
                                                        return rep + load_more;
                                                    }).join("")}
                                                </div>
                                            </div>
                                        `
                                    }
                                    return reply_messages + reply_replies
                                }).join("")}
                            </div>
                        </div>
                    `
                }
                return message + replies;
            });
            document.getElementById("start").innerHTML = messages.join("");
        })
    }, 500);
    
}

function makeMessage(el, type) {
    if (el.deleted) {
        return `
            <div class="message" id="${el._id}" data-type="${type}">
                deleted
            </div>
        `
    }
    // if (el.sign === "+") {
    //     $(`#plus-${id}`).addClass("disabled")
    // }
    // else if (el.sign === "-") {
    //     $(`#minus-${id}`).addClass("disabled")
    // }
    const vote = `
        <div class="vote">
            <div class="plus ${el.sign === "+" && "disabled-vote"}" id="plus-${el._id}" onclick="score('+', '${el._id}', '${type}', 'plus-${el.id}')">+</div>
            <div class="number">
                ${el.score}
            </div>
            <div class="minus ${el.sign === "-" && "disabled-vote"}" id="minus-${el._id}" onclick="score('-', '${el._id}', '${type}')">-</div>
        </div>
    `;
    let you = "";     
    if (el.user._id === user_id) {
        you = '<div class = "you">you</div>'
    }
    let top = `
        <div class="top">
            <div class="top-left">
                <div class="avatar">
                    <img src="${el.user.image}"
                        alt="${el.user.username}">
                </div>
                <div class="name" >${el.user.username}</div>
                ${you}
                <div class="time">${(new Date(el.createdAt)).toLocaleString()}</div>
            </div>
            <div class="top-right" id="top-right">
    `;
    if (el.user._id === user_id) {
        top += `<div class="pen_icon" onclick="edit_cont('${el._id}')" id="edit_icon-${el._id}"><i class="fa-solid fa-pen"></i></i></div>`
    }
    top += `
                <div class="reply_icon" onclick="comment_cont('${el._id}')" id="reply_icon-${el._id}"><i class="fa-solid fa-reply"></i></div>
            </div>
        </div>
    `
    const bottom = `
        <div class="bottom">
            <div class="message_container" id="cont-${el._id}">
                <div class="message_text">
                    <p>${el.content}</p>
                </div>
            </div>
        </div>
    `;
    const left = `
        <div class="left">
            ${top}
            ${bottom}
        </div>
    `;
    const message = `
        <div class="message" id="${el._id}" data-type="${type}">
            ${vote}
            ${left}
        </div>
    `;
    return message;
}

function score(sign, id, type, plus_id) {
    axios.post(`${BASE_URL}/message/score`, {
        sign, 
        message_id: id,
        user_id: localStorage.getItem("id"),
        type
    })
    .then(function (response) {
        console.log(response);
        const { data } = response;
        getMessages()
    });
}


function setParams(id) {
    function updateURLParameter(url, param, paramVal){
        var newAdditionalURL = "";
        var tempArray = url.split("?");
        var baseURL = tempArray[0];
        var additionalURL = tempArray[1];
        var temp = "";
        if (additionalURL) {
            tempArray = additionalURL.split("&");
            for (var i=0; i<tempArray.length; i++){
                if(tempArray[i].split('=')[0] != param){
                    newAdditionalURL += temp + tempArray[i];
                    temp = "&";
                }
            }
        }
    
        var rows_txt = temp + "" + param + "=" + paramVal;
        return baseURL + "?" + newAdditionalURL + rows_txt;
    }

    var newURL = updateURLParameter(window.location.href, 'reply_id', id);
    window.location = newURL;
}



// /localStorage.setItem("id", 56666)
// /localStorage.setItem("username", "gnom")

function send(type="message") {
    axios.post(`${BASE_URL}/message`, {
        content: $("#text").val(),
        user_id: localStorage.getItem("id"),
        type
    })
    .then(function (response) {
        console.log(response);
        const { data } = response; 
        getMessages()
    })
}

function reply(id) {
    axios.post(`${BASE_URL}/message/reply`, {
        reply_content: $(`#text-${id}`).val(),
        user_id:  localStorage.getItem("id"),
        message_id: id,
        type: $(`#${id}`).attr("data-type")
    })
    .then(function (response) {
        console.log(response);
        const { data } = response; 
        getMessages()
    })
}


 

function comment_cont(id) {
    
    $(`#${id}`).after(`
    <section id="comment_cont-${id}" class="comment_container">
    <div class="avatar">
    <img src=${ localStorage.getItem("image")}>
    </div>
    <div class="comment_text">
        <textarea name="" id="text-${id}" cols="30" rows="5" placeholder="Add a comment..." ></textarea>
    </div>
    <div class="send">
        <button type="button" onclick="reply('${id}')">REPLY</button>
    </div>
    </section>
    `)

    $(`#reply_icon-${id}`).addClass("disabled")
    
}


function edit_cont(id) {
    
    $(`#cont-${id}`).html(`
    
    <div class="comment_text" style="padding-left: 0">
        <textarea name="" id="etext-${id}" cols="30" rows="5" placeholder="Add a comment...">${$(`#${id} .left .bottom .message_container .message_text p`).text()}</textarea>
    </div>
   
    <div class="send">
        <button type="button" onclick="edit('${id}')">UPDATE</button>
    </div>

    `)

    $(`#reply_icon-${id}`).after(`
        <div class="trash_icon" onclick="delete_cont('${id}')"><i class="fa-solid fa-trash"></i></div>
    `)

    $(`#reply_icon-${id}`).html(``)
    $(`#comment_cont-${id}`).remove();

    $(`#edit_icon-${id}`).addClass("disabled")
}

function edit(id) {
    axios.put(`${BASE_URL}/message//${$(`#${id}`).attr("data-type")}/${id}`, {
        edited_content: $(`#etext-${id}`).val()
    })
    .then(function (response) {
        console.log(response);
        const { data } = response; ``
        getMessages()
    })
}

function delete_cont(id,type="message") {
    $(`#${id}`).html(`
        deleted
    `)

    axios.delete(`${BASE_URL}/message/${$(`#${id}`).attr("data-type")}/${id}`)
    .then(function (response) {
        console.log(response);
        const { data } = response;
        getMessages()
    })

}

function loading(show) {
    if(show) {
        $(".loading").show();
        $("body").css({"overflow": "hidden"})
    }
    else {
        $(".loading").hide();
        $("body").css({"overflow": "visible"})
    }
}

$("#avatar_id").attr("src", localStorage.getItem("image"));

getMessages();