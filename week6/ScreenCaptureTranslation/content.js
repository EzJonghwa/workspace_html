var startX, startY, endX, endY;
var selectionBox;
var isDragging = false;

//메시지 수신 대기
chrome.runtime.onMessage.addListener((req) => {
    if(req.action === 'startDrag'){
        document.body.style.cursor = 'crosshair'
        document.addEventListener('mousedown', startSelection);
        document.addEventListener('mousemove', drawSelection);
        document.addEventListener('mouseup', endSelection);
    }
});

function startSelection(event){
    isDragging = true;
    startX = event.clientX + window.scrollX;
    startY = event.clientY + window.scrollY;

    //선택 상자 초기화
    selectionBox = document.createElement('div');
    selectionBox.style.position = 'absolute';
    selectionBox.style.border = '2px dashed blue';
    selectionBox.style.backgroundColor = 'rgba(0, 0, 255, 0.3)';
    selectionBox.style.left = `${startX}px`;
    selectionBox.style.top = `${startY}px`;
    selectionBox.style.pointerEvents = 'none';
    document.body.appendChild(selectionBox);
}
function drawSelection(event){
    if(!isDragging)return;
    endX = event.clientX + window.scrollX;
    endY = event.clientY + window.scrollY;

    selectionBox.style.width = `${Math.abs(endX-startX)}px`;
    selectionBox.style.height = `${Math.abs(endY-startY)}px`;
    selectionBox.style.left = `${Math.min(startX, endX)}px`;
    selectionBox.style.top = `${Math.min(startY, endY)}px`;
}
function endSelection(){
    if(!isDragging)return;
    isDragging = false;
    try{
        chrome.runtime.sendMessage({action:"captureVisibleTab"},(res)=>{
            if(chrome.runtime.lastError || !res.imageUri){
                console.log("캡쳐 요청 실패:" ,chrome.runtime.lastError);
                return;
            }
            const imageUri = res.imageUri
            // 이미지를 로드하여 선택 영역으로 자름
            let image = new Image();
            image.src= imageUri
            image.onload =()=>{
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                // 선택 여역 크기를 캔버스에 그림
                const w = Math.abs(endX - startX);
                const h = Math.abs(endY - startY);
                canvas.width =w;
                canvas.height =h;
                const x = Math.min(startX, endX);
                const y = Math.min(startY, endY);
                ctx.drawImage(image, x , y , w , h , 0 , 0 , w , h);
                // 서버로 전송
                canvas.toBlob((blob)=>{
                    const formData = new FormData();
                    formData.append('image', blob, 'capture.png');
                    fetch("http://localhost:5000/ocr",{
                        method:'POST',
                        body:formData
                    })
                    .then(res=>res.json())
                    .then(data =>{
                        alert("번역 내용 :" +data.translation);
                    })
                    .catch(e => console.error('error:',e));
                
                }, 'image/png');
            };

        });
        //선택영역
    }finally{
        document.body.style.cursor = 'default';
        if(selectionBox){
            document.body.removeChild(selectionBox);
            selectionBox = null;
        }
        document.removeEventListener('mousedown', startSelection);
        document.removeEventListener('mousemove', drawSelection);
        document.removeEventListener('mouseup', endSelection);
    }
}