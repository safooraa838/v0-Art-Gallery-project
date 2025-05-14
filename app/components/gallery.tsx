"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Heart, Info } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocalStorage } from "../hooks/use-local-storage"

interface Artwork {
  id: string
  title: string
  artist: string
  imageUrl: string
  description: string
  likes: number
  date?: string
}

export function Gallery({ source }: { source: "api" | "community" }) {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const [likedArt, setLikedArt] = useLocalStorage<string[]>("liked-art", [])
  const [communityArt, setCommunityArt] = useLocalStorage<Artwork[]>("community-art", [])

  useEffect(() => {
    if (source === "api") {
      // Fetch from Metropolitan Museum of Art API
      const fetchArt = async () => {
        try {
          // First get object IDs
          const response = await fetch(
            "https://collectionapi.metmuseum.org/public/collection/v1/search?hasImages=true&q=painting",
          )
          const data = await response.json()

          // Get details for first 12 objects
          const artPromises = data.objectIDs.slice(0, 12).map(async (id: number) => {
            const detailResponse = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
            return await detailResponse.json()
          })

          const artDetails = await Promise.all(artPromises)

          const formattedArt = artDetails
            .filter((art: any) => art.primaryImage)
            .map((art: any) => ({
              id: art.objectID.toString(),
              title: art.title,
              artist: art.artistDisplayName || "Unknown Artist",
              imageUrl: art.primaryImage,
              description: art.objectDescription || art.classification || "No description available",
              likes: Math.floor(Math.random() * 100),
              date: art.objectDate,
            }))

          setArtworks(formattedArt)
        } catch (error) {
          console.error("Error fetching art:", error)
          // Fallback to placeholder data
          setArtworks(generatePlaceholderArt(8))
        } finally {
          setLoading(false)
        }
      }

      fetchArt()
    } else {
      // Load community submissions from localStorage
      setArtworks(communityArt)
      setLoading(false)
    }
  }, [source, communityArt])

  const handleLike = (id: string) => {
    if (likedArt.includes(id)) {
      setLikedArt(likedArt.filter((artId) => artId !== id))
      setArtworks(artworks.map((art) => (art.id === id ? { ...art, likes: art.likes - 1 } : art)))
    } else {
      setLikedArt([...likedArt, id])
      setArtworks(artworks.map((art) => (art.id === id ? { ...art, likes: art.likes + 1 } : art)))
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-[300px] w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardHeader>
            </Card>
          ))}
      </div>
    )
  }

  if (source === "community" && artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-4">No community submissions yet</h3>
        <p className="text-muted-foreground mb-6">Be the first to share your artwork with our community!</p>
        <Button onClick={() => router.push("/submit")}>Submit Your Art</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {artworks.map((artwork) => (
        <Card key={artwork.id} className="overflow-hidden flex flex-col h-full">
          <div className="relative h-[300px] w-full">
            <Image src={artwork.imageUrl || "/placeholder.svg"} alt={artwork.title} fill className="object-cover" />
          </div>
          <CardHeader className="pb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{artwork.title}</h3>
            <p className="text-sm text-muted-foreground">{artwork.artist}</p>
            {artwork.date && <p className="text-xs text-muted-foreground">{artwork.date}</p>}
          </CardHeader>
          <CardContent className="pb-2 flex-grow">
            <p className="text-sm line-clamp-3">{artwork.description}</p>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLike(artwork.id)}
              className={likedArt.includes(artwork.id) ? "text-rose-500" : ""}
            >
              <Heart className={`h-4 w-4 mr-2 ${likedArt.includes(artwork.id) ? "fill-rose-500" : ""}`} />
              {artwork.likes}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(`/artwork/${artwork.id}`)}>
              <Info className="h-4 w-4 mr-2" />
              Details
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function generatePlaceholderArt(count: number): Artwork[] {
  return Array(count)
    .fill(0)
    .map((_, i) => ({
      id: `placeholder-${i}`,
      title: `Artwork ${i + 1}`,
      artist: "Sample Artist",
      imageUrl: `/placeholder.svg?height=600&width=400&text=Artwork+${i + 1}`,
      description: "This is a placeholder artwork description when the API is unavailable.",
      likes: Math.floor(Math.random() * 100),
    }))
}
