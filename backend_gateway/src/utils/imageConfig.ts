const imageConfig = (imageData: string | Buffer): Buffer => {
    if (Buffer.isBuffer(imageData)) {
        return imageData;
    }

    if (typeof imageData === 'string') {
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, "");
        return Buffer.from(base64Data, 'base64');
    }

    throw new Error("Định dạng ảnh không hợp lệ. Chỉ chấp nhận Base64 string hoặc Buffer.");
};

export default imageConfig;