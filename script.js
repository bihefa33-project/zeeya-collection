const username = 'bihefa33-project';
const repo = 'zeeya-collection';

// Daftar 10 folder galeri
const folders = [
  { name: "1. Generate Sendiri Full NDS", path: "gallery/1-generate-sendiri-full-nds" },
  { name: "2. Generate Publik Full NDS", path: "gallery/2-generate-publik-full-nds" },
  { name: "3. Generate Sendiri Half NDS", path: "gallery/3-generate-sendiri-half-nds" },
  { name: "4. Generate Publik Half NDS", path: "gallery/4-generate-publik-half-nds" },
  { name: "5. Edit AI Sendiri", path: "gallery/5-edit-ai-sendiri" },
  { name: "6. Edit AI Publik", path: "gallery/6-edit-ai-publik" },
  { name: "7. Edit AI Random", path: "gallery/7-edit-ai-random" },
  { name: "8. Video Edit AI Sendiri", path: "gallery/8-video-edit-ai-sendiri" },
  { name: "9. Video Edit AI Publik", path: "gallery/9-video-edit-ai-publik" },
  { name: "10. Video Real", path: "gallery/10-video-real" }
];

let currentZoom = 1;

document.addEventListener('DOMContentLoaded', () => {
  renderFolders();
  setupZoomControls();
  
  document.getElementById('back-btn').addEventListener('click', showFoldersList);
});

// Render Tampilan Awal (Daftar Folder)
function renderFolders() {
  const foldersGrid = document.getElementById('folders-grid');
  foldersGrid.innerHTML = '';

  folders.forEach(folder => {
    const card = document.createElement('div');
    card.className = 'folder-card';
    
    card.innerHTML = `
      <div class="folder-icon">🍑🍌💦</div>
      <div class="folder-name">${folder.name}</div>
    `;

    card.onclick = () => openFolder(folder);
    foldersGrid.appendChild(card);
  });
}

// Buka Folder dan Ambil File via GitHub API
async function openFolder(folder) {
  const foldersGrid = document.getElementById('folders-grid');
  const mediaGrid = document.getElementById('media-grid');
  const navBar = document.getElementById('nav-bar');
  const folderTitle = document.getElementById('current-folder-title');

  foldersGrid.style.display = 'none';
  mediaGrid.style.display = 'flex';
  navBar.style.display = 'flex';
  folderTitle.textContent = folder.name;
  
  mediaGrid.innerHTML = '<p style="color:#888;">Memuat isi folder...</p>';

  try {
    const apiUrl = `https://api.github.com/repos/${username}/${repo}/contents/${folder.path}`;
    const response = await fetch(apiUrl);

    if (response.ok) {
      const files = await response.json();
      mediaGrid.innerHTML = '';

      let fileCount = 0;
      files.forEach(file => {
        const ext = file.name.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
        const isVideo = ['mp4', 'webm', 'ogg'].includes(ext);

        // Abaikan file .txt / non-media
        if (isImage || isVideo) {
          const card = createMediaCard(file, isImage);
          mediaGrid.appendChild(card);
          fileCount++;
        }
      });

      if (fileCount === 0) {
        mediaGrid.innerHTML = '<p style="color:#888;">Folder ini masih kosong.</p>';
      }
    } else {
      mediaGrid.innerHTML = '<p style="color:#ff5555;">Gagal memuat folder atau folder tidak ditemukan.</p>';
    }
  } catch (err) {
    mediaGrid.innerHTML = '<p style="color:#ff5555;">Koneksi bermasalah.</p>';
  }
}

// Kembali ke Tampilan Depan (Daftar Folder)
function showFoldersList() {
  document.getElementById('folders-grid').style.display = 'grid';
  document.getElementById('media-grid').style.display = 'none';
  document.getElementById('nav-bar').style.display = 'none';
}

