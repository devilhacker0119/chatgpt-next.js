import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'

export default function Home() {


  const scrollContainer = useRef(null);

  const [messageText, setMessageText] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [userChat, setUserChat] = useState<string[]>([]);
  const [botChat, setBotChat] = useState<string[]>([]);


  const botResponse = async () => {
    setIsLoading(true);
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messageText,
      }),
    });
    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    let botReply = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const botMessage = decoder.decode(value);
      botReply += botMessage;
    }
    console.log(botReply)
    setBotChat([...botChat, botReply]);
    setIsLoading(false);
  }

  const handleScroll = (ref: any) => {
    ref.scrollTo({
      top: ref.scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  };

  const sendMessage = () => {
  
    botResponse();
    setUserChat((messageText.trim().length === 0) ? userChat : [...userChat, messageText]);
    
    setMessageText("");
  }

  const handleEnterKey = (e: any) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      sendMessage();
    }
  }

  useEffect(() => {
    handleScroll(scrollContainer.current);
  }, [messageText])

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h1 className="text-3xl font-bold text-sky-400 text-center pt-12">
          Next.js with ChatGPT
        </h1>
        <p className='py-4 text-xl font-bold text-sky-400 text-center'>If you discover any issue, please feel free to contact me.</p>
        <div className='bg-sky-100'>
          <div className='container mx-auto px-12 max-sm:px-6 py-6 overflow-auto h-[72vh] chat-container' ref={scrollContainer}>
            {userChat.map((ele, key) => {
              return (
                <div key={`blockchat-${key}`}>
                  <div key={`userchat-${key}`} className='flex flex-col gap-2 items-end justify-center'>
                    <div className='bg-[#efffde] rounded-2xl px-6 py-2 max-w-[50%] break-words'>{ele}</div>
                  </div>
                  {botChat[key] && <div key={`botchat-${key}`} className='flex flex-col gap-2 items-start justify-center break-words'>
                    <div className='bg-white rounded-2xl px-6 py-2 max-w-[50%]'>{botChat[key]}</div>
                  </div>}
                  {/* {isLoading && } */}
                </div>
              )
            })}
          </div>
        </div>

        <div className='container mx-auto px-12 max-sm:px-2 flex justify-center '>
          <div className="relative w-1/2 flex items-start py-6 max-xl:w-full flex justify-center max-md:flex-col max-md:items-center gap-4">
            <textarea value={messageText} onChange={e => setMessageText(e.target.value)} onKeyUp={handleEnterKey}
              className="outline-none bg-sky-50 border border-sky-300 text-sky-900 w-full h-14 px-6 py-3"
              placeholder="PLEASE TYPE YOUR TEXT HERE ..." />
            <button className='bg-sky-500 rounded-full text-white text-3xl font-black px-6 py-2 active:translate-y-1' onClick={sendMessage}>
              Send
            </button>
          </div>

        </div>
      </main>
    </>
  )
}
