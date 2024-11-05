'use client'
import React, {useState} from 'react';
import axios from 'axios';
import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const UploadImage = () => {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };
    const handleUpload = async () => {
        if (!image) {
            toast.warn('Please select an image');
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append('image', image);
        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            console.log('Image uploaded successfully', response.data);
            toast.success('Image uploaded successfully');
            setImage(null);
        } catch (error) {
            console.error('Error uploading image', error);
            toast.error('Error uploading image');
        } finally {
            setUploading(false);
        }
    }

    function handleDragOver(event) {
        event.preventDefault();
    }

    function handleDrop(event) {
        event.preventDefault();
        const droppedFiles = event.dataTransfer.files;
        if (droppedFiles.length > 0) {
            setImage(droppedFiles[0]);
        }
        setIsDragging(false);
    }

    const handleDragEnter = () => {
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };
    return (

        <div className="h-1/2 flex flex-col items-center p-6 bg-gray-100 border border-gray-300 rounded-md mt-6">
            <h2 className="text-xl font-semibold mb-4">Upload your image</h2>
            <div className='flex flex-row  w-full '>
                <div id='drag-drop' className="flex items-center justify-center w-1/2">
                    <label htmlFor="dropzone-file"
                           className={`flex flex-col items-center ${isDragging ? 'opacity-60' : 'opacity-100'} justify-center
                               w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50  dark:bg-gray-700
                               hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500`}
                           onDragOver={handleDragOver}
                           onDrop={handleDrop}
                           onDragEnter={handleDragEnter}
                           onDragLeave={handleDragLeave}
                    >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 mb-6">
                            <div
                                className="flex items-center justify-center w-16 h-16 mb-4 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow duration-300"
                            >
                                <span className="text-3xl text-gray-800 font-bold">+</span>
                            </div>
                            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span
                                className="font-semibold">Click to upload</span> or
                                drag and drop</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG(MAX.
                                800x400px)</p>
                        </div>
                        <input id="dropzone-file" type="file" name='image' onChange={handleImageChange}
                               className="hidden"/>
                    </label>
                </div>
                <div className='relative h-full w-1/2 ml-6'>
                    {image && <img src={URL.createObjectURL(image)} alt="Uploaded Preview"
                                   className="w-[200px] h-[200px] object-cover rounded-md"/>}
                    <div className='absolute top-[325px] right-0'>
                        <button
                            className=" ml-auto mr-2 px-4 w-36 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-300"
                            disabled={uploading}
                            onClick={() => setImage(null)}
                        >
                            Reset
                        </button>
                        <button
                            className=" ml-auto mr-2 px-4 w-36 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-300"
                            disabled={uploading}
                        >
                            Download PDF
                        </button>
                        <button
                            onClick={handleUpload}
                            className=" ml-auto px-4 py-2 w-36 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-300"
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Image'}
                        </button>

                    </div>

                </div>
            </div>


            <ToastContainer
                position="bottom-left"
                autoClose={3000}
                hideProgressBar={false}
                closeOnClick
                pauseOnHover
                draggable
                theme="colored"
                style={{fontSize: '14px'}} // Ví dụ thêm CSS tùy chỉnh
            />
        </div>
    );
};

export default UploadImage;
