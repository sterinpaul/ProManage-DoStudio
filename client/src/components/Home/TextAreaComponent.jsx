import { useEffect, useRef } from "react"

export const TextAreaComponent = ({ subTaskNotes, setSubTaskNotes, updateNotes }) => {
  const textAreaRef = useRef(null)

  useEffect(()=>{
    if(textAreaRef.current){
      textAreaRef.current.focus()
    }
  },[])

  return (
    <form onSubmit={updateNotes}>
      <textarea rows={2} spellCheck={false} ref={textAreaRef} onBlur={updateNotes} onChange={(event)=>setSubTaskNotes(event.target.value)} defaultValue={subTaskNotes} className="overflow-y-scroll p-0 m-0 leading-3 text-xs h-full bg-transparent outline-none w-44 xl:w-52 2xl:w-96" maxLength={150} />
      <button type='submit'></button>
    </form>
  )
}