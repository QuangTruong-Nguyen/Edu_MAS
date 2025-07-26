'use client'
import React, { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MessageList  from './MessageList'
import ResultTab from './ResultTab'

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
  } from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image'
import { todo } from 'node:test'
import { v4 } from 'uuid'
import { getCookie } from '@/utils';
import { Play, Loader2 } from 'lucide-react'


interface Message {
  messageId: string;
  role: 'agent' | 'user';
  timestamp: string;
  content: string;
  session_id: string;
  project_id: string; 
  user_id: string; 
  type?: string; // Optional field for type
}


type Conversation = Message[];


let result: {
  todoList: Array<{
      task_id: string;
      specific_requirements: string;
      status: string;
  }>,
  curriculum: {
      title: string;
      overview: string;
      modules: Array<{
          title: string;
          content: string;
          task_id: string;
      }>;
  } | null,
  lectureNotes: Array<{
    // filename: string;
    content: string;
    // url: string;
  }>,
  quizzes: Array<{
    question: string;
    option: string[];
    answer: string;
    explain: string;
    source: string;
  }>,
  presentationURL: Array<{
    name: string;
    url: string;
  }>
} = {
  todoList: [],
  curriculum: {
    title: '',
    overview: '',
    modules: []
  },
  lectureNotes: [],
  quizzes: [{
    question: '',
    option: [''],
    answer: '',
    explain: '',
    source: ''
  }],
  presentationURL: [{
    name: '',
    url: ''
  }]
};

type Props = {
    sessionId: string;
    project_id: string;}

const ChatComponent = ({ sessionId, project_id }: Props) => {
    const [ws, setWs] = useState<WebSocket | null>(null);
    const [messages, setMessages] = useState<Conversation>([]);
    const [messageText, setMessageText] = useState('');
    const messagesRef = useRef(messages);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isConnected, setIsConnected] = useState(false);
    const user_id = getCookie("userId");

    const [quizCreated, setQuizCreated] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isPaused, setIsPaused] = useState(false);



    useEffect(() => {
      fetch(`http://localhost:8000/messages?sessionId=${sessionId}`)
        .then(res => res.json())
        .then(data => setMessages(data))
        .catch(err => console.error(err))
    }, [sessionId]);

    // Get current messages state
    useEffect(() => {
      messagesRef.current = messages;
    }, [messages]);

  
    
    useEffect(() => {
        const WS_URL = typeof window !== 'undefined'
          ? `ws://${window.location.hostname}:8001/ws`
          : `ws://localhost:8001/ws`;
        
        const websocket = new WebSocket(WS_URL);
        setWs(websocket);

        websocket.onopen = () => setIsConnected(true);

        websocket.onmessage = (event) => {
          try {
            const parsedMessage = JSON.parse(event.data);

            const { messageId, content, role, timestamp, session_id } = messagesRef.current[messagesRef.current.length - 1];
            
            if (parsedMessage.event === 'quiz_created') {
                setQuizCreated(prev => prev + 1); // <-- thêm dòng này!
              }


            if (parsedMessage.hasOwnProperty("role")) {
              if (parsedMessage.messageId !== messageId) {
                    setMessages((prev) => [...prev, parsedMessage]);
              } else {
                  setMessages((prevMessages) => {
                    if (prevMessages.length === 0) return prevMessages;

                    const updatedMessages = [...prevMessages];
                    const lastIndex = updatedMessages.length - 1; 

                    updatedMessages[lastIndex] = {
                      ...updatedMessages[lastIndex],
                      content: updatedMessages[lastIndex].content + parsedMessage.content,
                    };
                  
                    return updatedMessages;
                  }); 
              }
            } else {
              result = parsedMessage;
            }
            setIsLoading(true); // Tắt loading khi nhận phản hồi
            setIsPaused(false); // Reset pause state
          } catch (error) {
            console.error('Error parsing message from server', error);
            setIsLoading(false); // Tắt loading nếu lỗi
            setIsPaused(false); // Reset pause state
          }
        };

        websocket.onclose = () => setIsConnected(false);
        websocket.onerror = () => setIsConnected(false);

        return () => {
          websocket.close();
        };
      }, [sessionId]);


    // Scroll to bottom when messages arrive
    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);
  
    const handleSendMessage = (e: React.FormEvent) => {
      e.preventDefault();
  
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        alert('Not connected to WebSocket server!');
        return;
      }

      const messageId = v4();
  
      if (messageText.trim()) {
        
        const message: Message = {
          messageId: messageId, 
          content: messageText,
          role: 'user', 
          timestamp: new Date().toISOString(),
          session_id: sessionId,
          project_id: project_id,
          user_id: user_id,
          type: 'text'
        };

        setMessages((prev) => [...prev, message]);
        ws.send(JSON.stringify(message));
        setMessageText('');
      }
    };

    const handleResumeAgent = () => {
      if (isLoading && !isPaused) {
        setIsPaused(true);
        // Có thể gửi signal pause đến server ở đây
        const pause = {
            "active": "pause" 
        }
      } else if (isLoading && isPaused) {
        setIsPaused(false);
        // Có thể gửi signal resume đến server ở đây
        const resume = {
          "active": "resume" 
        }
      }
    };

    return (
          <ResizablePanelGroup
            direction="horizontal"
            className="w-full h-screen max-h-screen rounded-lg"
          >
            <ResizablePanel 
                    defaultSize={60} minSize={40}
                    // className="h-full min-h-0"            
            >
              <div className="w-full h-full grid grid-rows-10 gap-4 p-4">
                <div className="">
                    <h3 className="text-lg text-slate-700 font-semibold">EduGen- MAS</h3>
                </div>

                {/* message list */}
                <ScrollArea className="border rounded-xl row-span-8">
                    <MessageList websocket={ws} isConnected={isConnected} messages={messages} />
                     <div ref={messagesEndRef} />
                </ScrollArea>
                
                {/* text area */}
                <div className="row-span-2">
                  <form onSubmit={(e) => handleSendMessage(e)} className="w-full flex flex-row items-center">
                     <Input value={messageText} onChange={(e) => setMessageText(e.target.value)} 
                            placeholder='Type your message ...' 
                            className="grow focus:border-2 focus:border-sky-500 ring-0 focus:ring-0 flex-row"
                     />
                     
                     <Button className={`w-10 h-10 flex-none ml-2 rounded-full ${
                          isLoading ? 'bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 animate-pulse' : 'bg-blue-500'
                     }`}
                            style={isLoading ? {animationDuration: '0.5s'} : {}}
                            onClick={handleResumeAgent}
                            type={isLoading ? "button" : "submit"}
                     >
                          {isLoading ? (
                            isPaused ? (
                              <Play className='w-4 h-4' />
                            ) : (
                              <Loader2 className='w-4 h-4 animate-spin' />
                            )
                          ) : (
                            <Send className='w-4 h-4' />
                          )}
                      </Button>
                 </form>
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle/>

            <ResizablePanel className="" defaultSize={40} minSize={40}>
                  <ResultTab result={result} websocket={ws} isConnected={isConnected} sessionId={sessionId} projectId={project_id} 
                              quizCreated={quizCreated} />
                  <div className="flex rounded-xl h-full items-center justify-center p-10">

                  </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        )
}

export default ChatComponent
