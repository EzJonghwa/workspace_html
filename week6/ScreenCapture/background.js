chrome.runtime.onInstalled.addListener(()=>{
    chrome.tabs.onUpdated.addListener((tabId,changeInfo,tab)=>{
        if(changeInfo.status === "complete" && tab.url){
            chrome.scripting.executeScript({
                target : {tabId : tabId},
                        files:["content.js"]
                
            })
            .then(()=> console.log('content script successfully'))
            .catch((error)=> console.log("faile",error))
        }
    })

})