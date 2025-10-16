"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTrigger,
    DialogTitle
  } from "@/components/ui/dialog"
import { useState } from "react"
import { Button, buttonVariants } from "./ui/button"
import Dropzone from "react-dropzone"
import { Cloud, File } from "lucide-react"
import { Progress } from "./ui/progress"
import { clearInterval } from "timers"




interface Iprops {

}

const UploadDropZone = ()=> {

const [isUploadingFile , setisUploadingFile] = useState<boolean>(true)
const [UploadProgress , setisUploadProgress] = useState<number>(0)

 const smiulationProgress = () => {
 setisUploadProgress(0)
 const interval = setInterval(()=> {
  setisUploadProgress((prevprogress) => {
    if (prevprogress>=95) {
    clearInterval(interval)
    return prevprogress
    }
    return prevprogress + 5
  })
 } , 500)
 return interval
}

return (
  <Dropzone onDrop={(acceptedFiles)=> {
    setisUploadingFile(true)
    const progressinterval = smiulationProgress()
    // handle FIle uploading 
    clearInterval(progressinterval)
    setisUploadProgress(100)
  }
   
    
  } multiple={false}>{({acceptedFiles , getInputProps , getRootProps})=> (
    <div {...getRootProps()} className="border h-64 m-4 border-dashed border-gray-300 rounded-lg">
      <div className="flex items-center justify-center h-full w-full">
        <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50  hover:bg-gray-100">
        <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <Cloud className="h-8 w-8 text-zinc-500 mb-2"/>
            <p className="mb-2 text-sm text-zinc-700">
              <span className="font-semibold">Click to Upload</span>{' '}or Drag and Drop
            </p>
            <p className="text-xs text-zinc-700 font-semibold">PDF (Up to 4MB)</p>
          </div>
          {acceptedFiles && acceptedFiles[0] ? (
  <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline[1px] outline-zinc-100 divide-x divide-zinc-200 ">
    <div className="px-3 py-2 h-full grid place-items-center">
      <File className="h-4 w-4 text-green-600"/>
    </div>
    <div className="px-3 py-2 h-full text-sm truncate">
      {acceptedFiles[0].name}
    </div>
  </div>     
          ): null}  
          {isUploadingFile? (
            <div className="w-full mt-4 max-w-xs mx-auto">
              <Progress value={UploadProgress} className="h-1 w-full" />
            </div>
          ) : null}          
        </label>
      </div>
    </div>
  )}</Dropzone>
)
}


const UploadButton = ({} : Iprops ) => {
    const [Isopen , setIsopen] = useState<boolean>(false)
  return (
    <Dialog open={Isopen} onOpenChange={(event) => {
        if(!event) {
            setIsopen(event)
        }
    }} >
    <DialogTrigger onClick={()=>setIsopen(true)} asChild>
        <Button className={buttonVariants(
            {className:"cursor-pointer text-gray-700 " ,variant:"default"}
        )}>
            Upload your File
        </Button >
        </DialogTrigger>
    <DialogContent>
    <DialogHeader>
        <DialogTitle></DialogTitle>
      </DialogHeader>
   <UploadDropZone/>
    </DialogContent>
  </Dialog>
  )
}

export default UploadButton 