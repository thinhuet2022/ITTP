# ITTP
an application that helps:
- converting from image to english text
- translate from english text to vietnamese
- transform it into a pdf file.
## Libraries and Framework
React, RabbitMQ, pdfkit, multer, tesseract, react-toastify, cors, @iamtraction/google-translate, axios, tailwindCSS
## Prerequisites
- Node.js
- RabbitMQ: kết nối với RabbitMQ server 
## Install
```sh
# clone the project
$ git clone https://github.com/thinhuet2022/ITTP.git

# install dependencies
$ npm install

# chạy frontend
$ npm run dev

# chạy backend (cấu hình mặc định là mỗi FIlter chạy 3 tiến trình song song, có thể thay đổi trong file pm2.config.js)
$ npm start

# xóa message trong queue
$ npm run delete

# xóa các tiến trình chạy backend 
$ npm run delete
```