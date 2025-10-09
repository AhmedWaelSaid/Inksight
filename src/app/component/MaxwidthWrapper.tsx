import { ReactNode } from "react"
import { cn } from "./lib/utilts"

interface Iprops {
ClassName? : string
children : ReactNode
}

const MaxwidthWrapper = ({ClassName , children} : Iprops ) => {
  return (
    <div className={cn("mx-auto w-full max-w-screen-xl px-2.5 md:px-20" , ClassName)}>
        {children}
    </div>
  )
}

export default MaxwidthWrapper