import { useState } from 'react'
import ReactMarkdown from "react-markdown";
import './App.css'

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>("");
  const [response, setResponse] = useState<string>("");

  const sendRequest = async () => {
      if (!file || !description) {
      alert('Please upload a file and enter a description.');
      return;
    }
    setResponse('loading....');
    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }
    try {
      formData.append('description', description);
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      setResponse(data.tips);
     
    } catch (e: any) {
      console.error('Expectation Failed:', e.error);
    }
  };

  function ResultBox({ dataTips }: { dataTips: string }) {
    return (
      <div className="markdown-body">
        <ReactMarkdown>{dataTips}</ReactMarkdown>
      </div>
    );
  }

  const downloadCV = async () => {
    const response = await fetch('http://localhost:3000/api/download', {
      method: 'GET',
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "CV After changes.pdf";
    a.click();

    window.URL.revokeObjectURL(url);
  };
  return (
    <>
      <p className='title'>upload CV and job description and let us do the job for you!</p>
      <div className='main-container'>
        <div className="app-container">
          <textarea className='description-box'
            placeholder="Enter job description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className='upload-label'>
            Upload PDF:
            <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <button className='submit-btn' onClick={sendRequest}>Submit</button>

        </div>
        <div className='response-box'>
          <p>here goes the results:</p>
           {response&& (
            <>
              <ResultBox dataTips={response} />
              {response!== 'loading....' &&(
              <button className='download-btn' onClick={downloadCV}>
                download the updated cv
              </button>
              ) }
            </>
          )}
           </div>
      </div>
    </>
  )
}

export default App
