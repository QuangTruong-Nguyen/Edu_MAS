'use client'
import { useState,useEffect } from "react";

import {
    Card, 
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'

import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

import React from 'react'
import ReactMarkdown from 'react-markdown'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"


import { List } from '@radix-ui/react-tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

import {
    ListTodo,    
    ScrollText,
    NotebookPen,
    Presentation,
    FileQuestion,
    MessageCircle,
    Loader2, 
    Hourglass,
    Check,
    Eye
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import Link from "next/link";
import path from "path";
import { FileText, ExternalLink } from "lucide-react";
import { FaFilePdf } from "react-icons/fa";
import { Progress } from '@/components/ui/progress';
import { getCookie } from '@/utils';
import { Roboto } from '@next/font/google';
import Image from 'next/image';
import PresentationViewer from './PresentationViewer';

const roboto = Roboto({
    subsets: ["latin"], 
    weight: '400',
})


// links_lecture: Array<string>;
// links_quiz: Array<string>;


type Props = {
    result: {
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
            }>
        } | null,
        
        lectureNotes: Array<{
           content: string;
        }>,

        quizzes: Array<{
            question: string;
            option: string[];
            answer: string;
            // explain: string;
            source: string;
        }>,

        presentationURL: Array<{
            name: string;
            url: string;
        }>,
        links_lecture: Array<string>;
        links_quiz: Array<string>;
    },
    websocket: WebSocket | null;
    isConnected: boolean;
    projectId?: string;
    sessionId?: string;
    quizCreated?: number;
    currentAgent?: string;
    agentProgress?: {
        [key: string]: {
            status: 'pending' | 'running' | 'completed' | 'error';
            message?: string;
            progress?: number;
        }
    };
}

// const [openPdfIndex, setOpenPdfIndex] = useState<number | null>(null);
const user_id = getCookie("userId");

