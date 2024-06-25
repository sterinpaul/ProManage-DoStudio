import { useEffect, useRef, useState } from "react"


export const SelectComponent = ({ currentValue, valueGroup, updateSubTaskOption, headerType, classes,isAdmin,permission }) => {
    const [currentOption, setCurrentOption] = useState(currentValue)
    const [currentColor, setCurrentColor] = useState(valueGroup?.find((single) => single.value === currentValue).color)
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
        setCurrentOption(option.value)
        setCurrentColor(option.color)
        setIsOpen(false);
        updateSubTaskOption(headerType,option.value)
    }


    return (
        <td onClick={toggleDropdown} className={`${classes} relative bg-${currentColor} capitalize cursor-pointer text-white text-nowrap text-center w-36`} ref={dropdownRef}>
            {currentOption}
            {isOpen && <div className="absolute z-10 top-8 left-0 rounded bg-white shadow-lg border w-full text-center cursor-pointer text-sm ">
                {valueGroup.map((options, index) => (
                    <div onClick={() => changeOption(options)} className={`text-${options.color} bg-gray-200 hover:bg-gray-300 rounded m-1 px-2 py-1 z-50`} key={index}>{options.value}</div>
                ))}
            </div>}
        </td>
    )
}
