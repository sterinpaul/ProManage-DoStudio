
export const OptionsConsolidationComp = ({index,taskCount,eachOption,optionGroup})=>{
    const color = optionGroup?.length ? optionGroup?.find(single => single?.option === eachOption?.label)?.color : ""
    const width = (eachOption?.count * 100 / taskCount).toFixed(1)

    return(
        <div className={`relative group `} style={{backgroundColor:`${color}`,width:`${width}%`}}>
            <div className={`absolute hidden group-hover:block text-sm text-nowrap -top-6 ${index !== 0 && "right-1/2 translate-x-1/2"} rounded-md border shadow-lg px-1 text-white bg-black`} >{eachOption.count}/{taskCount} {width}%</div>
        </div>
    )
}