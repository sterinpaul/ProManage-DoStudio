import { useEffect, useRef } from "react"

export const InputComponent = ({ subTaskName, setSubTaskName, updateName, taskName=false }) => {
  const inputRef = useRef(null)

  useEffect(()=>{
    if(inputRef.current){
      inputRef.current.focus()
    }
  },[])

  return (
    <form onSubmit={updateName}>
      <input ref={inputRef} onBlur={updateName} onChange={(event)=>setSubTaskName(event.target.value)} defaultValue={subTaskName} type="text" className={`capitalize ${taskName && "font-bold text-xl text-black"} w-44 bg-transparent outline-none`} maxLength={25} />
      <button type='submit'></button>
    </form>
  )
}