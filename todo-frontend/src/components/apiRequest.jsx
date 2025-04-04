"use server"
import axios from 'axios'
import { revalidateTag } from 'next/cache'
export default async  function apiRequest(url,method , body,headers) {
    await  axios({url, method , data : body , headers : {
        "Content-Type" : "application/json",
        "Cache-Control": "private, max-age=60",
        ...headers
    }})
    revalidateTag("todos")
    return
}
