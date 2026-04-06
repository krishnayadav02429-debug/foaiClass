import { useState } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('')
  const [imageURL, setImageURL] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt first.")
      return
    }

    setIsLoading(true)
    setError(null)
    setImageURL(null)

    try {
      // Using Vite proxy to bypass CORS
      const response = await fetch(
        "https://router.huggingface.co/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0",
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_HF_API_KEY}`,
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({ inputs: prompt }),
        }
      )

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`)
      }

      const result = await response.blob()
      if (result.type.includes('json')) {
         // API sometimes returns JSON errors even for non-200
         const text = await result.text();
         throw new Error(`API Error details: ${text}`);
      }
      
      const objectURL = URL.createObjectURL(result)
      setImageURL(objectURL)
    } catch (err) {
      console.error(err)
      setError(err.message || "Something went wrong while generating the image.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">AI Image Generator</h1>
        <p className="subtitle">
          Bring your imagination to life using Stable Diffusion XL
        </p>

        <div className="input-group">
          <input
            type="text"
            className="prompt-input"
            placeholder="A futuristic city cyberpunk style..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={isLoading}
            onKeyDown={(e) => e.key === 'Enter' && generateImage()}
          />
          <button 
            className={`generate-btn ${isLoading ? 'loading' : ''}`} 
            onClick={generateImage}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Generating...
              </>
            ) : "Generate"}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="image-display-area">
           {!imageURL && !isLoading && !error && (
              <div className="empty-state">
                <span className="empty-state-icon">✨</span>
                <p>Your generated image will appear here</p>
              </div>
           )}

           {isLoading && (
              <div className="skeleton-loader">
                 <div className="shimmer"></div>
              </div>
           )}

           {imageURL && !isLoading && (
             <div className="image-wrapper">
               <img src={imageURL} alt={prompt} className="generated-image" />
               <a href={imageURL} download="ai_generated_image.png" className="download-btn">
                 Download Image
               </a>
             </div>
           )}
        </div>
      </div>
    </div>
  )
}

export default App
