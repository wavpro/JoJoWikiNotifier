function getFeedAsJSON() {
    return new Promise((resolve, reject) => {
        fetch("https://feed2json.albinhedwall.repl.co/?url=https://jojo-news.com/feed/")
            .then((response) => response.json())
            .then((response) => {
                resolve(response);
            })
    })
}

chrome.runtime.onInstalled.addListener(async (_details) => {
    let feed = await getFeedAsJSON();
    chrome.storage.local.set({ feed: feed }, () => {
        chrome.notifications.create("oninstall", {
            title: "Thanks for installing!",
            message: "You will now be notified whenever jojo-news.com publishes a new article!",
            priority: 1,
            silent: true,
            type: "basic",
            iconUrl: "./assets/JJBELogo.png"
        }, (_notificationId) => { })
    })
})

chrome.alarms.create("5", { periodInMinutes: 5 })
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "5") {
        getFeedAsJSON()
            .then((feed) => {
                chrome.storage.local.get("feed", (data) => {
                    if (data.feed.items[0].guid != feed.items[0].guid) {
                        chrome.notifications.create(feed.items[0].guid.substring(feed.items[0].guid.length - 4), {
                            title: "New article published by " + feed.items[0].author.name + "!",
                            message: '"' + feed.items[0].title + '"',
                            priority: 2,
                            type: "basic",
                            iconUrl: "./assets/JJBELogo.png"
                        }, (notificationId) => {
                            chrome.notifications.onClicked.addListener((_notificationId) => {
                                if (_notificationId === notificationId) {
                                    chrome.tabs.create({url: feed.items[0].guid})
                                }
                            })
                        })
                        chrome.storage.local.set({feed: feed}, () => {})
                    }
                })
            })
    }
})
