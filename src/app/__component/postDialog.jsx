'use client'
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { supabaseClient } from "@/lib/supabase-client"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
 
export function DialogDemo({ open, onOpenChange, onPostCreated }) {
  const supabase = supabaseClient()
 
  const [description, setDescription] = useState('')
  const [animalType, setAnimalType] = useState('')
  const [location, setLocation] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
 
  const resetForm = () => {
    setDescription('')
    setAnimalType('')
    setLocation('')
    setFile(null)
    setErrorMsg('')
  }
 
  const handleSave = async () => {
    if (!description || !animalType || !file) {
      setErrorMsg("Please fill out description, animal type, and picture")
      return
    }
 
    setUploading(true)
    setErrorMsg('')
 
    const fileExt = file.name.split('.').pop()
    const randomString = Math.random().toString(36).slice(2, 12)
    const fileName = `${Date.now()}-${randomString}.${fileExt}`
    const filePath = `pets/${fileName}`
 
    const { error: uploadError } = await supabase.storage
      .from('pet-images')
      .upload(filePath, file)
 
    if (uploadError) {
      setErrorMsg("Image upload failed: " + uploadError.message)
      setUploading(false)
      return
    }
 
   
    const { error: insertError } = await supabase.from('pets').insert({
      description: description,
      animal_type: animalType,
      location: location,
      image_path: filePath,
    })
 
    setUploading(false)
 
    if (insertError) {
      setErrorMsg("Failed to save post: " + insertError.message)
      return
    }
 
    resetForm()
    onOpenChange(false)

    if (onPostCreated) {
      onPostCreated()
    }
  }
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Post a Found/Lost Animal</DialogTitle>
          <DialogDescription>
            Give details to help others identify the animal.
          </DialogDescription>
        </DialogHeader>
 
        <FieldGroup>
          <Field>
            <Label htmlFor="animal-type">Animal type</Label>
            <Input
              id="animal-type"
              placeholder="e.g. Dog, Cat, Bird"
              value={animalType}
              onChange={(e) => setAnimalType(e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Breed, color, size, distinguishing marks..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Where was it seen?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="picture">Picture</Label>
            <Input
              id="picture"
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Field>
        </FieldGroup>
 
        {errorMsg && <p className="text-sm text-red-500">{errorMsg}</p>}
 
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <Button onClick={handleSave} disabled={uploading}>
            {uploading ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}