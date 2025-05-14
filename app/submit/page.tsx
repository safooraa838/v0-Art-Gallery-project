"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "../hooks/use-auth"
import { useLocalStorage } from "../hooks/use-local-storage"
import { v4 as uuidv4 } from "uuid"

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

export default function SubmitArtPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [communityArt, setCommunityArt] = useLocalStorage<Artwork[]>("community-art", [])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  })
  const [previewUrl, setPreviewUrl] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to submit artwork",
        variant: "destructive",
      })
      router.push("/login")
    }
  }, [user, router, toast])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // For client-side only, we'll use FileReader to create a data URL
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        setPreviewUrl(result)
        setFormData({ ...formData, imageUrl: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSubmitting(true)

    try {
      // Create new artwork entry
      const newArtwork: Artwork = {
        id: uuidv4(),
        title: formData.title,
        artist: user.username,
        imageUrl: formData.imageUrl || "/placeholder.svg?height=600&width=400&text=No+Image",
        description: formData.description,
        likes: 0,
        userId: user.id,
        createdAt: new Date().toISOString(),
      }

      // Add to localStorage
      setCommunityArt([...communityArt, newArtwork])

      toast({
        title: "Artwork submitted",
        description: "Your artwork has been added to the community gallery",
      })

      // Redirect to gallery
      router.push("/?tab=community")
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "There was an error submitting your artwork",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Submit Your Artwork</CardTitle>
          <CardDescription>Share your creative work with the ArtSpace community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Artwork Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Artwork Image</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} required />

              {previewUrl && (
                <div className="mt-4 relative h-[300px] w-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="h-full w-full object-contain border rounded-md"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Artwork"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
