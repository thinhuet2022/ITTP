const archiver = require('archiver');
const fs = require('fs');

/**
 * 
 * @param {list of string} fileList - list of file paths required to zip 
 * @param {string} zipPath - directory of output zip file
 */
function zip(fileList, zipPath){
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip');

    output.on('close', () => {
        res.download(zipPath, 'images.zip', (err) => {
            if (err) {
                console.error(err);
            }
            // Xóa file zip sau khi tải xong
            fs.unlinkSync(zipPath);
            // Xóa các ảnh sau khi đã nén
            files.forEach((file) => fs.unlinkSync(file.path));
        });
    });

    archive.on('error', (err) => {
        console.error(err);
        res.status(500).send('Error creating zip file');
    });

    archive.pipe(output);
}