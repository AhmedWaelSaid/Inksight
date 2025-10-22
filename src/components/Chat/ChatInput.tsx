import { Send } from "lucide-react"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"

interface Iprops {
    isDisabled?: boolean
}

const ChatInput = ({isDisabled} : Iprops ) => {
  return (
    <div className="">
      <form className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea className="resize-none pr-12 text-base py-3 scrollbar-thumb-green scrollbar-thumb-rounded scrollbar-track-green-lighter scrollbar-w-2 scrolling-touch" rows={1} autoFocus maxRows={4} placeholder="Enter your question..."/>
            <Button className="absolute bottom-1.5 right-[8px]" aria-label="send-message">
              <Send className="h-4 w-4"/>
            </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ChatInput