import { createRoot } from 'react-dom/client';
import './style.css';
import { LinkedInScraper } from './services/LinkedInScraper';
// Root div for React
const div = document.createElement('div');
div.id = '__root';
document.body.appendChild(div);

const rootContainer = document.querySelector('#__root');
if (!rootContainer) throw new Error("Can't find Content root element");
const root = createRoot(rootContainer);

function SidePanelButton() {
  const handleClick = () => {
    chrome.runtime.sendMessage({ action: 'openSidePanel' });
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-[60px] right-0 z-[100000000000000000000] p-2.5 border-none rounded-l-full cursor-pointer flex items-center justify-center w-[60px] h-[60px] bg-black opacity-100 hover:opacity-50 transition-opacity"
    >
      <img
        src={chrome.runtime.getURL('192.png')}
        alt="Side panel toggle"
        className="w-[30px] h-[30px]"
      />
    </button>
  );
}

// Render the button using React
root.render(<SidePanelButton />);

try {
  console.log('content script loaded');
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "scrapeJobData") {
      LinkedInScraper.scrapeJobData().then((data) => {
        console.log("Scraped Data:", data);
        sendResponse({ success: true, data });
      });
      return true;
    }
  });  
} catch (e) {
  console.error(e);
}
