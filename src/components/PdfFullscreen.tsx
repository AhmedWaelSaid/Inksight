
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from './ui/dialog'
import { Button } from './ui/button'
import { AlertCircle, Expand, Loader2 } from 'lucide-react'
import SimpleBar from 'simplebar-react'
import { Document, Page } from 'react-pdf'
import { useResizeDetector } from 'react-resize-detector'
import { toast } from 'sonner'
import { DialogTitle } from '@radix-ui/react-dialog'
interface Iprops {
    fileUrl:string
}

const PdfFullscreen = ({fileUrl} : Iprops ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [pagesNumbers, setpagesNumbers] = useState<number>()
    
  
    const { width, ref } = useResizeDetector()
  
  return (
    <Dialog 
    open={isOpen}
    onOpenChange={(v) => {
      if (!v) {
        setIsOpen(v)
      }
    }}>
         <DialogTitle hidden={true}></DialogTitle>
    <DialogTrigger
      onClick={() => setIsOpen(true)}
      asChild>
      <Button
        variant='ghost'
        className='gap-1.5'
        aria-label='fullscreen'>
        <Expand className='h-4 w-4' />
      </Button>
    </DialogTrigger>
    <DialogContent className='max-w-7xl w-full'>
      <SimpleBar
        autoHide={false}
        className='max-h-[calc(100vh-10rem)] mt-6'>
        <div ref={ref}>
          <Document
            loading={
              <div className='flex justify-center '>
                <Loader2 className='my-24 h-6 w-6 animate-spin' />
              </div>
            }
            onLoadError={() => {
                toast.custom(() => (
                  <div className="bg-destructive text-white dark:bg-destructive/60 px-4 py-3 rounded-md shadow-md">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      <span>Something went wrong, please try again later</span>
                    </div>
                  </div>
                ));
              }}
            onLoadSuccess={(pdf) =>
              setpagesNumbers(pdf.numPages)
            }
            file={fileUrl}
            className='max-h-full'>
            {new Array(pagesNumbers).fill(0).map((_, i) => (
              <Page
                key={i}
                width={width ? width : 1}
                pageNumber={i + 1}
              />
            ))}
          </Document>
        </div>
      </SimpleBar>
    </DialogContent>
  </Dialog>
  )
}

export default PdfFullscreen