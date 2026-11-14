// External dependencies
import { BrowserRouter, Routes, Route } from 'react-router'

// App components
import Header from './app/components/Header'

// Features
import ImageEditor from './features/image-editor/ImageEditor'
import Social from './features/social/Social'

// Styles
import './App.css'

// App component
function App() {
  // Render
  return (
    <BrowserRouter>
      <Header/>

      <Routes>
        <Route
          path="/"
          element={
            <main>
              <h1>Welcome to Pictora</h1>
              <p>Create, edit and share your images.</p>
            </main>
          }
        />

        <Route path="/editor" element={<ImageEditor/>}/>

        <Route path="/social" element={<Social/>}/>
      
      </Routes>

    </BrowserRouter>

  )

}

// Export
export default App