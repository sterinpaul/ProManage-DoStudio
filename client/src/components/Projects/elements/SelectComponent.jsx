import { useEffect, useRef, useState } from "react"
import { BiPlus } from "react-icons/bi"


export const SelectComponent = ({ currentValue, valueGroup, updateSubTaskOption, headerType, classes,isAdmin,permission,addOptionModalToggle }) => {
    const [currentOption, setCurrentOption] = useState(currentValue)
    const [currentColor, setCurrentColor] = useState(valueGroup.length ? valueGroup?.find((single) => single.option === currentValue).color : "black")
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        if(permission || isAdmin){
            setIsOpen(!isOpen)
        }
    }

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }


    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [])

    const changeOption = (option) => {
        setCurrentOption(option.option)
        setCurrentColor(option.color)
        setIsOpen(false);
        updateSubTaskOption(headerType,option.option)
    }


    return (
        <td onClick={toggleDropdown} ref={dropdownRef} className={`${classes} bg-${currentColor} relative cursor-pointer capitalize text-white text-nowrap text-center w-36`} >
            {currentOption}
            {isOpen && <div className="absolute p-2 rounded z-10 bg-white shadow-xl border w-36 md:w-72 text-center cursor-pointer text-sm flex justify-center items-center flex-col md:flex-row gap-2 flex-wrap">
                {valueGroup.map((options, index) => (
                    <div onClick={() => changeOption(options)} className={`text-white bg-${options.color} hover:bg-opacity-80 rounded w-32 px-2 py-1.5`} key={index}>{options.option}</div>
                ))}
                <div onClick={()=>addOptionModalToggle(headerType)} className={`bg-gray-200 hover:bg-gray-300 text-blue-gray-700 rounded px-2 py-1.5`}><BiPlus className="w-4 h-4"/></div>
            </div>}
        </td>
    )
}
