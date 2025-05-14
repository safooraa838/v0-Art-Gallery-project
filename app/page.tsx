"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { PlusCircle, LogIn, LogOut, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { Gallery } from "./components/gallery"
import { useAuth } from "./hooks/use-auth"

export default function HomePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("explore")

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">ArtSpace Gallery</h1>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          {user ? (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => router.push("/profile")}>
                <User className="h-4 w-4 mr-2" />
                {user.username}
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button onClick={() => router.push("/submit")} size="sm">
                <PlusCircle className="h-4 w-4 mr-2" />
                Submit Art
              </Button>
            </div>
          ) : (
            <Button onClick={() => router.push("/login")} size="sm">
              <LogIn className="h-4 w-4 mr-2" />
              Login / Register
            </Button>
          )}
        </div>
      </header>

      <Tabs defaultValue="explore" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="explore">Explore Curated Art</TabsTrigger>
          <TabsTrigger value="community">Community Submissions</TabsTrigger>
        </TabsList>
        <TabsContent value="explore">
          <Gallery source="api" />
        </TabsContent>
        <TabsContent value="community">
          <Gallery source="community" />
        </TabsContent>
      </Tabs>
    </div>
  )
}
