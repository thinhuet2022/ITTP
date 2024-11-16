'use client'
import React, {useState} from "react";
import axios from "axios";

function App() {
    const [file, setFile] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isZipCreated, setIsZipCreated] = useState(false);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            alert("Please select a file first!");
            return;
        }

        setIsProcessing(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Gửi file zip lên server
            const response = await axios.post("http://localhost:5000/upload", formData);
            if (response.status !== 200) {
                throw new Error('Error creating ZIP file');
            }
            setIsZipCreated(true);
            alert('ZIP file created successfully!');

        } catch (error) {
            console.log(error);
        }
    }
    const downloadZip = async () => {
        try {
            const response = await axios.get("http://localhost:5000/download", {
                responseType: 'blob', // Đảm bảo trả về file dạng blob
            });

            const blob = new Blob([response.data], { type: 'application/zip' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'images.zip'; // Tên file tải xuống
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            console.error('Error downloading ZIP file:', error);
            alert('Failed to download ZIP file');
        }
    }

    return (
        <div style={{textAlign: "center", padding: "20px"}}>
            <h1>Image-to-Text Processor</h1>
            <input
                type="file"
                accept=".zip"
                onChange={handleFileChange}
                disabled={isProcessing}
            />
            <br/>
            <button
                onClick={handleUpload}
                disabled={!file || isProcessing}
                style={{
                    marginTop: "10px",
                    padding: "10px 20px",
                    backgroundColor: isProcessing ? "#ccc" : "#4CAF50",
                    color: "#fff",
                    border: "none",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                }}
            >
                {isProcessing ? "Processing..." : "Upload and Process"}
            </button>
            {isZipCreated && (
                <div><button onClick={downloadZip}>Download Zip</button></div>
            )}
        </div>
    );
}

export default App;
