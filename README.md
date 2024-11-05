# ITTP
an application that helps:
- converting from image to english text
- translate from english text to vietnamese
- transform it into a pdf file.
## Libraries and Framework
React, RabbitMQ, pdfkit, multer, tesseract, react-toastify, cors, @iamtraction/google-translate, axios, tailwindCSS
## Install
```sh
$ npm install
# chạy frontend
$ npm run dev
# chạy các worker
$ node app.js
$ cd server/utils
$ node ocr.js
$ node translate.js
$ node pdf.js
