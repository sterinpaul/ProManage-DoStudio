import {atom} from 'recoil'

export const allProjectsAtom = atom({
    key:"allProjectsAtom",
    default: []
})


export const currentProjectNameAtom = atom({
    key:"currentProjectNameAtom",
    default: ""
})

export const currentProjectAtom = atom({
    key:"currentProjectAtom",
    default: []
})

export const currentProjectCopyAtom = atom({
    key:"currentProjectCopyAtom",
    default: []
})

export const filterStatusAtom = atom({
    key:"filterStatusAtom",
    default: false
})

export const taskSubTaskAtom = atom({
    key:"taskSubTaskAtom",
    default: {taskId:"",subTaskId:""}
})

export const statusOptionsAtom = atom({
    key:"statusOptionsAtom",
    default: []
})

export const priorityOptionsAtom = atom({
    key:"priorityOptionsAtom",
    default: []
})

export const permittedHeadersAtom = atom({
    key:"permittedHeadersAtom",
    default: []
})

export const projectHeadersAtom = atom({
    key:"projectHeadersAtom",
    default: []
})

export const headerWidthActiveAtom = atom({
    key:"headerWidthActiveAtom",
    default: false
})
