import { apiFetch } from './http'
// Uploads an image to the backend and returns its generated filename
export async function uploadImage(file: Blob): Promise<string> {

    // Prepare the image as multipart form data
    const formData = new FormData()
    formData.append('file', file, 'edited-image.png')

    // Send the image to the backend
    const response = await apiFetch('/api/images', {
        method: 'POST',
        body: formData,
    })

    // Throw an error if the upload failed
    if (!response.ok) {
        throw new Error('Failed to upload image')
    }

    // Return the generated filename
    return response.text()
}

// Fetch filenames of all stored images.
export async function getAllImages(): Promise<string[]> {
    
  const response = await apiFetch("/api/images");

  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }

  return response.json();
}