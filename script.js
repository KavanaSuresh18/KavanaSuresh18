document.addEventListener("DOMContentLoaded", function () {
    // Resume Upload Logic
    const fileInput = document.getElementById("resumeUpload");
    const frame = document.getElementById("resumeFrame");
    const uploadButton = document.getElementById("uploadButton");

    if (fileInput && frame && uploadButton) {
        fileInput.addEventListener("change", function () {
            const file = fileInput.files[0];
            if (file) {
                const allowedTypes = [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "image/jpeg",
                    "image/png"
                ];
            
                if (allowedTypes.includes(file.type)) {
                    const fileURL = URL.createObjectURL(file);
            
                    if (file.type === "application/pdf" || file.type.startsWith("image/")) {
                        frame.src = fileURL;
                        frame.style.display = "block";
                    } else {
                        frame.src = "";
                        frame.style.display = "none";
            
                        // Show a placeholder or message
                        document.getElementById("resumePreview").innerHTML = `
                            <h2>Resume Preview</h2>
                            <p style="font-size: 1.2rem; color: #333;">Word document uploaded successfully.</p>
                            <p style="font-size: 1rem;">Preview not available, but your file is ready for processing.</p>
                        `;
                    }
            
                    document.getElementById("resumePreview").style.display = "block";
                } else {
                    alert("Please upload a valid resume (PDF, Word, JPG, or PNG).");
                }
            }
            
            
        });




        uploadButton.addEventListener("click", function () {
            if (fileInput.files.length > 0) {
                const file = fileInput.files[0];
                const fileName = file.name.toLowerCase();
                const scannerLine = document.getElementById("scannerLine");
                const scanMessage = document.getElementById("scanMessage");
        
                // Start scanning animation
                scanMessage.innerText = "";
                scannerLine.style.display = "block";
                scannerLine.style.animation = "scanDown 2s linear forwards";
        
                // After scan completes
                setTimeout(() => {
                    scannerLine.style.display = "none";
        
                    if (fileName.includes("incomplete") || fileName.includes("missing")) {
                        scanMessage.innerText = "⚠️ Resume missing important sections. Please update.";
                        scanMessage.style.color = "red";
                    } else {
                        scanMessage.innerText = "✅ Resume uploaded successfully.";
                        scanMessage.style.color = "green";
        
                        // Redirect to question.html after short delay
                        setTimeout(() => {
                            window.location.href = "question.html";
                        }, 1500); // 1.5 seconds after success message
                    }
                }, 2000); // duration of scan animation
            } else {
                alert("Please select a resume before proceeding.");
            }
        });
        
        

        
    }
    //********************** */




    function startTalking() {
        document.querySelector('.robot-sprite').style.animation = "talkAnimation 1s steps(6) infinite";
    }
    
    function stopTalking() {
        document.querySelector('.robot-sprite').style.animation = "none";
    }

    



    //****************** */

    function loadQuestion() {
        if (questionText) {
            questionText.innerText = "What are your strengths?";
            startLipMovement();

            // Stop lip movement after 5 seconds (simulating user answering)
            setTimeout(() => {
                stopLipMovement();
            }, 5000);
        }
    }

    if (questionText) {
        loadQuestion();
    }
});


// Dummy Questions Array
const dummyQuestions = [
    "Tell me about yourself.",
    "What are your strengths?",
    "Why do you want this job?",
    "Describe a challenging project you worked on.",
    "Where do you see yourself in 5 years?"
];

let currentQuestionIndex = 0;

// DOM Elements
const questionTextEl = document.getElementById("question-text");
const nextQuestionBtn = document.getElementById("nextQuestionBtn");

if (nextQuestionBtn) {
    nextQuestionBtn.addEventListener("click", () => {
        currentQuestionIndex = (currentQuestionIndex + 1) % dummyQuestions.length;
        questionTextEl.innerText = dummyQuestions[currentQuestionIndex];
    });
}



// Enable camera for candidate check
const video = document.getElementById("cameraFeed");

