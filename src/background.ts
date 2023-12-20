// chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
//   //   tab({ received: true });
//   if (changeInfo.status === "complete" && tab.url?.match(/chzzk.naver.com/gi)) {
//     console.log("onup", tabId, changeInfo, tab);
//     chrome.tabs.sendMessage(tabId, { type: "REFRESH" }, (res) =>
//       console.log("SEND", res)
//     );
//   }
//   //   else if (changeInfo.status === "complete") {
//   //     chrome.tabs.sendMessage(tabId, { type: "REFRESH" });
//   //   }
// });

// // chrome.webNavigation.onHistoryStateUpdated.addListener(function (details) {
// //   console.log("de", details);
// //   if (details.frameId === 0) {
// //     chrome.tabs.get(details.tabId, function (tab) {
// //       if (tab.status == "complete") {
// //         chrome.tabs.sendMessage(details.tabId, { type: "REFRESH" });
// //       }
// //     });
// //   }
// // });
