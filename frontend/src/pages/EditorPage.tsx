import { Title } from '@mantine/core'
import { useParams } from 'react-router-dom'

// luka dalje radi ovdje, ovo je samo test zasad

export default function EditorPage() {
  const { imageId } = useParams()
  return <Title order={2}>Editor, image {imageId}</Title>
}