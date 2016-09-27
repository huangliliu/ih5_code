import {globalToken} from '../stores/WidgetStore'
var progressFn=function(evt){
    //let oProgress=document.getElementById('ant-progress');
    //oProgress.style.display='block';
    console.log('progress');
    //if (evt.lengthComputable) {
    //    var percentComplete = Math.round(evt.loaded * 100 / evt.total);
    //    console.log(percentComplete);
    //    oProgress.childNodes[0].innerHTML= '�ϴ��� '+percentComplete+'%';
    //    oProgress.childNodes[0].style.width=percentComplete+'%';
    //}else {
    //    console.log('failed');
    //}
}
var chooseFileCallback = (w)=> {  //tag
    if (w.files.length > 0) {
        var allowExt = null;
        if (w.userType == 'font') {
            allowExt = ['ttf', 'otf'];
        } else if (w.userType == 'image') {
            allowExt = ['png', 'jpg', 'jpeg', 'gif'];
        } else if (w.userType == 'imagelist') {
            allowExt = ['zip'];
        } else if (w.userType == 'zip') {
            allowExt = ['zip'];
        } else if (w.userType == 'video') {
            allowExt = ['mov', 'mp4', 'avi'];
        } else {
            return;
        }
        var name = w.files[0]['name'];
        var dot = name.lastIndexOf('.');
        if (dot <= 0)
            return;
        var ext = name.substr(dot + 1);
        if (!allowExt || allowExt.indexOf(ext) >= 0) {
            if (w.userUpload) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', 'app/uploadFile');
                if (globalToken){
                    xhr.setRequestHeader('Authorization', 'Bearer {' + globalToken + '}');
                }

                var form = new FormData();
                form.append('type', w.userType);
                form.append('file', w.files[0]);


                console.log('tag1')
                xhr.upload.onprogress=progressFn;
              //  xhr.upload.addEventListener("progress", progress);

                if (typeof xhr.upload.onprogress !== 'function') {
                   console.log('tag2');
                }else{
                    console.log('tag3');
                }
                xhr.send(form);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        w.userCallback(w, xhr.responseText);
                    }
                };
            } else {
                w.userCallback(w, ext);
            }
        }
    }
};



var chooseFile = (type, upload, callback) => {
    var w = document.getElementById('upload-box');
    w.value = '';
    w.userType = type;
    w.userUpload = upload;
    w.userCallback = callback;
    w.sysCallback = chooseFileCallback;
    w.click();
};

export {chooseFile};


