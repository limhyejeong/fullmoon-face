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
        // const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions());

        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions();
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        // const detectionsWithLandmarks = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
        // console.log(detectionsWithLandmarks[0].landmarks.positions)

        // Call this function to extract and display face
        if (detections[0] !== undefined) {
            // extractFaceFromBox(video, detections[0].detection.box)
        } else {
            console.log('인식된 얼굴이 없습니다.');
        }


        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        let happiness;

        resizedDetections.forEach(result => {
            const { expressions } = result
            happiness = expressions.happy;
        })

        if (happiness > 0.1) {
            console.log('웃다');
        }

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