const ResultTab = ({ 
    result = { 
                    todoList: [], 
                    curriculum: {title: '', overview: '', modules: []}, 
                    lectureNotes: [],
                    quizzes: [],
                    presentationURL: [],
                    links_lecture:[], 
                    links_quiz: []},
            websocket,
            isConnected,
            projectId,
            sessionId,
            quizCreated = 0,
            currentAgent = '',
            agentProgress = {}
             }:  Props) => {  //: Props

    // const [result, setResult] = useState({
    //                             todoList: [],
    //                             curriculum: { title: '', overview: '', modules: [] },
    //                             lectureNotes: [],
    //                             quizzes: [],
    //                             presentationURL: [],
    //                             links_lecture: [],
    //                             links_quiz: []
    //                         });
    // useEffect(() => {
    //     async function fetchData() {
    //         if (!sessionId) return;
    //         const res = await fetch(`/get_session_info?sessionId=${sessionId}`);
    //         const data = await res.json();
    //         // Nếu backend trả về object rỗng thì giữ nguyên default
    //         setResult({
    //             todoList: data.todoList || [],
    //             curriculum: data.curriculum || { title: '', overview: '', modules: [] },
    //             lectureNotes: data.lectureNotes || [],
    //             quizzes: data.quizzes || [],
    //             presentationURL: data.presentationURL || [],
    //             links_lecture: data.links_lecture || [],
    //             links_quiz: data.links_quiz || []
    //         });
    //     }
    //     fetchData();
    // }, [sessionId]);                            
    
    // const [linksQuiz, setLinksQuiz] = useState<string[]>([]);
    // useEffect(() => {
    //     if (!sessionId) return;
    //     fetch(`http://127.0.0.1:8000/get_session_info?sessionId=${sessionId}`)
    //     .then(res => res.json())
    //     .then((data: any[]) => {
    //         const allLinks = data.flatMap((item: any) => item.links_quiz || []);
    //         const uniqueLinks = Array.from(new Set(allLinks));
    //         setLinksQuiz(uniqueLinks);
    //     });
    //     }, [sessionId]);
    
    // const [linksLecture, setLinksLecture] = useState<string[]>([]);
    // useEffect(() => {
    //     if (!sessionId) return;
    //     fetch(`http://127.0.0.1:8000/get_session_info?sessionId=${sessionId}`)
    //     .then(res => res.json())
    //     .then((data: any[]) => {
    //         const allLinks = data.flatMap((item: any) => item.links_lecture || []);
    //         const uniqueLinks = Array.from(new Set(allLinks));
    //         setLinksLecture(uniqueLinks);
    //     });
    //     }, [sessionId]);

    const [linksQuiz, setLinksQuiz] = useState<string[]>([]);
    const [linksLecture, setLinksLecture] = useState<string[]>([]);

    // useEffect(() => {
    // if (!sessionId) return;

    // fetch(`http://127.0.0.1:8000/get_session_info?sessionId=${sessionId}`)
    //     .then(res => res.json())
    //     .then((data: any[]) => {
    //     const getUniqueLinks = (key: 'links_quiz' | 'links_lecture') =>
    //         Array.from(new Set(data.flatMap((item: any) => item[key] || [])));

    //     setLinksQuiz(getUniqueLinks('links_quiz'));
    //     setLinksLecture(getUniqueLinks('links_lecture'));
    //     });
    // }, [sessionId]);


    const fetchLinks = () => {
        fetch(`http://127.0.0.1:8000/get_session_info?sessionId=${sessionId}`)
            .then(res => res.json())
            .then((data: any[]) => {
            const getUniqueLinks = (key: 'links_quiz' | 'links_lecture') =>
                Array.from(new Set(data.flatMap((item: any) => item[key] || [])));
            setLinksQuiz(getUniqueLinks('links_quiz'));
            setLinksLecture(getUniqueLinks('links_lecture'));
            });
        };
    
    // useEffect(() => {  
    //     if (!sessionId) return;
    //     fetchLinks();
    //     }, [sessionId]);

    
        
    useEffect(() => {
        if (!sessionId) return;
        // fetch(`http://127.0.0.1:8000/get_session_info?sessionId=${sessionId}`)
        //     .then(res => res.json())
        //     .then((data: any[]) => {
        //     const allLinks = data.flatMap((item: any) => item.links_quiz || []);
        //     const uniqueLinks = Array.from(new Set(allLinks));
        //     setLinksQuiz(uniqueLinks);
        //     });
        fetch(`http://127.0.0.1:8000/get_session_info?sessionId=${sessionId}`)
            .then(res => res.json())
            .then((data: any[]) => {
            const getUniqueLinks = (key: 'links_quiz' | 'links_lecture') =>
                Array.from(new Set(data.flatMap((item: any) => item[key] || [])));
            setLinksQuiz(getUniqueLinks('links_quiz'));
            setLinksLecture(getUniqueLinks('links_lecture'));
            });
        }, [sessionId, quizCreated]);
    return (
        <main className={roboto.className}>
            <Tabs defaultValue='todolist' className="w-full">

            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="todolist">
                    <ListTodo className="w-8 h-8"/>
                </TabsTrigger>

                <TabsTrigger value="curriculum">
                    <ScrollText className='w-8 h-8'/>
                </TabsTrigger>

                <TabsTrigger value="lecture-note">
                    <NotebookPen className='w-8 h-8'/>
                </TabsTrigger>

                <TabsTrigger value="presentation">
                    <Presentation className='w-8 h-8' />
                </TabsTrigger>

                <TabsTrigger value="quiz">
                    <FileQuestion className='w-8 h-8' />
                </TabsTrigger>
            </TabsList>

            {/* <TabsContent value='todolist'>
                <ScrollArea>
                    <div className="">
                        {result.todoList?.map((task) => (
                        <div className="flex space-x-2 space-y-2 ml-5 mt-2">
                            <Checkbox id={task.task_id} 
                                    checked={task.status == "done"} 
                                    className="data-[state=checked]:rounded-full border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white data-[state=checked]:border-none"/>
                            <Label className="" htmlFor={task.task_id}>{task.description}</Label>
                        </div>
                        ))}
                    </div>
                </ScrollArea>
            </TabsContent> */}

            <TabsContent value='todolist' >
                <ScrollArea className="h-screen" >   
                    {/* Thanh tiến trình tổng quan */}
                {result?.todoList && result?.todoList.length > 0 && (
                  <div className="flex items-center gap-4 px-6 pt-6">
                    <div className="flex-1">
                      {/* Progress bar ngang sử dụng shadcn ui */}
                      <div className="flex items-center mb-4 gap-3">
                        <Progress value={(result.todoList.filter(t => t.status === 'done').length / (result.todoList.length || 1)) * 100} className="flex-1 h-3" />
                        <span className="ml-2 w-16 text-right text-lg font-bold text-green-600">
                          {Math.round((result.todoList.filter(t => t.status === 'done').length / (result.todoList.length || 1)) * 100)}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="flex items-center gap-2 text-base font-semibold text-gray-800">
                            {currentAgent ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-500"/>
                                    <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent font-bold animate-pulse">
                                        Running: {currentAgent.replace('_agent', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                        <span className="inline-block animate-bounce ml-1">...</span>
                                    </span>
                                </>
                            ) : (
                                <>
                                    <Check className="w-5 h-5 text-green-500"/> 
                                    <span className="text-green-600 font-semibold">System Ready</span>
                                </>
                            )}
                        </span>
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {`${result.todoList.filter(t => t.status === 'done').length} / ${result.todoList.length} completed`}
                        </span>
                      </div>
                      
                      {/* Task list với card design */}
                      <div className="space-y-3">
                        {result?.todoList.map((task, idx) => {
                          const isDone = task.status === 'done';
                          const isCurrent = task.status === 'pending' && result.todoList.findIndex(t => t.status === 'pending') === idx;
                          const isRunning = currentAgent && task.specific_requirements.toLowerCase().includes(currentAgent.replace('_agent', '').replace(/_/g, ' '));
                          
                          return (
                            <div key={task.task_id} className={`relative p-4 rounded-lg border-l-4 transition-all duration-300 shadow-sm hover:shadow-md ${
                              isDone ? 'bg-green-50 border-green-400 shadow-green-100' :
                              isRunning ? 'bg-blue-50 border-blue-400 shadow-blue-100' :
                              isCurrent ? 'bg-orange-50 border-orange-400 shadow-orange-100' : 
                              'bg-white border-gray-300'
                            }`}>
                              <div className="flex items-start gap-4">
                                {/* Status Icon */}
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                                  isDone ? 'bg-green-500 text-white' : 
                                  isRunning ? 'bg-blue-500 text-white animate-pulse' :
                                  isCurrent ? 'bg-orange-500 text-white animate-pulse' : 
                                  'bg-gray-200 text-gray-500'
                                }`}>
                                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                                   isDone ? <Check className="w-4 h-4" /> :
                                   <span className="w-2 h-2 bg-current rounded-full"></span>}
                                </div>
                                
                                {/* Task Content */}
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-medium leading-relaxed ${
                                    isDone ? 'text-green-800' :
                                    isRunning ? 'text-blue-800' :
                                    'text-gray-800'
                                  }`}>
                                    {task.specific_requirements}
                                  </p>
                                  
                                  {/* Status Badge */}
                                  <div className="mt-2">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                      isDone ? 'bg-green-100 text-green-800' :
                                      isRunning ? 'bg-blue-100 text-blue-800' :
                                      isCurrent ? 'bg-orange-100 text-orange-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {isDone ? '✓ Completed' :
                                       isRunning ? '● Running' :
                                       isCurrent ? '⏳ Pending' :
                                       '○ Waiting'}
                                    </span>
                                  </div>
                                </div>
                                
                                {/* Progress Indicator */}
                                {isRunning && (
                                  <div className="flex-shrink-0">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
                </ScrollArea>
            </TabsContent>

            <TabsContent value="curriculum">
                <ScrollArea className="h-screen">
                    <div>
                        <div className="items-center p-6">
                            <h1 className="font-bold text-2xl text-center p-2">{result.curriculum?.title}</h1>
                            <p className="text-justify">
                                <ReactMarkdown>{result.curriculum?.overview}</ReactMarkdown>
                            </p>
                        </div>

                        <div className="w-full border border-2 m-2 rounded-2xl p-2 bg-gray-50">
                            <ul className="space-y-2">
                                {result.curriculum?.modules?.map((module, index) => (
                                    <li key={`module-tree-${index}`} className="">
                                        <details className="group">
                                            <summary className="flex items-center cursor-pointer px-2 py-1 rounded-lg hover:bg-gray-200 font-semibold text-lg">
                                                <span className="mr-2">📁</span>
                                                {module.title}
                                            </summary>
                                            <div className="ml-6 mt-2">
                                                <div className="mb-2 p-2 rounded bg-white shadow">
                                                    <span className="font-medium text-gray-700"> Nội dung module: </span>
                                                    <ReactMarkdown>{module.content}</ReactMarkdown>
                                                </div>
                                                <details className="mt-2">
                                                    <summary className="flex items-center cursor-pointer px-2 py-1 rounded hover:bg-gray-100 text-base font-normal">
                                                        <span className="mr-2">📝</span>
                                                        Lecture Note
                                                    </summary>
                                                    <div className="ml-6 mt-2 p-2 rounded bg-slate-50 border">
                                                        <ReactMarkdown>
                                                            {result.lectureNotes[index]?.content || ""}
                                                        </ReactMarkdown>
                                                    </div>
                                                </details>
                                            </div>
                                        </details>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <ScrollBar />
                </ScrollArea>
            </TabsContent>

            <TabsContent value="presentation">
                    <div className="p-4">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Presentation className="w-6 h-6 text-yellow-500"/> Presentations</h2>
                        <div className="space-y-3">
                            {result.presentationURL.length === 0 ? (
                                <div className="text-muted-foreground">No presentation files available.</div>
                            ) : 
                            
                            result.presentationURL.map((item, idx) => {
                                const displayName = item.name || item.url.split('/').pop() || `File ${idx + 1}`;
                                return (
                                    <div key={`presentation-file-${idx}`} className="flex items-center p-3 border rounded-lg hover:shadow transition gap-3 w-full">
                                        <Image src="/google_slide.svg" alt="Presentation" width={24} height={24} className="flex-shrink-0"/>
                                        <span className="flex-1 truncate text-sm font-medium min-w-0">{displayName}</span>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="outline" size="sm">
                                                        <Eye className="w-4 h-4"/>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent 
                                                className="w-[95vw] max-w-[95vw] h-[95vh] p-2"
                                                style={{ maxWidth: '95vw', maxHeight: '95vh', width: '95vw', height: '95vh' }}>
                                                    <div className="flex flex-col w-full h-full">
                                                        <div className="text-lg font-semibold p-2 leading-tight">
                                                            {displayName}
                                                        </div>
                                                        <div className="flex-1">
                                                            <PresentationViewer presentation_url={item.url} />
                                                        </div>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                            <a href={item.url.startsWith('http') ? item.url : `https://docs.google.com/presentation/d/${item.url}`} target="_blank" rel="noopener noreferrer">
                                                <Button variant="secondary" size="sm"><ExternalLink className="w-4 h-4"/></Button>
                                            </a>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
            </TabsContent>

            {/* <TabsContent value="quiz">

            </TabsContent> */}

            {/* <TabsContent value="quiz">
                <ScrollArea className="h-screen">
                    <div className="p-4 space-y-4">
                        <h2 className="text-xl font-bold mb-2">Quiz Files</h2>
                        {result.links_quiz.length === 0 ? (
                            <p className="text-muted-foreground">No quiz files available.</p>
                        ) : (
                            result.links_quiz.map((fileUrl, idx) => {
                                const moduleTitle = result.curriculum?.modules[idx]?.title;
                                const fallbackFileName = fileUrl.split('/').pop() || `File ${idx + 1}`;
                                const displayName = moduleTitle ? `${moduleTitle}.pdf` : fallbackFileName;

                                return (
                                    <div 
                                        key={`lecture-file-${idx}`} 
                                        className="flex items-center p-3 border rounded-lg hover:shadow transition"
                                    >
                                        <FaFilePdf className="w-6 h-6 text-red-600 mr-3" />
                                        
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button className="flex-1 truncate text-left text-blue-600 hover:underline">
                                                    {displayName}
                                                </button>
                                            </DialogTrigger>


                                            <DialogContent 
                                            className="w-[95vw] max-w-[95vw] h-[95vh] p-2"
                                            style={{ maxWidth: '95vw', maxHeight: '95vh', width: '95vw', height: '95vh' }}>
                                                <div className="flex flex-col w-full h-full">
                                                    <div className="text-lg font-semibold p-2 leading-tight">
                                                        {displayName}
                                                    </div>
                                                    <iframe 
                                                        src={fileUrl}
                                                        title={displayName}
                                                        className="w-full flex-1 border-none rounded"
                                                    />
                                                </div>
                                            </DialogContent>

                                        </Dialog>

                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-5 h-5 text-blue-500 hover:text-blue-700 ml-2" />
                                        </a>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </TabsContent>
            */}





            <TabsContent value="quiz">
                <ScrollArea className="h-screen">
                    <div className="p-4 space-y-4">

                        {/* <button
                        className="text-blue-600 hover:underline"
                        onClick={fetchLinks}
                        >
                            Làm mới
                        </button> */}

                        <h2 className="text-xl font-bold mb-2">Quiz Files</h2>
                        {(linksQuiz?.length ?? 0) === 0 ? ( //result.links_quiz
                            <p className="text-muted-foreground">No quiz files available.</p>
                        ) : (
                            (linksQuiz ?? []).map((fileUrl, idx) => {
                                // const moduleTitle = result.curriculum?.modules[idx]?.title;
                                // const fallbackFileName = fileUrl.split('/').pop() || `File ${idx + 1}`;
                                // const displayName = moduleTitle ? `${moduleTitle}.pdf` : fallbackFileName;
                                const displayName = fileUrl.split('/').pop() || `File ${idx + 1}`;
                                return (
                                    <div 
                                        key={`lecture-file-${idx}`} 
                                        className="flex items-center p-3 border rounded-lg hover:shadow transition"
                                    >
                                        <FaFilePdf className="w-6 h-6 text-red-600 mr-3" />
                                        
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button className="flex-1 truncate text-left text-blue-600 hover:underline">
                                                    {displayName}
                                                </button>
                                            </DialogTrigger>

                                            <DialogContent 
                                            className="w-[95vw] max-w-[95vw] h-[95vh] p-2"
                                            style={{ maxWidth: '95vw', maxHeight: '95vh', width: '95vw', height: '95vh' }}>
                                                <div className="flex flex-col w-full h-full">
                                                    <div className="text-lg font-semibold p-2 leading-tight">
                                                        {displayName}
                                                    </div>
                                                    <iframe 
                                                        src={fileUrl}
                                                        title={displayName}
                                                        className="w-full flex-1 border-none rounded"
                                                    />
                                                </div>
                                            </DialogContent>

                                        </Dialog>

                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-5 h-5 text-blue-500 hover:text-blue-700 ml-2" />
                                        </a>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </TabsContent>
            
            {/* <TabsContent value="lecture-note">
                <ScrollArea className="h-screen">
                    <div className="p-4 space-y-4">
                        <h2 className="text-xl font-bold mb-2">Lecture Files</h2>
                        {result.links_lecture.length === 0 ? (
                            <p className="text-muted-foreground">No lecture files available.</p>
                        ) : (
                            result.links_lecture.map((fileUrl, idx) => {
                                const fileName = fileUrl.split('/').pop() || `File ${idx + 1}`;
                                return (
                                    <div 
                                        key={`lecture-file-${idx}`} 
                                        className="flex items-center p-3 border rounded-lg hover:shadow transition"
                                    >
                                        <FileText className="w-6 h-6 text-red-500 mr-3" />
                                        <span className="flex-1 truncate">{fileName}</span>
                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                                        </a>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </TabsContent> */}

            {/* <TabsContent value="lecture-note">
                    <ScrollArea className="h-screen">
                        <div className="p-4 space-y-4">
                            <h2 className="text-xl font-bold mb-2">Lecture Files</h2>
                            {result.links_lecture.length === 0 ? (
                                <p className="text-muted-foreground">No lecture files available.</p>
                            ) : (
                                result.links_lecture.map((fileUrl, idx) => {
                                    const moduleTitle = result.curriculum?.modules[idx]?.title;
                                    const fallbackFileName = fileUrl.split('/').pop() || `File ${idx + 1}`;
                                    const displayName = moduleTitle ? `${moduleTitle}.pdf` : fallbackFileName;

                                    return (
                                        <div 
                                            key={`lecture-file-${idx}`} 
                                            className="flex items-center p-3 border rounded-lg hover:shadow transition"
                                        >
                                            <FaFilePdf className="w-6 h-6 text-red-600 mr-3" />
                                            <span className="flex-1 truncate">{displayName}</span>
                                            <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                                <ExternalLink className="w-5 h-5 text-blue-500 hover:text-blue-700" />
                                            </a>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </ScrollArea>
            </TabsContent> */}

           
            <TabsContent value="lecture-note">
                <ScrollArea className="h-screen">
                    <div className="p-4 space-y-4">
                        <h2 className="text-xl font-bold mb-2">Lecture Files</h2>
                        {(linksLecture?.length?? 0 ) === 0 ? (
                            <p className="text-muted-foreground">No lecture files available.</p>
                        ) : (
                            ( linksLecture ?? []).map((fileUrl, idx) => { //result.links_lecture
                                // const moduleTitle = result.curriculum?.modules[idx]?.title;
                                // const fallbackFileName = fileUrl.split('/').pop() || `File ${idx + 1}`;
                                // const displayName = moduleTitle ? `${moduleTitle}.pdf` : fallbackFileName;
                                const displayName = fileUrl.split('/').pop() || `File ${idx + 1}`;

                                return (
                                    <div 
                                        key={`lecture-file-${idx}`} 
                                        className="flex items-center p-3 border rounded-lg hover:shadow transition"
                                    >
                                        <FaFilePdf className="w-6 h-6 text-red-600 mr-3" />
                                        
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <button className="flex-1 truncate text-left text-blue-600 hover:underline">
                                                    {displayName}
                                                </button>
                                            </DialogTrigger>

                                            {/* <DialogContent className="w-[95vw] h-[95vh]">
                                                <DialogHeader>
                                                    <DialogTitle>{displayName}</DialogTitle>
                                                </DialogHeader>
                                                <div className="w-full h-full">
                                                    <iframe 
                                                        src={fileUrl}
                                                        title={displayName}
                                                        className="w-full h-full border-none rounded"
                                                    />
                                                </div>
                                            </DialogContent> */}

                                            {/* <DialogContent 
                                            className="w-[95vw] max-w-[95vw] h-[95vh] p-2"
                                            style={{ maxWidth: '95vw', maxHeight: '95vh', width: '95vw', height: '95vh' }}
                                                >
                                            <DialogHeader className="p-0 m-0">
                                                <DialogTitle className="text-lg font-semibold p-2 m-0">{displayName}</DialogTitle>
                                            </DialogHeader>
                                            <div className="w-full h-full">
                                                <iframe 
                                                    src={fileUrl}
                                                    title={displayName}
                                                    className="w-full h-full border-none rounded"
                                                />
                                            </div>
                                            </DialogContent> */}
                                            <DialogContent 
                                            className="w-[95vw] max-w-[95vw] h-[95vh] p-2"
                                            style={{ maxWidth: '95vw', maxHeight: '95vh', width: '95vw', height: '95vh' }}>
                                                <div className="flex flex-col w-full h-full">
                                                    <div className="text-lg font-semibold p-2 leading-tight">
                                                        {displayName}
                                                    </div>
                                                    <iframe 
                                                        src={fileUrl}
                                                        title={displayName}
                                                        className="w-full flex-1 border-none rounded"
                                                    />
                                                </div>
                                            </DialogContent>

                                        </Dialog>

                                        <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="w-5 h-5 text-blue-500 hover:text-blue-700 ml-2" />
                                        </a>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </ScrollArea>
            </TabsContent>            
        </Tabs>
        </main>
    )
}

export default ResultTab;


 