if (video) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
        })
        .catch(error => {
            console.error("Error accessing camera:", error);
            alert("Unable to access your camera. Please allow camera access for the interview.");
        });
}




const textInput = document.getElementById("textInput");
const micButton = document.getElementById("micButton");
const cameraButton = document.getElementById("cameraButton");
const fileInput = document.getElementById("fileInput");
const chatArea = document.getElementById("chatArea");
const sendButton = document.getElementById("sendButton");

let isRecording = false;
let mediaRecorder;
let audioChunks = [];
let recordedAudioBlob = null;

// Handle typing
textInput.addEventListener("input", () => {
    if (textInput.value.trim() !== "") {
        sendButton.style.display = "block";
        micButton.style.display = "none";
    } else {
        sendButton.style.display = "none";
        micButton.style.display = "block";
    }
});

// Voice Recording (Real)
micButton.addEventListener("click", () => {
    if (!isRecording) {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                isRecording = true;
                micButton.innerText = "⏹️"; // Change to stop

                audioChunks = [];

                mediaRecorder.addEventListener("dataavailable", event => {
                    audioChunks.push(event.data);
                });

                mediaRecorder.addEventListener("stop", () => {
                    recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });

                    // Show Send button after recording
                    sendButton.style.display = "block";
                    micButton.style.display = "none";
                });

            })
            .catch(err => {
                alert("Microphone access denied.");
                console.error(err);
            });
    } else {
        mediaRecorder.stop();
        isRecording = false;
        micButton.innerText = "🎤";
    }
});

// Send text or voice
sendButton.addEventListener("click", () => {
    if (recordedAudioBlob) {
        const audioUrl = URL.createObjectURL(recordedAudioBlob);

        const audioEl = document.createElement("audio");
        audioEl.src = audioUrl;
        audioEl.controls = true;
        audioEl.style.maxWidth = "100%";

        const messageDiv = document.createElement("div");
        messageDiv.classList.add("user-message");
        messageDiv.appendChild(audioEl);

        chatArea.appendChild(messageDiv);
        recordedAudioBlob = null; // Reset after sending
    } else if (textInput.value.trim() !== "") {
        addMessage(textInput.value.trim(), "user");
        textInput.value = "";
    }

    // Reset buttons after sending
    sendButton.style.display = "none";
    micButton.style.display = "block";
    simulateInterviewerReply();
});

// Send file
cameraButton.addEventListener("click", () => {
    fileInput.click();
});

fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];

    if (file) {
        const fileUrl = URL.createObjectURL(file);
        
        const messageDiv = document.createElement("div");
        messageDiv.classList.add("user-message");

        if (file.type.startsWith("image/")) {
            // 📷 If it's an image, display it
            const img = document.createElement("img");
            img.src = fileUrl;
            img.alt = "Uploaded Image";
            img.style.maxWidth = "200px";
            img.style.borderRadius = "10px";
            messageDiv.appendChild(img);
        } else {
            // 📄 If it's another file type (pdf, doc), show a download link
            const link = document.createElement("a");
            link.href = fileUrl;
            link.innerText = `📄 ${file.name}`;
            link.download = file.name;
            link.style.color = "blue";
            link.style.textDecoration = "underline";
            messageDiv.appendChild(link);
        }

        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight; // Auto scroll

        simulateInterviewerReply(); // Fake interviewer reply
    }
});


// Add message helper
function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add(sender === "user" ? "user-message" : "interviewer-message");
    messageDiv.innerText = text;
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Simulate Interviewer's Reply
function simulateInterviewerReply() {
    // Show "typing..." first
    const typingEl = document.createElement("div");
    typingEl.classList.add("typing-indicator");
    typingEl.innerText = "Interviewer is typing...";
    chatArea.appendChild(typingEl);
    chatArea.scrollTop = chatArea.scrollHeight;

    setTimeout(() => {
        // Remove typing message
        typingEl.remove();

        // Add actual reply
        addMessage("Thank you for your response!", "interviewer");
    }, 1500);
}
