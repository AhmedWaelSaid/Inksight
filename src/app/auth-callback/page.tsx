import {useRouter, useSearchParams} from 'next/navigation'


interface Iprops {
}


const page = ({} : Iprops ) => {

    const router = useRouter()
    const SearchParams = useSearchParams()
    const origin = SearchParams.get('origin')
  return (
    <div></div>
  )
}

export default page