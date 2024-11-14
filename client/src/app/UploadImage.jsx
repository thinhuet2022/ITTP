'use client'
import React, {useState} from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState('');

  // Xử lý khi người dùng chọn file
  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
  };

  // Xử lý khi người dùng nhấn nút upload
  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Please select at least one file to upload.');
      return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append('images', file);
    });

    try {
      // Gửi ảnh lên backend để tạo file zip
      const response = await axios.post('http://localhost:5000/upload', formData);
      setDownloadUrl('http://localhost:5000/download'); // Cập nhật URL download

      alert('Upload successful! Click download to get the zip file.');
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  return (
    <div className="App">
      <h2>Upload Images and Download as Zip</h2>
      <form onSubmit={handleUpload}>
        <input type="file" multiple onChange={handleFileChange} />
        <button type="submit">Upload</button>
      </form>
      
      {/* Nút download xuất hiện sau khi upload thành công */}
      {downloadUrl && (
        <div style={{ marginTop: '20px' }}>
          <a href={downloadUrl} download>
            <button>Download Zip</button>
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
