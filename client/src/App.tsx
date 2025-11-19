import { useState } from 'react'
import './App.css'

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const sendRequest = async () => {
    console.log('description...' + description);
    console.log('file...' + file);
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    try {
      formData.append('description', description);
      console.log(formData);
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResponse(data.tips);
      console.log(data);
    } catch (e: any) {
      console.error('Expectation Failed:', e.error);
    }
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
          <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </label>
        {file && (
          <div className="preview-container">
            <h3>Preview:</h3>
            <iframe src={URL.createObjectURL(file)} title="Uploaded PDF" />
          </div>
        )}
        <button className='submit-btn' onClick={sendRequest}>Submit</button>
        {response && (
          <div className='response-box'>
            <p>Response:</p>
            {response}
          </div>
        )
        }
      </div>
    </>
  )
}

export default App
