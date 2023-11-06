const video = document.getElementById('video')

function webCam() {
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
    }).then(stream => {
        video.srcObject = stream
    })
}

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models'),
    faceapi.nets.ageGenderNet.loadFromUri('./models'),

]).then(webCam)

video.addEventListener("play", () => {
    const canvas = faceapi.createCanvasFromMedia(video)
    document.body.append(canvas)

    faceapi.matchDimensions(canvas, { width: video.width, height: video.height })


    setInterval(async () => {
        const detection = await faceapi
            .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks().withFaceExpressions().withAgeAndGender()
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)

        const resizedWindow = faceapi.resizeResults(detection, {
            width: video.width,
            height: video.height
        })




        faceapi.draw.drawDetections(canvas, resizedWindow)
        faceapi.draw.drawFaceLandmarks(canvas, resizedWindow)
        faceapi.draw.drawFaceExpressions(canvas, resizedWindow)

        resizedWindow.forEach(detection => {
            const box = detection.detection.box
            const drawBox = new faceapi.draw.DrawBox(box, {
                label: Math.round(detection.age) + " year old " + detection.gender
            })
            drawBox.draw(canvas)
        })


    }, 100)
})