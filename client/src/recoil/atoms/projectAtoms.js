import {atom} from 'recoil'

export const allProjectsAtom = atom({
    key:"allProjectsAtom",
    default: []
})

export const currentProjectAtom = atom({
    key:"currentProjectAtom",
    default: []
})