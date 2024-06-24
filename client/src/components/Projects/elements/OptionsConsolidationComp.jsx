import { useEffect, useState } from "react"


export const OptionsConsolidationComp = ({eachOption,optionGroup})=>{
    const [color,setColor] = useState("")

    useEffect(()=>{
        setColor(optionGroup.find(single => single.value === eachOption).color)
    },[setColor,optionGroup])

    return(
        <div className={`bg-${color} w-full`} />
    )
}