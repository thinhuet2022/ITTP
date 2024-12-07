# :computer: ITTP
Ứng dụng giúp chuyển đổi ảnh tiếng Anh sang file pdf tiếng Việt. Các bước bao gồm:

1. Người dùng tải một số ảnh văn bản tiếng Anh lên hệ thống;
2. Hệ thống chuyển đổi ảnh thành văn bản tiếng Anh;
3. Hệ thống dịch văn bản tiếng Anh sang tiếng Việt;
4. Hệ thống tạo các file pdf tiếng Việt tương ứng;
5. Hệ thống trả về file zip chứa các file pdf cho người dùng.

## 📓 Mục lục
1. [Công nghệ](#công-nghệ)
2. [Điều kiện tiên quyết](#điều-kiện-tiên-quyết)
3. [Cài đặt](#cài-đặt)
4. [Thí nghiệm](#thí-nghiệm)
## ⚙Công nghệ
### Front-end:
- ⚛️ React
- 📦 axios
- 🎨 TailwindCSS
- 🔔 react-toastify
### Back-end:
- 🚀 Node.js
- ⚡ Express.js
- 🐰 RabbitMQ
- 📝 pdfkit
- 📤 multer
- 🔍 Tesseract
- 🌐 CORS
- 🈶 @iamtraction/google-translate
- ⚙️pm2

## ⚠Điều kiện tiên quyết
- Node.js
- RabbitMQ: kết nối với RabbitMQ server 
## 🛠Cài đặt
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
## 🔬Thí nghiệm
### Bộ dữ liệu
Mô tả
### Kết quả
Mô tả
