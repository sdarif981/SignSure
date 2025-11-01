import useUserStore from '@/store/userStore'
import React from 'react'
import { Navigate } from 'react-router-dom'

const Protected = ({children}) => {
  const user=useUserStore((state)=>state.user)
  
  return user?children:<Navigate to="/login" replace/>
}

export default Protected