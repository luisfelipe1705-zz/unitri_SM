'use strict';

var FileUploadInput = document.querySelector('#FileUploadInput');
var messageForm = document.querySelector('#messageForm');
var linkFile = null;

function uploadSingleFile(file) {
    var formData = new FormData();
    formData.append("file", file);

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8081/uploadFile", false);

    xhr.onload = function() {
        var response = JSON.parse(xhr.responseText);
        console.log(xhr.responseText);
        linkFile = response.fileType + "+" + response.fileDownloadUri;
        console.log(linkFile);
        if(xhr.status == 200) {
            console.log("Sucesso ao carregar o arquivo");

        } else {
            console.log((response && response.message) || "Some Error Occurred");
        }
    }

    xhr.send(formData);
}

function uploadMultipleFiles(files) {
    var formData = new FormData();
    for(var index = 0; index < files.length; index++) {
        formData.append("files", files[index]);
    }

    var xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:8081/uploadMultipleFiles", false);

    xhr.onload = function() {
        console.log(xhr.responseText);
        var response = JSON.parse(xhr.responseText);
        linkFile = "";
        for(var i = 0; i < response.length; i++) {
            linkFile = response[i].fileType + "+" + response[i].fileDownloadUri + "++" + linkFile;
        }
        console.log(linkFile);

        if(xhr.status == 200) {
            console.log("Sucesso ao carregar o arquivo");
        } else {
            console.log((response && response.message) || "Some Error Occurred");
        }
    }

    xhr.send(formData);
}

function sendFile(event) {
    var files = FileUploadInput.files;

    if (files.length > 1) {
        uploadMultipleFiles(files);
    }
    else {
        uploadSingleFile(files[0]);
    }

    messageForm.reset();

    event.preventDefault();
}