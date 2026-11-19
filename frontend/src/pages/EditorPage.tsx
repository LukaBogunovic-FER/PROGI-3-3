// Reacts hooks for managing component state, references and effects
import { useEffect, useState, useRef } from 'react'

// ImageJS utilities for reading, processing and displaying images
import { Image, readImg, writeCanvas } from 'image-js'

// Mantine UI components for the editor interface
import { Title, Tabs, Button, Group, Stack, Slider, Text, Select } from '@mantine/core'

// Available image operations, categories and default parameters
import { applyOp, OPS, CATEGORY_LABELS, defaultParams } from '../imaging/ops'

// Type definition for image operation parameters
import type { Params } from '../imaging/ops'

// API utilities for uploading images
import { uploadImage } from '../api/images'

/**
 * Image editor page.
 * Allows users to upload an image, apply editing operations
 * and reset the image to its original state.
 */
export default function EditorPage() {

  // Image state
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  // Selected operation and its parameters
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null)
  const [opParams, setOpParams] = useState<Params>({})
  
  // References to the canvas, original image and current edited image
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const editedImageRef = useRef<Image | null>(null)

  /**
   * Handles image selection from the user's device.
   * Accepts only image files.
   */
  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {

    const file = event.target.files?.[0]

    if (!file || !file.type.startsWith('image/')) {
      return
    }

    setImageFile(file)
  }

  /**
   * Reads the uploaded image and displays it on the canvas.
   * Also stores the image as the current editable version.
   */
  function handleImageLoad() {

    if (!imageRef.current || !canvasRef.current) {
      return
    }

    const image = readImg(imageRef.current)

    editedImageRef.current = image
    writeCanvas(image, canvasRef.current)
  }

  /**
   * Applies the selected editing operation to the current image
   * and updates the canvas with the result.
   */
  function handleApplyOp(id: string) {

    if (!editedImageRef.current || !canvasRef.current) {
      return
    }

    const result = applyOp(id, editedImageRef.current, opParams)

    editedImageRef.current = result.image
    writeCanvas(result.image, canvasRef.current)
  }

  /**
   * Selects an editing operation and initializes
   * its parameters with their default values.
   */
  function handleSelectOp(id: string) {

    const op = OPS.find(op => op.id === id)

    if (!op) {
      return
    }

    setSelectedOpId(id)
    setOpParams(defaultParams(op))
  }

  /**
   * Updates the value of an operation parameter.
   */
  function handleParamChange(key: string, value: number | string) {

    setOpParams(prev => ({
      ...prev,
      [key]: value
    }))
  }

  /**
   * Restores the original uploaded image,
   * removing all previously applied edits.
   */
  function handleResetChanges() {

    if (!imageRef.current || !canvasRef.current) {
      return
    }

    const originalImage = readImg(imageRef.current)

    editedImageRef.current = originalImage
    writeCanvas(originalImage, canvasRef.current)
  }

  // Saves the currently edited image to the backend
  async function handleSaveImage() {

      // Check whether the canvas contains an image
      if (!canvasRef.current || !editedImageRef.current) return

      // Convert the canvas content into a PNG file
      const blob = await new Promise<Blob | null>((resolve) => {
          canvasRef.current?.toBlob(resolve, 'image/png')
      })

      if (!blob) {
          alert('Failed to prepare image for saving.')
          return
      }

      try {
          // Upload the edited image to the backend
          const filename = await uploadImage(blob)

          // Notify the user about successful upload
          alert(`Image saved successfully: ${filename}`)
      } catch (error) {
          console.error('Failed to save image:', error)
          alert('Failed to save image.')
      }
  }

  /**
   * Creates a temporary URL for the selected image.
   * Releases the previous URL when the image changes
   * or when the component unmounts.
   */
  useEffect(() => {

    if(!imageFile) {
      setImageUrl(null)
      return
    }

    // Create a temporary URL
    const url = URL.createObjectURL(imageFile)

    setImageUrl(url)

    // Release the URL
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  // Render the editor interface
  return (
    <main>

      <Title order={2}>Image Editor</Title>

      {/* Select an image from the user's device */}
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

          {/* Canvas displaying the edited image */}
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

          {/* Editing operation categories */}
          <Tabs 
            defaultValue="filter"
            onChange={() => {
              setSelectedOpId(null)
              setOpParams({})
            }}
          >
            <Tabs.List>
              {Object.entries(CATEGORY_LABELS).map(([category, label]) => {

                const operations = OPS.filter(op => op.category === category)

                if (operations.length === 0) return null

                return (
                  <Tabs.Tab key={category} value={category}>
                    {label}
                  </Tabs.Tab>
                )
              })}
            </Tabs.List>
            
            {/* Operations available within each category */}
            {Object.entries(CATEGORY_LABELS).map(([category]) => {

              const operations = OPS.filter(op => op.category === category)

              if (operations.length === 0) return null

              return (
                <Tabs.Panel key={category} value={category} pt="md">
                  <Group gap="sm">
                    {operations.map(op => (
                      <Button
                        key={op.id}
                        variant="light"
                        onClick={() => handleSelectOp(op.id)}
                      >
                        {op.label}
                      </Button>
                    ))}
                  </Group>
                </Tabs.Panel>
              )
            })}
          </Tabs>
          
          {/* Selected operation and its configurable parameters */}
          {selectedOpId && (
            <div>
              <p>
                Selected operation: {OPS.find(op => op.id === selectedOpId)?.label}
              </p>

              {OPS.find(op => op.id === selectedOpId)?.params.map(param => (
                <div key={param.key}>
                  {param.type === 'number' ? (
                    <Stack gap="xs" w={250}>
                      <Group justify="space-between">
                        <Text size="sm">{param.label}</Text>
                        <Text size="sm" fw={600}>
                          {opParams[param.key] ?? param.default}
                        </Text>
                      </Group>

                      <Slider
                        min={param.min}
                        max={param.max}
                        step={param.step}
                        value={Number(opParams[param.key] ?? param.default)}
                        onChange={value => handleParamChange(param.key, value)}
                        label={value => `${value}`}
                      />
                    </Stack>
                  ) : (
                    <Select
                      label={param.label}
                      data={param.options}
                      value={String(opParams[param.key] ?? param.default)}
                      onChange={value => {
                        if (value !== null) {
                          handleParamChange(param.key, value)
                        }
                      }}
                    />
                  )}
                </div>
              ))}

              {/* Apply the selected operation */}
              <Button onClick={() => handleApplyOp(selectedOpId)}>
                Apply
              </Button>
            </div>
          )}

          {/* Restore the original image */}
          <Stack mt="md" align="flex-start">
            <Button color="red" variant="outline" onClick={handleResetChanges}>
              Reset Changes
            </Button>

            <Button onClick={handleSaveImage}>
                Save
            </Button>
          </Stack>
        </>
      )}
    </main>
  )
}