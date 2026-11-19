// React hooks for managing state and loading images
import { useEffect, useState } from 'react'

// Mantine components for the workspace layout and image gallery
import { Button, Image, SimpleGrid, Stack, Text, Title } from '@mantine/core'

// API function for retrieving stored image filenames
import { getAllImages } from '../api/images'

/**
 * Displays images stored on the backend.
 */
export default function WorkspacePage() {

    // Store filenames of images saved on the backend
    const [images, setImages] = useState<string[]>([])

    /**
     * Fetches stored images from the backend.
     */
    const loadImages = async () => {

        try {
            const filenames = await getAllImages()
            setImages(filenames)
        } catch (error) {
            console.error('Failed to load images:', error)
        }
    }

    useEffect(() => {

        // Load stored images when the workspace opens.
        void loadImages()
    }, [])

    return (
        <Stack p="md">
            <Title order={2}>Workspace</Title>

            {/* Refresh the image list without reloading the page. */}
            <Button onClick={() => void loadImages()} w="fit-content">
                Refresh
            </Button>

            {/* Display stored images or an empty gallery message. */}
            {images.length === 0 ? (
                <Text>No stored images found.</Text>
            ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
                    {images.map((filename) => (
                        <Stack key={filename} gap="xs">
                            {/* Load the image directly from the backend. */}
                            <Image
                                src={`/api/images/${encodeURIComponent(filename)}`}
                                alt={filename}
                                h={180}
                                fit="contain"
                            />
                            
                            {/* Display the stored filename. */}
                            <Text size="sm">{filename}</Text>
                        </Stack>
                    ))}
                </SimpleGrid>
            )}
        </Stack>
    )
}