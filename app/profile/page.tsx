"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "../hooks/use-auth"
import { useLocalStorage } from "../hooks/use-local-storage"
import { PlusCircle, Heart, Pencil, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Artwork {
  id: string
  title: string
  artist: string
  imageUrl: string
  description: string
  likes: number
  userId: string
  createdAt: string
}

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout } = useAuth()
  const { toast } = useToast()
  const [communityArt, setCommunityArt] = useLocalStorage<Artwork[]>("community-art", [])
  const [likedArt, setLikedArt] = useLocalStorage<string[]>("liked-art", [])
  const [userArtworks, setUserArtworks] = useState<Artwork[]>([])
  const [likedArtworks, setLikedArtworks] = useState<Artwork[]>([])

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      router.push("/login")
      return
    }

    // Filter artworks created by the user
    const userArt = communityArt.filter((art) => art.userId === user.id)
    setUserArtworks(userArt)

    // Filter artworks liked by the user
    const liked = communityArt.filter((art) => likedArt.includes(art.id))
    setLikedArtworks(liked)
  }, [user, router, communityArt, likedArt])

  const handleDeleteArtwork = (id: string) => {
    // Remove from community art
    setCommunityArt(communityArt.filter((art) => art.id !== id))

    // Update local state
    setUserArtworks(userArtworks.filter((art) => art.id !== id))

    toast({
      title: "Artwork deleted",
      description: "Your artwork has been removed from the gallery",
    })
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Profile</CardTitle>
              <CardDescription>Manage your account and artworks</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={logout}>
                Logout
              </Button>
              <Button onClick={() => router.push("/submit")}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Submit New Art
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative h-24 w-24 rounded-full overflow-hidden border">
              <Image
                src="/placeholder.svg?height=200&width=200&text=User"
                alt={user.username}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">{user.username}</h2>
              <p className="text-muted-foreground">{user.email}</p>
              <p className="mt-2">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="my-art" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="my-art">My Artworks</TabsTrigger>
          <TabsTrigger value="liked">Liked Artworks</TabsTrigger>
        </TabsList>

        <TabsContent value="my-art">
          {userArtworks.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-4">You haven't submitted any artwork yet</h3>
              <p className="text-muted-foreground mb-6">Share your creative work with our community!</p>
              <Button onClick={() => router.push("/submit")}>Submit Your Art</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userArtworks.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden">
                  <div className="relative h-[200px] w-full">
                    <Image
                      src={artwork.imageUrl || "/placeholder.svg"}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <h3 className="font-semibold text-lg">{artwork.title}</h3>
                    <p className="text-xs text-muted-foreground">{new Date(artwork.createdAt).toLocaleDateString()}</p>
                  </CardHeader>
                  <CardContent className="flex justify-between">
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/artwork/${artwork.id}`)}>
                      <Heart className="h-4 w-4 mr-2" />
                      {artwork.likes}
                    </Button>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/submit?edit=${artwork.id}`)}>
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteArtwork(artwork.id)}>
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="liked">
          {likedArtworks.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium mb-4">You haven't liked any community artwork yet</h3>
              <p className="text-muted-foreground mb-6">Explore the community gallery and show your appreciation!</p>
              <Button onClick={() => router.push("/?tab=community")}>Explore Community Art</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {likedArtworks.map((artwork) => (
                <Card key={artwork.id} className="overflow-hidden">
                  <div className="relative h-[200px] w-full">
                    <Image
                      src={artwork.imageUrl || "/placeholder.svg"}
                      alt={artwork.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <h3 className="font-semibold text-lg">{artwork.title}</h3>
                    <p className="text-sm text-muted-foreground">{artwork.artist}</p>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" onClick={() => router.push(`/artwork/${artwork.id}`)}>
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
