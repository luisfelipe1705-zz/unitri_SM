'use strict';

var usernamePage = document.querySelector('#username-page');
var chatPage = document.querySelector('#chat-page');
var usernameForm = document.querySelector('#usernameForm');
var messageForm = document.querySelector('#messageForm');
var messageInput = document.querySelector('#message');
var messageArea = document.querySelector('#messageArea');
var connectingElement = document.querySelector('.connecting');
var FileUploadInput = document.querySelector('#FileUploadInput');

var stompClient = null;
var username = null;

var colors = [
    '#2196F3', '#32c787', '#00BCD4', '#ff5652',
    '#ffc107', '#ff85af', '#FF9800', '#39bbb0'
];

function connect(event) {
    username = document.querySelector('#name').value.trim();

    if(username) {
        usernamePage.classList.add('hidden');
        chatPage.classList.remove('hidden');

        var socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);

        stompClient.connect({}, onConnected, onError);
    }
    event.preventDefault();
}


function onConnected() {
    
    stompClient.subscribe('/topic/public', onMessageReceived);

    
    stompClient.send("/app/chat.addUser",
        {},
        JSON.stringify({sender: username, type: 'JOIN'})
    )

    connectingElement.classList.add('hidden');
}


function onError(error) {
    connectingElement.textContent = 'Could not connect to WebSocket server. Please refresh this page to try again!';
    connectingElement.style.color = 'red';
}


function sendMessage(event) {
    var messageContent = messageInput.value.trim();
    if(messageContent && stompClient) {
        var chatMessage = {
            sender: username,
            content: messageInput.value,
            type: 'CHAT'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }
    event.preventDefault();
}

function sendMessageImage(linkImage) {
    console.log(linkImage);
    if(stompClient) {
        console.log("Entrei aki");
        var chatMessage = {
            sender: username,
            content: linkImage,
            type: 'CHAT_FILE'
        };
        stompClient.send("/app/chat.sendMessage", {}, JSON.stringify(chatMessage));
        messageInput.value = '';
    }

}


function onMessageReceived(payload) {
    console.log("Entrei aki 86");
    var message = JSON.parse(payload.body);

    var messageElement = document.createElement('li');

    if(message.type === 'JOIN') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' Entrou!!!';
    } else if (message.type === 'LEAVE') {
        messageElement.classList.add('event-message');
        message.content = message.sender + ' Saiu!!!';
    } else {
        messageElement.classList.add('chat-message');

        var avatarElement = document.createElement('i');
        var avatarText = document.createTextNode(message.sender[0]);
        avatarElement.appendChild(avatarText);
        avatarElement.style['background-color'] = getAvatarColor(message.sender);

        messageElement.appendChild(avatarElement);

        var usernameElement = document.createElement('span');
        var usernameText = document.createTextNode(message.sender);
        usernameElement.appendChild(usernameText);
        messageElement.appendChild(usernameElement);
    }

    if(message.type === 'CHAT_FILE') {
        var array = message.content.split("++");
        console.log(array);

        for (var i = 0; i <= array.length - 1; i++) {
            var arrayFile = array[i].split('+');
            if (arrayFile[0].split('/')[0] === 'image') {
                var textElement = document.createElement('p');
                var imgElement = document.createElement('img');
                imgElement.src = arrayFile[1];
                imgElement.classList.add("imgMessage");
                textElement.appendChild(imgElement);
                messageElement.appendChild(textElement);
                messageArea.appendChild(messageElement);
                messageArea.scrollTop = messageArea.scrollHeight;
            }
            else if (arrayFile[0].split('/')[0] === 'audio') {
                var textElement = document.createElement('p');
                var audioElement = document.createElement('audio');
                var sourceElement = document.createElement('source');
                sourceElement.src = arrayFile[1];
                sourceElement.type = arrayFile[0];
                audioElement.controls = true;
                audioElement.appendChild(sourceElement);
                textElement.appendChild(audioElement);
                messageElement.appendChild(textElement);
                messageArea.appendChild(messageElement);
                messageArea.scrollTop = messageArea.scrollHeight;
            }
            else if (arrayFile[0].split('/')[0] === 'video') {
                var textElement = document.createElement('p');
                var videoElement = document.createElement('video');
                var sourceElement = document.createElement('source');
                sourceElement.src = arrayFile[1];
                sourceElement.type = arrayFile[0];
                videoElement.controls = true;
                videoElement.appendChild(sourceElement);
                textElement.appendChild(videoElement);
                messageElement.appendChild(textElement);
                messageArea.appendChild(messageElement);
                messageArea.scrollTop = messageArea.scrollHeight;
            }

        }

    }
    else {
        var textElement = document.createElement('p');
        var messageText = document.createTextNode(message.content);
        textElement.appendChild(messageText);

        messageElement.appendChild(textElement);

        messageArea.appendChild(messageElement);
        messageArea.scrollTop = messageArea.scrollHeight;
    }

}

function getAvatarColor(messageSender) {
    var hash = 0;
    for (var i = 0; i < messageSender.length; i++) {
        hash = 31 * hash + messageSender.charCodeAt(i);
    }
    var index = Math.abs(hash % colors.length);
    return colors[index];
}

function receiveMessage (event) {
    var files = FileUploadInput.files;
    if(files.length === 0) {
        sendMessage(event);
    }
    else {
        sendFile(event);
        sendMessageImage(linkFile);
    }
}

usernameForm.addEventListener('submit', connect, true)
messageForm.addEventListener('submit', receiveMessage, true)