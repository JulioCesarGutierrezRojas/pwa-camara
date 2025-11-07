if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
        navigator.serviceWorker.register('/sw.js')
        .then(reg =>{
            console.log('se registr', reg)
        })
        .catch(err=>{
            console.log('error al registrar', err)
        })
    })
}

// Referencias a elementos del DOM
const openCameraBtn = document.getElementById('openCamera');
const toggleCameraBtn2 = document.getElementById('toggleCamera2');
const closeCameraBtn = document.getElementById('closeCamera');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const takePhotoBtn = document.getElementById('takePhoto');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d'); // Contexto 2D para dibujar en el Canvas
const galleryScroll = document.getElementById('galleryScroll');
const clearGalleryBtn = document.getElementById('clearGallery');

let stream = null; // Variable para almacenar el MediaStream de la cámara
let currentFacingMode = 'environment'; // 'environment' = trasera, 'user' = frontal
let photos = []; // Array para almacenar las URLs de las fotos

async function openCamera() {
    try {
        // 1. Definición de Restricciones (Constraints)
        const constraints = {
            video: {
                facingMode: { ideal: currentFacingMode },
                width: { ideal: 320 },
                height: { ideal: 240 }
            }
        };

        // 2. Obtener el Stream de Medios
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        // 3. Asignar el Stream al Elemento <video>
        video.srcObject = stream;
        
        // 4. Actualización de la UI
        cameraContainer.style.display = 'block';
        openCameraBtn.textContent = 'Cámara Abierta';
        openCameraBtn.disabled = true;
        toggleCameraBtn2.disabled = false;
        closeCameraBtn.disabled = false;
        
        console.log('Cámara abierta exitosamente');
    } catch (error) {
        console.error('Error al acceder a la cámara:', error);
        alert('No se pudo acceder a la cámara. Asegúrate de dar permisos.');
    }
}

async function toggleCamera() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    // Cambiar el modo de cámara
    currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
    
    // Cerrar la cámara actual
    closeCamera();
    
    // Abrir la nueva cámara
    await openCamera();
}

function takePhoto() {
    if (!stream) {
        alert('Primero debes abrir la cámara');
        return;
    }

    // 1. Dibujar el Frame de Video en el Canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // 2. Conversión a Data URL
    const imageDataURL = canvas.toDataURL('image/png');
    
    // 3. Agregar la foto al array y a la galería
    photos.push(imageDataURL);
    addPhotoToGallery(imageDataURL);
    
    console.log('Foto capturada. Total de fotos:', photos.length);
}

function addPhotoToGallery(imageDataURL) {
    // Limpiar el mensaje de "No hay fotos aún" si existe
    const emptyMessage = galleryScroll.querySelector('.empty-gallery');
    if (emptyMessage) {
        emptyMessage.remove();
    }

    // Crear el elemento de la galería
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';

    const img = document.createElement('img');
    img.src = imageDataURL;
    img.alt = 'Foto capturada';

    // Agregar funcionalidad para descargar o ver la foto
    img.addEventListener('click', () => {
        downloadPhoto(imageDataURL);
    });

    galleryItem.appendChild(img);
    galleryScroll.appendChild(galleryItem);

    // Auto-scroll al final
    galleryScroll.scrollLeft = galleryScroll.scrollWidth;
}

function downloadPhoto(imageDataURL) {
    const link = document.createElement('a');
    link.href = imageDataURL;
    link.download = `foto-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearGallery() {
    if (photos.length === 0) {
        alert('No hay fotos para limpiar');
        return;
    }

    if (confirm('¿Estás seguro de que deseas limpiar toda la galería?')) {
        photos = [];
        galleryScroll.innerHTML = '<div class="empty-gallery">No hay fotos aún</div>';
        console.log('Galería limpiada');
    }
}

function closeCamera() {
    if (stream) {
        // Detener todos los tracks del stream (video, audio, etc.)
        stream.getTracks().forEach(track => track.stop());
        stream = null; // Limpiar la referencia

        // Limpiar y ocultar UI
        video.srcObject = null;
        cameraContainer.style.display = 'none';
        
        // Restaurar el botón 'Abrir Cámara'
        openCameraBtn.textContent = 'Abrir Cámara';
        openCameraBtn.disabled = false;
        toggleCameraBtn2.disabled = true;
        closeCameraBtn.disabled = true;
        
        console.log('Cámara cerrada');
    }
}

// Event listeners para la interacción del usuario
openCameraBtn.addEventListener('click', openCamera);
toggleCameraBtn2.addEventListener('click', toggleCamera);
closeCameraBtn.addEventListener('click', closeCamera);
takePhotoBtn.addEventListener('click', takePhoto);
clearGalleryBtn.addEventListener('click', clearGallery);

// Limpiar stream cuando el usuario cierra o navega fuera de la página
window.addEventListener('beforeunload', () => {
    closeCamera();
});