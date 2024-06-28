import {atom} from 'recoil'

const getToken = ()=>{
    return localStorage.getItem("token")
}

export const tokenAtom = atom({
    key:"tokenAtom",
    default: getToken()
})


export const userDataAtom = atom({
    key:"userDataAtom",
    default: {}
})
