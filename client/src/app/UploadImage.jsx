'use client';
import React, { useState } from "react";
import axios from "axios";

function App() {
    const [file, setFile] = useState(null);
    const [previewImages, setPreviewImages] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isZipCreated, setIsZipCreated] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event) {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles.length > 0) {
            handleFileSelect(droppedFiles);
        }
        setIsDragging(false);
    }

    const handleDragEnter = () => {
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileChange = (event) => {
        const selectedFiles = event.target.files;
        handleFileSelect(selectedFiles);
    };

    const handleFileSelect = (selectedFiles) => {
        setFile(selectedFiles);
        // Tạo URL preview cho tất cả các file
        const previews = Array.from(selectedFiles).map((file) =>
            URL.createObjectURL(file)
        );
        setPreviewImages(previews);
    };

    const handleClearQueue = () => {
        setFile(null);
        setPreviewImages([]);
    };
    const handleRemoveImage = (index) => {
        const updatedFiles = Array.from(file).filter((_, i) => i !== index);
        setFile(updatedFiles);

        const updatedPreviews = previewImages.filter((_, i) => i !== index);
        setPreviewImages(updatedPreviews);
    };


    const handleUpload = async (event) => {
        event.preventDefault();
        if (!file || file.length === 0) {
            alert("Please select a file first!");
            return;
        }

        setIsProcessing(true);

        const formData = new FormData();
        Array.from(file).forEach((file) => {
            formData.append("file", file);
        });

        try {
            // Gửi file zip lên server
            const response = await axios.post("http://localhost:5000/upload", formData);
            if (response.status !== 200) {
                throw new Error('Error creating ZIP file');
            }
            setIsZipCreated(true);
            alert('ZIP file created successfully!');
            handleClearQueue(); // Xóa hàng chờ sau khi upload xong

        } catch (error) {
            console.log(error);
        }
    };

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
            setIsProcessing(false);
            handleClearQueue();
            setIsZipCreated(false);
        } catch (error) {
            console.error('Error downloading ZIP file:', error);
            alert('Failed to download ZIP file');
        }
    };

    return (
        <div className="flex flex-col max-w-md mx-auto p-6 bg-white rounded-lg shadow-md text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Image-Translate-PDF Processor</h1>
            <p className="text-gray-600 mb-6">Upload your images and convert them into text easily.</p>

            <div
                id="drag-drop"
                className={`flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer ${
                    isDragging ? "bg-gray-200" : "bg-gray-50"
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
            >
                {previewImages.length > 0 ? (
                    <div className="relative max-w-full overflow-x-auto py-4 border-t border-gray-200">
                        <div className="flex space-x-4">
                            {previewImages.map((src, index) => (
                                <div
                                    key={index}
                                    className="relative min-w-[150px] max-w-[150px] hover:scale-110 border border-gray-300 rounded-lg shadow-md overflow-hidden"
                                >
                                    <img
                                        src={src}
                                        alt={`Preview ${index}`}
                                        className="h-36 w-full object-cover transition-transform duration-300"
                                    />
                                    <button
                                        onClick={() => handleRemoveImage(index)}
                                        className="absolute h-4 w-4 rounded-full bg-red-400 top-1 right-1 text-black text-xs"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                ) : (
                    <label htmlFor="dropzone-file" className="flex flex-col items-center">
                        <div
                            className="flex items-center justify-center w-16 h-16 mb-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                        >
                            <span className="text-3xl text-gray-800 font-bold">+</span>
                        </div>
                        <p className="text-sm text-gray-500">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">SVG, PNG, JPG(MAX. 800x400px)</p>
                    </label>
                )}
                <input
                    id="dropzone-file"
                    type="file"
                    accept="image/*"
                    multiple={true}
                    onChange={handleFileChange}
                    disabled={isProcessing}
                    className="hidden"
                />
            </div>

            <div className="mt-4 space-y-2">
                <button
                    onClick={handleUpload}
                    disabled={!file || isProcessing}
                    className={`w-full py-2 text-white font-semibold rounded-lg ${
                        isProcessing
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-600"
                    }`}
                >
                    {isProcessing ? "Processing..." : "Upload and Process"}
                </button>

                <button
                    onClick={handleClearQueue}
                    disabled={!file || isProcessing}
                    className='w-full py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg'
                >
                    Clear Queue
                </button>

                {isZipCreated && (
                    <button
                        onClick={downloadZip}
                        className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
                    >
                        Download Zip
                    </button>
                )}
            </div>
            <p className="text-gray-600 mt-3 text-sm">All your uploaded data will be deleted once you download</p>
        </div>
    );
}

export default App;
