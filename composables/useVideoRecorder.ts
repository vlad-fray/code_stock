import { computed, onMounted, reactive, ref } from 'vue';

type TConnectionFailed = () => void;
type TSaveRecorderFile = (file: File) => void;

const BLOB_DURATION_IN_MILSEC = 100;

const useVideoRecorder = (
    videoDurationLimit: number,
    notifyConnectionFailure: TConnectionFailed,
    saveRecordedFile: TSaveRecorderFile,
) => {
    const videoElRef = ref<HTMLVideoElement>();
    const videoStream = ref<MediaStream>();
    const videoRecorder = ref<MediaRecorder>();
    const uploadedVideoResolution = reactive({ width: 0, height: 0 });
    const videoRecordedChunks = ref<Blob[]>([]);
    
    const isVideoStreamConnecting = ref(true);
    const isRecording = ref(false);

    const hasRecordedData = computed(() => {
        return !!videoRecordedChunks.value.length;
    });

    const currentVideoDuration = computed(() => {
        return videoRecordedChunks.value.length * BLOB_DURATION_IN_MILSEC;
    });

    const mediaStreamHandler = async (stream: MediaStream) => {
        if (!videoElRef.value) return;
                
        videoElRef.value.srcObject = stream;
        await videoElRef.value.play();
    
        videoStream.value = stream;
        uploadedVideoResolution.height = videoElRef.value.videoHeight;
        uploadedVideoResolution.width = videoElRef.value.videoWidth;
    };

    const startRecording = async () => {
        if (!videoStream.value) return;

        const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
        
        videoRecorder.value = new MediaRecorder(videoStream.value, {
            mimeType: isSafari ? 'video/mp4;codecs=avc1' : 'video/webm',
        });

        setRecorderHandlers();
        videoRecorder.value.start(BLOB_DURATION_IN_MILSEC);
    };
    
    const stopRecording = () => {
        if (!videoStream.value || !videoRecorder.value) return;
    
        videoRecorder.value.stop();
    
        videoStream.value.getTracks().forEach((track) => {
            track.stop(); 
        }); 

        const blob = new Blob(videoRecordedChunks.value, { type: 'video/mp4' });
    
        saveRecordedFile(
            new File([blob], 'filename', { type: blob.type, lastModified: new Date().getTime() }),
        );
    };

    const pauseRecording = () => {
        if (!videoRecorder.value) return;

        videoRecorder.value.pause();
    };

    const resumeRecording = () => {
        if (!videoRecorder.value) return;

        videoRecorder.value.resume();
    };

    const clearRecordedData = () => {
        if (!videoRecorder.value) return;

        videoRecordedChunks.value = [];
    };

    const setRecorderHandlers = () => {
        if (!videoRecorder.value) return;

        videoRecorder.value.ondataavailable = (e) => {
            videoRecordedChunks.value.push(e.data);

            if (currentVideoDuration.value >= videoDurationLimit) {
                stopRecording();
            }
        };

        videoRecorder.value.onpause = () => {
            isRecording.value = false;
        };

        videoRecorder.value.onresume = () => {
            isRecording.value = true;
        };

        videoRecorder.value.onstop = () => {
            isRecording.value = false;
        };

        videoRecorder.value.onstart = () => {
            isRecording.value = true;
        };
    };

    const onMountHandler = async () => {
        if (!navigator) return;
    
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            mediaStreamHandler(stream);
        } catch (err: unknown) {
            notifyConnectionFailure();
        }
    
        isVideoStreamConnecting.value = false;
    };

    onMounted(() => {
        onMountHandler();
    });

    return {
        videoElRef,
        isVideoStreamConnecting,
        isRecording,
        hasRecordedData,
        uploadedVideoResolution,
        currentVideoDuration,
        startRecording,
        stopRecording,
        pauseRecording,
        resumeRecording,
        clearRecordedData,
    };
};

export { useVideoRecorder };