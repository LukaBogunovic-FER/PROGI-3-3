// Imports
import { useEffect, useState, useRef } from 'react'
import { Title, Tabs, Button, Group, Stack, Slider, Text, Select } from '@mantine/core'
import { Image, readImg, writeCanvas } from 'image-js'
// import { useParams } from 'react-router-dom'
import { applyOp, OPS, CATEGORY_LABELS, defaultParams } from '../imaging/ops'
import type { Params } from '../imaging/ops'

// Image Editor page
export default function EditorPage() {
  // TODO: Dohvatiti sliku s backenda koristeci imageId.
  // const { imageId } = useParams()

  // State
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [selectedOpId, setSelectedOpId] = useState<string | null>(null)
  const [opParams, setOpParams] = useState<Params>({})
  
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
  function handleApplyOp(id: string) {
    if (!editedImageRef.current || !canvasRef.current) {
      return
    }

    const result = applyOp(id, editedImageRef.current, opParams)

    editedImageRef.current = result.image
    writeCanvas(result.image, canvasRef.current)
  }

  function handleSelectOp(id: string) {
    const op = OPS.find(op => op.id === id)

    if (!op) {
      return
    }

    setSelectedOpId(id)
    setOpParams(defaultParams(op))

  }

  function handleParamChange(key: string, value: number | string) {
    setOpParams(prev => ({
      ...prev,
      [key]: value
    }))

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

              <Button onClick={() => handleApplyOp(selectedOpId)}>
                Apply
              </Button>

            </div>

          )}

          <Stack mt="md" align="flex-start">
            <Button color="red" variant="outline" onClick={handleResetChanges}>
              Reset Changes
            </Button>

          </Stack>
        </>

      )}
    </main>

  )

}