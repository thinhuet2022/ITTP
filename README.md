# ITTP
Ứng dụng giúp chuyển đổi ảnh tiếng Anh sang file pdf tiếng Việt. Các bước bao gồm:

1. Người dùng tải một số ảnh văn bản tiếng Anh lên hệ thống;
2. Hệ thống chuyển đổi ảnh thành văn bản tiếng Anh;
3. Hệ thống dịch văn bản tiếng Anh sang tiếng Việt;
4. Hệ thống tạo các file pdf tiếng Việt tương ứng;
5. Hệ thống trả về file zip chứa các file pdf cho người dùng.

## 📓 Mục lục
1. [Công nghệ](#công-nghệ)
2. [Điều kiện tiên quyết](#điều-kiện-tiên-quyết)
3. [Cài đặt và sử dụng](#cài-đặt-và-sử-dụng)

## ⚙Công nghệ
### Front-end:
- ⚛️ React
- 📦 axios
- 🎨 TailwindCSS
- 🔔 Next.js
### Back-end:
- 🚀 Node.js
- ⚡ Express.js
- 📡 Apache Kafka
- 🐰 RabbitMQ
- 📝 pdfkit
- 📤 multer
- 🔍 Tesseract
- 🌐 CORS
- 🈶 open-google-translator
- ⚙️ pm2

## ⚠Yêu cầu
Cài đặt trước ở hệ điều hành của bạn :
+ Node.js
+ Tesseract, bạn có thể cài đặt tại đây [Tesseract](https://tesseract-ocr.github.io/tessdoc/Installation.html)
+ RabbitMQ (với phiên bản dùng message queue là rabbitMQ)
+ Apache Kafka( với phiên bản dùng Kafka để làm queue)
+ pm2 (để quản lý các tiến trình của các consumer, filter)
### Cài đặt môi trường Kafka
Sau khi download, giải nén, di chuyển tới thư mục vừa giải nén, mở 1 terminal, chạy zookeeper:
```sh
$ bin/zookeeper-server-start.sh config/zookeeper.properties
```
Mở 1 terminal khác:
```sh
$ bin/kafka-server-start.sh config/server.properties
```
Lưu ý: không tắt terminal, đây là broker message. Bạn có thể khởi chạy Kafka bằng Docker images của nó. Chi tiết xem tại [đây](https://kafka.apache.org/quickstart)

Khởi tạo các topics cần thiết đóng vai trò như queue trong Kafka, mở 1 terminal khác(vẫn ở thư mục kafka):
```sh
$ bin/kafka-topics.sh --create --topic ocr --bootstrap-server localhost:9092
$ bin/kafka-topics.sh --create --topic translate --bootstrap-server localhost:9092
$ bin/kafka-topics.sh --create --topic pdf --bootstrap-server localhost:9092
```

## 🛠Cài đặt và sử dụng
```sh
# clone the project
$ git clone https://github.com/thinhuet2022/ITTP.git

# install dependencies
$ npm install
```
### Sử dụng
Với Kafka, uncomment trong file `app.js` từ dòng 1 tới 150, comment từ dòng 152:  
```sh
# chạy backend trong thư mục gốc(cấu hình mặc định là OCR Filter chạy 3 consumer, có thể thay đổi trong file pm2.config.js)
$ npm start
```

 Với RabbitMQ, uncomment trong file `app.js` từ dòng 152, comment từ dòng 1 tới 150:  
```sh
# chạy backend với RabbitMQ
$ npm run start-rabbit
```
Truy cập localhost:5000 để sử dụng ứng dụng

Sau khi chạy xong, bạn có thể xóa các tiến trình của các consumer, filter bằng lệnh:
```sh
# xóa message trong queue RabbitMQ
$ npm run purge

# xóa các tiến trình của các consumer hay các filter 
$ npm run delete
```
