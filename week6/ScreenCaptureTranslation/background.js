chorme.runtime.onMessage.addListener((req,sender,res)=>{
    if(req.action === "captureVisibleTab"){
        chrome.tabs.captureVisibleTab((imageUri)=>{
            res({imageUri});
        });
        return true;
    };
});