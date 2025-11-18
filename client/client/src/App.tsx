import { useState } from 'react'
import './App.css'

function App() {
   const [file, setFile] = useState<File | null>(null);
   const [description, setDescription] = useState<string>("");

  const sendRequest = async () => {
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    formData.append('description', description);
    const response = await fetch('/analyze', {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    console.log(data);
  };
  return (
    <>
      <div className="app-container">
        <p className='title'>upload cv and job description and let us do the job for you</p>
        <textarea className='description-box'
          placeholder="Enter job description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
         <label className='upload-label'>
          Upload PDF:
          <input type="file" accept="application/pdf" onChange={(e)=> setFile(e.target.files?.[0]||null)} />
        </label>
        {file && (
          <div className="preview-container">
            <h3>Preview:</h3>
            <iframe src={URL.createObjectURL(file)} title="Uploaded PDF" />
          </div>
        )} 
        <button className='submit-btn' onClick={sendRequest}>Submit</button>

      </div>
    </>
  )
}

export default App
