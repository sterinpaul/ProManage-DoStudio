import { useEffect, useRef, useState } from "react"
import { BiPlus } from "react-icons/bi"
import { permittedHeadersAtom, projectHeadersAtom } from "../../../recoil/atoms/projectAtoms"
import { useRecoilValue } from "recoil"


export const SelectComponent = ({ currentValue, valueGroup, updateSubTaskOption, headerType, classes,isAdmin,addOptionModalToggle,projectPermitted }) => {
    const [currentOption, setCurrentOption] = useState("")
    const [currentColor, setCurrentColor] = useState("")
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const headers = useRecoilValue(projectHeadersAtom);
    const buttonWidth = headers.find(header=>header.key === headerType)?.width
    const permittedHeaders = useRecoilValue(permittedHeadersAtom)

    const isNotAllowed = permittedHeaders?.some(head=>head.key === headerType)
    const isAccess = isAdmin
    ? true
    : isNotAllowed
    ? projectPermitted?.allowedPermissions?.includes(headerType) ?? false
    : true;

    const toggleDropdown = () => {
        if(isAccess){
            setIsOpen(previous=>!previous)
        }
    }

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    }


    useEffect(() => {
        setCurrentOption(currentValue)
        setCurrentColor(valueGroup?.length ? valueGroup.find((single) => single.option === currentValue)?.color : "")
    }, [currentValue])

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [])

    const openOptionModal = ()=>{
        addOptionModalToggle(headerType)
    }

    const changeOption = (option) => {
        setCurrentOption(option.option)
        setCurrentColor(option.color)
        setIsOpen(false);
        updateSubTaskOption(headerType,option.option)
    }


    return (
        <td onClick={toggleDropdown} ref={dropdownRef} style={{backgroundColor:`${currentColor}`}} className={`${classes} relative cursor-pointer capitalize text-white text-nowrap text-center w-36`} >
            {currentOption}
            {isOpen && <div className="z-20 absolute p-2 rounded bg-white shadow-xl border w-36 md:w-72 ">
                <div className="text-center cursor-pointer text-sm flex justify-center items-center flex-col md:flex-row gap-2 flex-wrap">
                    {valueGroup?.map((options, index) => (
                        <div onClick={() => changeOption(options)} style={{width:`${buttonWidth}`,backgroundColor:`${options.color}`}} className={`text-white hover:bg-opacity-80 rounded min-w-32 px-2 py-1.5`} key={index}>{options.option}</div>
                    ))}
                </div>
                <div onClick={openOptionModal} className={`bg-gray-200 hover:bg-gray-300 text-blue-gray-700 rounded px-2 py-1.5 w-fit mx-auto mt-2`}><BiPlus className="w-4 h-4"/></div>
            </div>}
        </td>
    )
}
