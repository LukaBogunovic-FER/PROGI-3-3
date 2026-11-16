// Imports
import { useEffect, useState, useRef } from 'react'
import { Title } from '@mantine/core'
import { Image, readImg, writeCanvas } from 'image-js'
// import { useParams } from 'react-router-dom'

// Image Editor page
export default function EditorPage() {
  // TODO: Dohvatiti sliku s backenda koristeci imageId.
  // const { imageId } = useParams()

  // State
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  
  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const editedImageRef = useRef<Image | null>(null) // Stores the current image with all applied edits

  // Event handlers
  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file || !file.type.startsWith('image/')) {
      return
    }

    setImageFile(file)

  }

  function handleImageLoad() {
    if (!imageRef.current || !canvasRef.current) {
      return
    }

    const image = readImg(imageRef.current)

    editedImageRef.current = image
    writeCanvas(image, canvasRef.current)

  }

  /**
   * 
   *  Image editing functions 
   * 
   */
  function handleGrayscale() {
    if (!editedImageRef.current || !canvasRef.current) {
      return
    }

    const grayscaleImage = editedImageRef.current.grey()

    editedImageRef.current = grayscaleImage
    writeCanvas(grayscaleImage, canvasRef.current)

  }

  function handleInvert() {
    if (!editedImageRef.current || !canvasRef.current) {
      return
    }

    const invertedImage = editedImageRef.current.invert()

    editedImageRef.current = invertedImage
    writeCanvas(invertedImage, canvasRef.current)

  }

  function handleRotateRight() {
    if (!editedImageRef.current || !canvasRef.current) {
      return
    }

    const rotatedImage = editedImageRef.current.rotate(90)

    editedImageRef.current = rotatedImage
    writeCanvas(rotatedImage, canvasRef.current)

  }

  function handleRotateLeft() {
    if (!editedImageRef.current || !canvasRef.current) {
      return
    }

    const rotatedImage = editedImageRef.current.rotate(-90)

    editedImageRef.current = rotatedImage
    writeCanvas(rotatedImage, canvasRef.current)

  }

  function handleFlipHorizontal() {
    if (!editedImageRef.current || !canvasRef.current) {
      return
    }

    const flippedImage = editedImageRef.current.flip({ axis: 'horizontal' })

    editedImageRef.current = flippedImage
    writeCanvas(flippedImage, canvasRef.current)

  }

  function handleFlipVertical() {
    if (!editedImageRef.current || !canvasRef.current) {
      return
    }

    const flippedImage = editedImageRef.current.flip({ axis: 'vertical' })

    editedImageRef.current = flippedImage
    writeCanvas(flippedImage, canvasRef.current)

  }

  function handleResetChanges() {
    if (!imageRef.current || !canvasRef.current) {
      return
    }

    const originalImage = readImg(imageRef.current)

    editedImageRef.current = originalImage
    writeCanvas(originalImage, canvasRef.current)

  }

  // Image URL management
  useEffect(() => {
    if(!imageFile) {
      setImageUrl(null)

      return

    }

    // Create a temporary URL for the selected image
    const url = URL.createObjectURL(imageFile)

    setImageUrl(url)

    // Release the URL when the image changes or the component unmounts
    return () => URL.revokeObjectURL(url)

  }, [imageFile])

  // Render
  return (
    <main>
      <Title order={2}>Image Editor</Title>

      {/* Image upload */}
      <input 
        type='file'
        accept='image/*'
        onChange={handleImageChange}
      />

      {imageUrl && (
        <>
          {/* Hidden original image used by ImageJS */}
          <img 
            ref={imageRef}
            src={imageUrl}
            alt="Original image" 
            onLoad={handleImageLoad}
            style={{ display: 'none' }}
          />

          {/* Edited image preview */}
          <canvas
            ref={canvasRef}
            style={{
              display: 'block',
              width: 'auto',
              height: 'auto',
              maxWidth: '100%',
              maxHeight: '30rem',
            }}
          />

          {/* Image editing controls */}
          <button onClick={handleGrayscale}>
            Grayscale
          </button>

          <button onClick={handleInvert}>
            Invert
          </button>

          <button onClick={handleRotateRight}>
            Rotate Right
          </button>

          <button onClick={handleRotateLeft}>
            Rotate Left
          </button>

          <button onClick={handleFlipHorizontal}>
            Flip Horizontal
          </button>

          <button onClick={handleFlipVertical}>
            Flip Vertical
          </button>

          <button onClick={handleResetChanges}>
            Reset Changes
          </button>

        </>

      )}

    </main>

  )

}