/* global chrome */
import React, { useEffect } from 'react';
import './App.css';

function App() {
  useEffect(() => {
    const inputEl = document.getElementById("input-el");
    const saveInputBtn = document.getElementById("save-input-btn");
    const saveTabBtn = document.getElementById("save-tab-btn");
    const deleteAllBtn = document.getElementById("delete-all-btn");
    const ulEl = document.getElementById("ul-el");
    let urlArray = [];
    let listItems = "";

    
    const renderURLs = (urlAddedRecently) => {
      listItems += `
        <li>
          <a href='${urlAddedRecently}' target='_blank'>
            ${urlAddedRecently}
          </a>
        </li>
      `;
      ulEl.innerHTML = listItems;
    };

    
    const renderUrlsFromLocalStorage = () => {
      for(let i=0;i<urlArray.length;i++){
      listItems += `
        <li>
          <a href='${urlArray[i]}' target='_blank'>
            ${urlArray[i]}
          </a>
        </li>
      `;
      }
      ulEl.innerHTML = listItems;
    };

    let urlsFromLocalStorage = JSON.parse(localStorage.getItem("urlArray"));

    if(urlsFromLocalStorage){
      urlArray = urlsFromLocalStorage;
      renderUrlsFromLocalStorage();
    }

    const handleSaveClick = () => {
      if (saveInputBtn && ulEl) {
        const url = inputEl.value.trim();
        const formattedUrl = url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`;
        urlArray.push(formattedUrl);
        localStorage.setItem("urlArray",JSON.stringify(urlArray));
        renderURLs(formattedUrl);
        inputEl.value = "";
      }
    };

    const handleSaveTabClick = () => {
      console.log("Attempting to query tabs...");
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ action: "getActiveTab" }, function(response) {
          if (chrome.runtime.lastError) {
            console.error("Error querying tabs:", chrome.runtime.lastError.message);
            return;
          }

          const tab = response;
          if (tab && tab.url) {
            const tabUrl = tab.url;
            console.log("Tab URL:", tabUrl);
            urlArray.push(tabUrl);
            localStorage.setItem("urlArray", JSON.stringify(urlArray));
            renderURLs(tabUrl);
          } else {
            console.error("No active tabs found.");
          }
        });
      } else {
        console.error("chrome.runtime.sendMessage is not available.");
      }
    };


    const handleDeleteAllClick = () => {
      urlArray = [];
      localStorage.clear();
      listItems = "";
      ulEl.innerHTML = listItems;
    }



    if (saveInputBtn) {
      saveInputBtn.addEventListener("click", handleSaveClick);
    }
    if (saveTabBtn) {
      saveTabBtn.addEventListener("click", handleSaveTabClick);
    }
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener("click", handleDeleteAllClick);
    }

    // Cleanup event listener on component unmount
    return () => {
      if (saveInputBtn) {
        saveInputBtn.removeEventListener("click", handleSaveClick);
      }
      if (saveTabBtn) {
        saveTabBtn.removeEventListener("click", handleSaveTabClick);
      }
      if (deleteAllBtn) {
        deleteAllBtn.removeEventListener("click", handleDeleteAllClick);
      }
    };

  }, []);

  return (
    <div className="App">
      <input type="text" id="input-el" className='text-[1.03rem] border border-[#5f9341] input-focused w-full pl-3 pr-3 pt-2 pb-2 h-10 box-border' />
      <button id="save-input-btn" className='text-[1.03rem] border border-[#5f9341] bg-[#5f9341] text-white w-36 h-10 mt-3 mb-5 mr-2 button-focused'>
        SAVE INPUT
      </button>
      <button id="save-tab-btn" className='text-[1.03rem] border border-[#5f9341] bg-[#5f9341] text-white w-36 h-10 mt-3 mb-5 mr-2 button-focused'>
        SAVE TAB
      </button>
      <button id="delete-all-btn" className='text-[1.03rem] border border-[#5f9341] text-[#5f9341] w-36 h-10 mt-3 mb-5 button-focused'>
        DELETE ALL
      </button>
      <ul id="ul-el" className='text-[#5f9341] underline underline-offset-[4px]'></ul>
    </div>
  );
}

export default App;
