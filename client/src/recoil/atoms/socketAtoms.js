import {atom} from 'recoil'
import io from 'socket.io-client';
import { configKeys } from '../../api/config';


const defaultSocket = io(configKeys.SOCKET_URL)

export const socketAtom = atom({
    key:"socketAtom",
    default: {}
})

