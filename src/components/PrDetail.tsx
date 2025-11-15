'use client'
import { ArrowUpIcon} from 'lucide-react';
import React, { Fragment, useRef, useState, useTransition } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { aiAnalysis } from '@/actions/ai_action';

type prop={
    prs:any[];
    parsedId:string | null;
}

function PrDetail({prs,parsedId}:prop) {

  const textRef=useRef<HTMLTextAreaElement>(null);
  const contentRef=useRef<HTMLDivElement>(null);

  const [selectedPr, setSelectedPr] = useState<any>(null);
  const [dataRecived, setDataRecieved] = useState<any>(null);
  const[inputValue,setInputValue]=useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [open,setOpen]=useState<boolean>(false);
  const [questions,setQuestions]=useState<string[]>([]);
  const [response, setResponse] = useState<string[]>([]);

  const handleClickInput=()=>{
    textRef.current?.focus();
  }

  const handleSubmit=()=>{
    if(inputValue.trim()==="") return;
    if(!selectedPr) return;
    const newQuestion=inputValue.trim();
    setInputValue("");
    setQuestions([...questions,newQuestion]);
    startTransition(async()=>{
      try {
        const res = await aiAnalysis(dataRecived, [newQuestion]);
        console.log(dataRecived);
        console.log(res);
        setResponse((prev)=>[...prev,typeof res === "string" ? res : JSON.stringify(res)]);
        setTimeout(()=>{
          contentRef.current?.scrollTo({
            top: contentRef.current.scrollHeight,
            behavior: "smooth"
          })
        },300)
      } catch (error) {
         console.log(error);
          setResponse((prev)=>[...prev, "Error: Unable to fetch response. Please try again."]);
      }
    })
    
  }

  const handleOpen=(open:boolean, prNumber?: number)=>{
    setOpen(open);
    if(open){
      setInputValue("");
      startTransition(async ()=>{
         const res=await fetch(`/api/repo/${parsedId}/prs/${prNumber}`,{
          method:"POST",
          headers:{
            "Content-Type":"application/json"
          },
         })
          const data=await res.json();
          console.log(data);
          setSelectedPr(data.pr);
          const aiRes = data.aiRes;
          setResponse((prev)=>[...prev,typeof aiRes === "string" ? aiRes : JSON.stringify(aiRes)]);
          setDataRecieved({pr:data.pr, diff:data.diff});
          setTimeout(()=>{
            contentRef.current?.scrollTo({
              top: contentRef.current.scrollHeight,
              behavior: "smooth"
            })
          },300)
      })
    }
  }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

  const handleInput=(e:React.FormEvent<HTMLTextAreaElement>)=>{
    const textArea = textRef.current;
    if (!textArea) return;
    textArea.style.height = "auto";
    textArea.style.height = `${textArea.scrollHeight}px`;
  }

  return (
    <div>
      {prs.length > 0 && (
        <div className="w-full max-w-2xl">
          <h2 className="text-lg font-semibold mb-2">Pull Requests</h2>
          <h3 className="italic">Click a PR to start analysing...</h3>
          <Dialog
            open={open}
            onOpenChange={() => {
              setOpen(!open);
            }}>
            <ul className="space-y-3">
              {prs.map((pr) => (
                <li
                  key={pr.id}
                  className="border rounded p-3 hover:bg-gray-50 transition">
                  <DialogTrigger asChild>
                    <div
                      onClick={() => handleOpen(true, pr.number)}
                      className="cursor-pointer">
                      <p className="text-blue-600 font-medium hover:underline hover:cursor-pointer">
                        #{pr.number} {pr.title}
                      </p>
                      <p className="text-sm text-gray-600">
                        by {pr.user.login} on{" "}
                        {new Date(pr.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </DialogTrigger>
                </li>
              ))}
            </ul>
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
                {/* Optional initial bot message before questions */}
                {response[0] && !questions.length && (
                  <p
                    className="bot-response text-muted-foreground text-sm"
                    dangerouslySetInnerHTML={{ __html: response[0] }}
                  />
                )}

                {questions.map((question, idx) => (
                  <Fragment key={idx}>
                    <p className="bg-muted text-muted-foreground ml-auto max-w-[60%] rounded-md px-2 py-1 text-sm">
                      {question}
                    </p>
                    {response[idx + 1] && (
                      <p
                        className="bot-response text-muted-foreground text-sm"
                        dangerouslySetInnerHTML={{ __html: response[idx + 1] }}
                      />
                    )}
                  </Fragment>
                ))}

                {isPending && (
                  <p className="animate-pulse text-sm">
                    Just Hold ur Supspense...
                  </p>
                )}
              </div>
              <div
                onClick={handleClickInput}
                className="mt-auto flex cursor-text flex-col rounded-lg border p-4">
                <Textarea
                  ref={textRef}
                  placeholder="Ask me anything about this PR..."
                  className="placeholder:text-muted-foreground resize-none rounded-none border-none bg-transparent p-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  style={{
                    minHeight: "0",
                    lineHeight: "normal",
                  }}
                  onKeyDown={handleKeyDown}
                  onInput={handleInput}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                />

                <Button
                  className="ml-auto size-8 rounded-full"
                  onClick={handleSubmit}
                  disabled={isPending}>
                  <ArrowUpIcon className="text-background" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}

export default PrDetail;
