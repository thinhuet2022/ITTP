'use client'
import React, {useState} from 'react';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';

const ImageUploader = () => {
const [images, setImages] = useState([]);
const [uploadStatus, setUploadStatus] = useState('');

// Hàm xử lý khi người dùng chọn ảnh
const handleFileChange = (e) => {
    setImages(e.target.files);
};

// Hàm xử lý khi người dùng bấm "Upload"
const handleUpload = async () => {
    const formData = new FormData();
    for (let i = 0; i < images.length; i++) {
    formData.append('images', images[i]);
    }

    try {
    const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
        'Content-Type': 'multipart/form-data',
        },
    });
    setUploadStatus(response.data.message);
    console.log('Các ảnh đã tải lên:', response.data.filePaths);
    } catch (error) {
    setUploadStatus('Có lỗi xảy ra khi upload ảnh');
    console.error(error);
    }
};

return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>Upload Multiple Images</h2>
    <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        style={{ marginBottom: '20px' }}
    />
    <button onClick={handleUpload} style={{ padding: '10px 20px' }}>
        Upload Images
    </button>
    {uploadStatus && <p>{uploadStatus}</p>}
    </div>
);
};

export default ImageUploader;

//export default UploadImage;
