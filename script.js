document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const textContainer = document.getElementById('textContainer');
    const speakButton = document.getElementById('speakButton');
    const errorElement = document.getElementById('error');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    let text = '';
    let isPlaying = false;
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance();

    // Configuración para los diferentes formatos de archivos
    const processPDF = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const typedarray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    const pageText = content.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';
                }

                text = fullText; // Almacenar todo el texto
                textContainer.innerHTML = `<p>${text}</p>`;
                errorElement.textContent = '';
                loadingIndicator.style.display = 'none';
            } catch (error) {
                errorElement.textContent = 'Error al leer el archivo PDF';
                loadingIndicator.style.display = 'none';
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const processTXT = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            text = e.target.result;
            textContainer.innerHTML = `<p>${text}</p>`;
            errorElement.textContent = '';
            loadingIndicator.style.display = 'none';
        };
        reader.onerror = () => {
            errorElement.textContent = 'Error al leer el archivo TXT';
            loadingIndicator.style.display = 'none';
        };
        reader.readAsText(file);
    };

    const processDOCX = async (file) => {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const doc = await docxtemplater().load(arrayBuffer);
            const fullText = doc.getFullText();
            text = fullText; // Almacenar todo el texto
            textContainer.innerHTML = `<p>${text}</p>`;
            errorElement.textContent = '';
            loadingIndicator.style.display = 'none';
        } catch (error) {
            errorElement.textContent = 'Error al leer el archivo DOCX';
            loadingIndicator.style.display = 'none';
        }
    };

    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            loadingIndicator.style.display = 'block';
            if (file.type === 'application/pdf') {
                processPDF(file);
            } else if (file.type === 'text/plain') {
                processTXT(file);
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                processDOCX(file);
            } else {
                errorElement.textContent = 'Formato de archivo no soportado';
                loadingIndicator.style.display = 'none';
            }
        }
    });

    speakButton.addEventListener('click', () => {
        if (!text) {
            errorElement.textContent = 'Por favor, sube un documento primero';
            return;
        }

        if (isPlaying) {
            synth.cancel();
            isPlaying = false;
            speakButton.textContent = 'Reproducir';
        } else {
            utterance.text = text; // Asignar todo el texto a la utterance
            synth.speak(utterance);
            isPlaying = true;
            speakButton.textContent = 'Detener';

            utterance.onend = () => {
                isPlaying = false;
                speakButton.textContent = 'Reproducir';
            };
        }
    });
});