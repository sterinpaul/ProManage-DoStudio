
export const OptionsConsolidationComp = ({index,taskCount,eachOption,optionGroup})=>{
    const color = optionGroup?.find(single => single?.value === eachOption?.label).color
    const width = eachOption?.count * 100 / taskCount

    return(
        <div className={`bg-${color} relative group`} style={{width:`${width}%`}}>
            <div className={`absolute hidden group-hover:block text-sm text-nowrap -top-6 ${index !== 0 && "right-1/2 translate-x-1/2"} rounded-md border shadow-lg px-1 bg-white`} >{eachOption.count}/{taskCount} {width}%</div>
        </div>
    )
}