"use client"
import React from 'react'
import { Provider, useSelector } from "react-redux";
import {store} from '../../slice/store'
import Loader from './Loader'
export default function ReduxWrapper({children}) {
  return (
    <>
        <Provider store={store}>
            {children}
            <Loader/>
        </Provider>
        
    </>

  )
}
