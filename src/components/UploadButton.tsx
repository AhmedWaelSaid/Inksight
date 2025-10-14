"use client"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { useState } from "react"
import { Button, buttonVariants } from "./ui/button"


interface Iprops {

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
        <DialogTitle>Are you absolutely sure?</DialogTitle>
        <DialogDescription>
          This action cannot be undone. This will permanently delete your account
          and remove your data from our servers.
        </DialogDescription>
      </DialogHeader>
    </DialogContent>
  </Dialog>
  )
}

export default UploadButton 