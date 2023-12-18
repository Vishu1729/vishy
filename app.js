let backendUrl = location.protocol === 'file:' ? "https://tiktok-chat-reader.zerody.one/" : undefined;
let connection = new TikTokIOConnection(backendUrl);

let viewerCount = 0;
let likeCount = 0;
let diamondsCount = 0;

if (!window.settings) window.settings = {};

$(document).ready(() => {
    $('#connectButton').click(connect);
    $('#uniqueIdInput').on('keyup', function (e) {
        if (e.key === 'Enter') connect();
    });
    if (window.settings.username) connect();
});

function connect() {
    let uniqueId = window.settings.username || $('#uniqueIdInput').val();
    if (uniqueId !== '') {
        $('#stateText').text('Connecting...');
        connection.connect(uniqueId, { enableExtendedGiftInfo: true }).then(state => {
            $('#stateText').text(`Connected to roomId ${state.roomId}`);
            viewerCount = 0; likeCount = 0; diamondsCount = 0;
            updateRoomStats();
        }).catch(errorMessage => {
            $('#stateText').text(errorMessage);
            if (window.settings.username) {
                setTimeout(() => connect(window.settings.username), 30000);
            }
        });
    } else alert('no username entered');
}

function sanitize(text) { return text.replace(/</g, '&lt;'); }

function updateRoomStats() {
    $('#roomStats').html(`Viewers: <b>${viewerCount.toLocaleString()}</b> Likes: <b>${likeCount.toLocaleString()}</b> Earned Diamonds: <b>${diamondsCount.toLocaleString()}</b>`);
}

function generateUsernameLink(data) {
    return `<a class="usernamelink" href="https://www.tiktok.com/@${data.uniqueId}" target="_blank">${data.uniqueId}</a>`;
}

function addChatItem(color, data, text, summarize) {
    let container = location.href.includes('obs.html') ? $('.eventcontainer') : $('.chatcontainer');
    let currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    if (container.find('div').length > 50000) {
        container.find('div').slice(0, 25000).remove();
    }
    container.find('.temporary').remove();
    container.append(`
        <div class=${summarize ? 'temporary' : 'static'}>
            <img class="miniprofilepicture" src="${data.profilePictureUrl}">
            <span><b>${generateUsernameLink(data)}:</b></span>
            <span class="timestamp">${currentTime}/</span>
            <span style="color:${color}">${sanitize(text)}</span>
        </div>
    `);
    container.stop().animate({ scrollTop: container[0].scrollHeight }, 400);
}

connection.on('chat', (msg) => {
    if (window.settings.showChats === "0") return;
    addChatItem('', msg, msg.comment);
});

// Add viewer count update event listener
connection.on('roomUser', (data) => {
    if (typeof data.viewerCount === 'number') {
        viewerCount = data.viewerCount;
        updateRoomStats();
    }
});

// ... [other event listeners]
