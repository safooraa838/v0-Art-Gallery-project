"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Heart, Share2 } from "lucide-react"
import { useLocalStorage } from "../../hooks/use-local-storage"
import { useToast } from "@/components/ui/use-toast"

interface Artwork {
  id: string
  title: string
  artist: string
  imageUrl: string
  description: string
  likes: number
  date?: string
  createdAt?: string
}

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [artwork, setArtwork] = useState<Artwork | null>(null)
  const [loading, setLoading] = useState(true)
  const [likedArt, setLikedArt] = useLocalStorage<string[]>("liked-art", [])
  const [communityArt, setCommunityArt] = useLocalStorage<Artwork[]>("community-art", [])
  const id = params.id as string

  useEffect(() => {
    const fetchArtwork = async () => {
      // First check if it's a community artwork
      const communityArtwork = communityArt.find((art) => art.id === id)

      if (communityArtwork) {
        setArtwork(communityArtwork)
        setLoading(false)
        return
      }

      // If not, try to fetch from the API
      try {
        const response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`)
        const data = await response.json()

        if (data && data.objectID) {
          setArtwork({
            id: data.objectID.toString(),
            title: data.title,
            artist: data.artistDisplayName || "Unknown Artist",
            imageUrl: data.primaryImage,
            description: data.objectDescription || data.classification || "No description available",
            likes: Math.floor(Math.random() * 100),
            date: data.objectDate,
          })
        } else {
          // If not found in API, use placeholder
          setArtwork({
            id: id,
            title: "Artwork Not Found",
            artist: "Unknown",
            imageUrl: "/placeholder.svg?height=600&width=400&text=Not+Found",
            description: "This artwork could not be found.",
            likes: 0,
          })
        }
      } catch (error) {
        console.error("Error fetching artwork:", error)
        setArtwork({
          id: id,
          title: "Error Loading Artwork",
          artist: "Unknown",
          imageUrl: "/placeholder.svg?height=600&width=400&text=Error",
          description: "There was an error loading this artwork.",
          likes: 0,
        })
      } finally {
        setLoading(false)
      }
    }

    fetchArtwork()
  }, [id, communityArt])

  const handleLike = () => {
    if (!artwork) return

    if (likedArt.includes(artwork.id)) {
      setLikedArt(likedArt.filter((artId) => artId !== artwork.id))
      setArtwork({
        ...artwork,
        likes: artwork.likes - 1,
      })
    } else {
      setLikedArt([...likedArt, artwork.id])
      setArtwork({
        ...artwork,
        likes: artwork.likes + 1,
      })
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: artwork?.title || "ArtSpace Gallery",
        text: `Check out "${artwork?.title}" by ${artwork?.artist} on ArtSpace Gallery`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copied",
        description: "Artwork link copied to clipboard",
      })
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-[500px] w-full" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-1/4" />
            <div className="pt-4">
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Button>
        <h2 className="text-2xl font-bold">Artwork Not Found</h2>
        <p className="mt-2 text-muted-foreground">The artwork you're looking for could not be found.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Gallery
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-[500px] w-full">
          <Image src={artwork.imageUrl || "/placeholder.svg"} alt={artwork.title} fill className="object-contain" />
        </div>

        <div>
          <h1 className="text-3xl font-bold">{artwork.title}</h1>
          <h2 className="text-xl text-muted-foreground mt-2">{artwork.artist}</h2>
          {artwork.date && <p className="text-sm text-muted-foreground mt-1">{artwork.date}</p>}
          {artwork.createdAt && (
            <p className="text-sm text-muted-foreground mt-1">
              Submitted on {new Date(artwork.createdAt).toLocaleDateString()}
            </p>
          )}

          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2">Description</h3>
            <p className="text-muted-foreground">{artwork.description}</p>
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              onClick={handleLike}
              className={likedArt.includes(artwork.id) ? "text-rose-500" : ""}
            >
              <Heart className={`h-4 w-4 mr-2 ${likedArt.includes(artwork.id) ? "fill-rose-500" : ""}`} />
              {artwork.likes} {artwork.likes === 1 ? "Like" : "Likes"}
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
