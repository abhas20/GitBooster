'use client'
import { Dialog } from '@radix-ui/react-dialog';
import React, { Fragment, useRef, useState, useTransition } from 'react'
import { DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { ArrowUpIcon } from 'lucide-react';
import {  askAiDoubt } from '@/actions/ai_action';

function AIDialog( data:any ) {

    const textRef=useRef<HTMLTextAreaElement>(null);
    const contentRef=useRef<HTMLDivElement>(null);

    const [open,setOpen]=useState<boolean>(false);
    const [questionText,setQuestionText]=useState<string[]>([]);
    const [response, setResponse] = useState<string[]>([]);
    const [inputValue,setInputValue]=useState<string>("");

    const [isPending, startTransition] = useTransition();

    const handleClickInput=()=>{
      textRef.current?.focus();
    }

    const handleKeyDown=(e:React.KeyboardEvent<HTMLTextAreaElement>)=>{
      if(e.key==="Enter" && !e.shiftKey){
        e.preventDefault();
        handleSubmit();
      }
    }

    const handleOpen=()=>{
        setOpen(!open);
        if(open){
            setInputValue("");
            setQuestionText([]);
            setResponse([]);
        }
    }
    const handleSubmit=()=>{
        if(inputValue.trim()==="") return;
        const newQuestion=inputValue.trim();
        setInputValue("");
        setQuestionText([...questionText,newQuestion]);
        startTransition(async()=>{
            try {
                const res=await askAiDoubt(data,newQuestion,response);
                setResponse((prev)=>[...prev,res]);
                setTimeout(() => {
                  contentRef.current?.scrollTo({
                    top: contentRef.current.scrollHeight,
                    behavior: "smooth",
                  });
                }, 100);
                
            } catch (error) {
                console.log(error);
                setResponse((prev)=>[...prev, "Error: Unable to fetch response. Please try again."]);
            }
        })
    }


  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary">Ask AI Help</Button>
      </DialogTrigger>
      <DialogContent
        className="custom-scrollbar flex h-[85vh] max-w-4xl flex-col overflow-y-auto"
        ref={contentRef}>
        <DialogHeader>
          <DialogTitle>Analysing the PR</DialogTitle>
          <DialogDescription>
            Ask anything about the PR and get instant insights!
            <br />
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-8">
          {questionText.map((question, idx) => (
            <Fragment key={idx}>
              <p className="bg-muted text-muted-foreground ml-auto max-w-[60%] rounded-md px-2 py-1 text-sm">
                {question}
              </p>
              {response[idx] && (
                <p
                  className="bot-response text-muted-foreground text-sm"
                  dangerouslySetInnerHTML={{ __html: response[idx] }}
                />
              )}
            </Fragment>
          ))}
          {isPending && (
            <p className="animate-pulse text-sm">Just Hold ur Patience...</p>
          )}
        </div>
        <div
          onClick={handleClickInput}
          className="mt-auto flex cursor-text flex-col rounded-lg border p-4">
          <Textarea
            ref={textRef}
            placeholder="Ask me anything..."
            className="placeholder:text-muted-foreground resize-none rounded-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            style={{
              minHeight: "0",
              lineHeight: "normal",
            }}
            rows={1}
            onKeyDown={handleKeyDown}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />

          <Button
            className="ml-auto size-8 rounded-full"
            onClick={handleSubmit}>
            <ArrowUpIcon className="text-background" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AIDialog
