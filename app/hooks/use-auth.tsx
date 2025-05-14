"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { v4 as uuidv4 } from "uuid"
import { useLocalStorage } from "./use-local-storage"

interface User {
  id: string
  username: string
  email: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => void
  register: (username: string, email: string, password: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  register: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useLocalStorage<Array<User & { password: string }>>("users", [])
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>("current-user", null)

  useEffect(() => {
    // Check if user is already logged in
    if (currentUser) {
      setUser(currentUser)
    }
  }, [currentUser])

  const login = (username: string, password: string) => {
    const user = users.find((u) => u.username === username && u.password === password)

    if (!user) {
      throw new Error("Invalid username or password")
    }

    // Don't store password in current user
    const { password: _, ...userWithoutPassword } = user
    setCurrentUser(userWithoutPassword)
    setUser(userWithoutPassword)
  }

  const register = (username: string, email: string, password: string) => {
    // Check if username or email already exists
    if (users.some((u) => u.username === username)) {
      throw new Error("Username already taken")
    }

    if (users.some((u) => u.email === email)) {
      throw new Error("Email already registered")
    }

    const newUser = {
      id: uuidv4(),
      username,
      email,
      password,
      createdAt: new Date().toISOString(),
    }

    setUsers([...users, newUser])

    // Don't store password in current user
    const { password: _, ...userWithoutPassword } = newUser
    setCurrentUser(userWithoutPassword)
    setUser(userWithoutPassword)
  }

  const logout = () => {
    setCurrentUser(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
