const video = document.getElementById('video')

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
]).then(startVideo);

function startVideo() {
    navigator.getUserMedia(
        { video: {} },
        stream => video.srcObject = stream,
        err => console.error(err)
    )
}


video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());
        const landmarks = await faceapi.detectFaceLandmarks(video);
        const landmarkPositions = landmarks.positions;

        const mouth = landmarks.getMouth();

        // console.log(mouth[10])

        // Call this function to extract and display face
        if (detections[0] !== undefined) {
            extractFaceFromBox(video, detections[0].box)
        } else {
            console.log('인식된 얼굴이 없습니다.');
        }

        // if (mouth[0] !== undefined) {
        //     extractFaceFromBox(video, mouth[0])
        //     console.log(mouth)
        // } else {
        //     console.log('인식된 얼굴이 없습니다.');
        // }

        const resizedDetections = faceapi.resizeResults(detections, displaySize)

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections)
    }, 100)
})



let outputImage = document.getElementById('outputImage');

// This function extract a face from video frame with giving bounding box and display result into outputimage
async function extractFaceFromBox(inputImage, box) {
    const regionsToExtract = [
        new faceapi.Rect(box.x, box.y, box.width, box.height)
    ]

    let faceImages = await faceapi.extractFaces(inputImage, regionsToExtract)

    if (faceImages.length == 0) {
        console.log('Face not found')
    }
    else {
        faceImages.forEach(cnv => {
            outputImage.style.backgroundImage = `url(${cnv.toDataURL()})`;
            outputImage.style.backgroundBlendMode = 'difference';
        })
    }
}