function createMediaCard(file, isImage) {
  const card = document.createElement('div');
  card.className = 'media-card';

  let mediaElement;
  if (isImage) {
    mediaElement = document.createElement('img');
    mediaElement.src = file.download_url;
    mediaElement.alt = file.name;
    mediaElement.onclick = () => openLightbox(file.download_url, 'image', file.name);
  } else {
    mediaElement = document.createElement('video');
    mediaElement.src = file.download_url;
    mediaElement.controls = true;
    mediaElement.onclick = () => openLightbox(file.download_url, 'video', file.name);
  }

  const actions = document.createElement('div');
  actions.className = 'card-actions';

  const downloadBtn = document.createElement('button');
  downloadBtn.className = 'btn';
  downloadBtn.textContent = 'Download';
  // Menggunakan fungsi paksa download saat diklik
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    forceDownload(file.download_url, file.name, downloadBtn);
  };

  actions.appendChild(downloadBtn);
  card.appendChild(mediaElement);
  card.appendChild(actions);

  return card;
}

// FUNGSI UTAMA: Paksa file langsung terunduh ke HP/Galeri
async function forceDownload(url, filename, btnElement) {
  const originalText = btnElement ? btnElement.textContent : 'Download File';
  if (btnElement) btnElement.textContent = 'Mengunduh...';

  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    
    window.URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (error) {
    alert('Gagal mengunduh otomatis, membuka file...');
    window.open(url, '_blank');
  } finally {
    if (btnElement) btnElement.textContent = originalText;
  }
}

let scale = 1;
let lastScale = 1;
let pointX = 0;
let pointY = 0;
let startX = 0;
let startY = 0;
let isPanning = false;
let initialDistance = 0;

function openLightbox(src, isVideo) {
  const lightbox = document.getElementById('lightbox');
  const wrapper = document.getElementById('lightbox-media-wrapper');
  const downloadBtn = document.getElementById('download-btn');
  
  wrapper.innerHTML = '';
  // Reset posisi & zoom
  scale = 1;
  lastScale = 1;
  pointX = 0;
  pointY = 0;

  if (isVideo) {
    wrapper.innerHTML = `<video id="active-media" src="${src}" controls autoplay></video>`;
  } else {
    wrapper.innerHTML = `<img id="active-media" src="${src}">`;
  }

  downloadBtn.href = src;
  lightbox.style.display = 'flex';

  // Inisialisasi event gesture sentuhan jari
  const mediaEl = document.getElementById('active-media');
  setupTouchEvents(mediaEl);
}

function closeLightbox() {
  document.getElementById('lightbox').style.display = 'none';
  document.getElementById('lightbox-media-wrapper').innerHTML = '';
}

function setupTouchEvents(el) {
  if (!el) return;

  function updateTransform() {
    el.style.transform = `translate(${pointX}px, ${pointY}px) scale(${scale})`;
  }

  // Jarak antara 2 jari untuk Pinch Zoom
  function getDistance(touches) {
    return Math.hypot(
      touches[0].clientX - touches[1].clientX,
      touches[0].clientY - touches[1].clientY
    );
  }

  el.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      // 1 Jari -> Menggeser gambar (Pan)
      isPanning = true;
      startX = e.touches[0].clientX - pointX;
      startY = e.touches[0].clientY - pointY;
    } else if (e.touches.length === 2) {
      // 2 Jari -> Zoom (Pinch)
      isPanning = false;
      initialDistance = getDistance(e.touches);
      lastScale = scale;
    }
  });

  el.addEventListener('touchmove', (e) => {
    e.preventDefault();

    if (e.touches.length === 1 && isPanning && scale > 1) {
      // Pergeseran posisi saat sedang di-zoom
      pointX = e.touches[0].clientX - startX;
      pointY = e.touches[0].clientY - startY;
      updateTransform();
    } else if (e.touches.length === 2) {
      // Pinch to Zoom
      const newDistance = getDistance(e.touches);
      if (initialDistance > 0) {
        scale = Math.min(Math.max(1, lastScale * (newDistance / initialDistance)), 5); // Max zoom 5x
        if (scale === 1) {
          pointX = 0;
          pointY = 0;
        }
        updateTransform();
      }
    }
  }, { passive: false });

  el.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) {
      initialDistance = 0;
    }
    if (e.touches.length === 0) {
      isPanning = false;
    }
  });
}
  
