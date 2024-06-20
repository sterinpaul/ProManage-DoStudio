import React from 'react';
import {metaicon} from '../../assets'


const Topbar = () => {
  return (
    <div className='p-3 bg-gray-200 fixed top-0 z-50 w-full flex items-center justify-between'>
        <div className='flex items-center gap-2'>
            <img className='h-7 w-7 object-cover' src={metaicon} alt="" />
            <h1 className='text-base font-normal'><span className='capitalize font-bold'>dostudio</span> work management</h1>
        </div>
    </div>
  )
}

export default Topbar