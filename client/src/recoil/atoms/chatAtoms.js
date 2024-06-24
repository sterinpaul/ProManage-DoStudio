import {atom} from 'recoil'


export const allChatMessageAtom = atom({
    key:"allChatMessageAtom",
    default: []
})

export const socketMessageAtom = atom({
    key:"socketMessageAtom",
    default: {}
})

export const assignNotifyAtom = atom({
    key:"assignNotifyAtom",
    default: {}
})
