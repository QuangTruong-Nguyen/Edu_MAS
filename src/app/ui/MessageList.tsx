import { cn } from '@/lib/utils';
// import { Message } from '@ai-sdk/react';
import React from 'react'
import { Bot, CircleUserRound } from 'lucide-react';
import ReactMarkdown from 'react-markdown'
import Image from 'next/image';
import { useState } from 'react';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { Button } from '@/components/ui/button';
import PresentationTemplate from './PresentationTemplate'
import { Roboto } from '@next/font/google';

const roboto = Roboto({
    subsets: ["latin"], 
    weight: '400',
})

interface Message {
    role: 'agent' | 'user';
    timestamp: Date;
    content: string;
    session_id: string;
    project_id: string; 
    user_id: string; 
    type: string;
}

type Conversation = Message[];

// function addMessage(conversation: Conversation, role: 'agent' | 'user', text: string): Conversation {
//     const newMessage: Message = {
//         role: role,
//         timestamp: new Date(),
//         content: text,
//     };

//     return [...conversation, newMessage];
// }

type Props = {
    websocket: WebSocket | null;
    isConnected: boolean;
    messages: Message[]
}

const MessageList = ({websocket, isConnected, messages}: Props) => {
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const handleTemplateSelect = async (templateId: string) => {
        if (!websocket || !isConnected) {
            alert('Not connected to WebSocket server!');
            return;
        }

        try {
            const templateMessage = {
                type: 'template',
                template: templateId,
                timestamp: new Date().toISOString()
            };

            websocket.send(JSON.stringify(templateMessage));
            setSelectedTemplate(templateId);
        } catch (error) {
            console.error('Error sending template selection:', error);
            alert('Failed to send template selection. Please try again.');
        }
    };

    const handleExport = async () => {
        if (!websocket || !isConnected) {
            alert('Not connected to WebSocket server!');
            return;
        }

        try {
            const exportMessage = {
                export: true
            };

            websocket.send(JSON.stringify(exportMessage));
        } catch (error) {
            console.error('Error sending template selection:', error);
            alert('Failed to send template selection. Please try again.');
        }
    }


    if (!messages) return <></>
    
    console.log(messages);

    return (
        <main className={roboto.className}>
            <div className='flex flex-col gap-2 px-4'>
            {messages.map((message, index) => {
                if (message.type == "template") {
                    return(
                    <Drawer>
                        <DrawerTrigger>
                            <Button disabled={!isConnected}>
                                {isConnected ? 'Choose presentation template' : 'Connecting...'}
                            </Button>
                        </DrawerTrigger>
                        
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle>Presentation Templates</DrawerTitle>
                                <DrawerDescription>
                                    {isConnected
                                        ? 'Please choose one template which you like'
                                        : 'Please wait while connecting to server...'}
                                </DrawerDescription>
                            </DrawerHeader>
                            
                            <DrawerFooter>
                                <DrawerClose>
                                    <PresentationTemplate onSelectTemplate={handleTemplateSelect} />
                                </DrawerClose>
                            </DrawerFooter>
                        </DrawerContent>
                    </Drawer>
                    )
                } else if (message.type == "export") {
                    return (
                        <Button onClick={handleExport}>
                            Export to Google Classroom
                        </Button>
                    )
                } else {
                    // return (
                    //     <div className='flex flex-col gap-2 px-4'>
                    //         <div className="flex w-12 h-12 rounded-full p-1 items-center justify-center">
                    //             {message.role === 'user' && <CircleUserRound className='w-8 h-8' />}
                    //             {message.role === 'agent' && <Image src="/images/bot.gif"
                    //                                                     alt="Animated GIF"
                    //                                                     width={300} // Specify the desired width
                    //                                                     height={300} // Specify the desired height
                    //             />}
                    //         </div>

                    //         <div className={cn('flex p-4', {
                    //             'justify-end pl-10': message.role === 'user',
                    //             'justify-start pr-10': message.role === 'agent',
                    //         })}
                    //         >
                    //             <div className={cn(
                    //                 "rounded-lg px-3 text-sm text-justify py-1 shadow-md ring-1 ring-gray-900/10", {
                    //                     "bg-blue-600 text-white": message.role === 'user'
                    //                 })}>
                    //                 <ReactMarkdown>{message.content}</ReactMarkdown>
                    //             </div>
                    //         </div>
                    //     </div>
                    // )
                    let messageContent = null;
                if (message.role === 'user') {
                    messageContent = (
                        <div className={cn('flex p-4 justify-end pl-5')}>
                            <div className="rounded-lg px-3 text-md text-justify py-1 shadow-md ring-1 ring-gray-900/10 bg-blue-600 text-white">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        </div>
                    );
                } else if (message.role === 'agent') {
                    messageContent = (
                        <div className="flex flex-row items-start p-4 justify-start pr-5 gap-2">
                            <Image src="/images/bot.gif" alt="Bot" width={48} height={48} className="" />
                            <div className="text-md text-justify mt-3">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                        </div>
                    );
                } else if (message.role === 'processing') {
                    messageContent = (
                        <div className="flex flex-row items-start p-4 justify-start pr-5 gap-2 animate-pulse">
                            <Image src="/images/bot.gif" alt="Bot" width={48} height={48} className="" />
                            <div className="text-sm text-justify mt-3 italic bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent font-semibold select-none">
                                {message.content}<span className="animate-blink">...</span>
                            </div>
                        </div>
                    );
                } else {
                    messageContent = null;
                }
                return (
                    <div key={index} className='flex flex-col gap-2 px-4'>
                        {messageContent}
                    </div>
                );
                }
            })
            }
        </div>
        </main>
    );
}


export default MessageList;