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
      <div class="folder-icon">📁</div>
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

// Modal Lightbox & Zooming
function openLightbox(url, type, filename) {
  const lightbox = document.getElementById('lightbox');
  const wrapper = document.getElementById('lightbox-media-wrapper');
  const downloadBtn = document.getElementById('download-btn');

  wrapper.innerHTML = '';
  currentZoom = 1;

  // Set tombol download di lightbox menggunakan fungsi forceDownload
  downloadBtn.onclick = (e) => {
    e.preventDefault();
    forceDownload(url, filename, downloadBtn);
  };

  let media;
  if (type === 'image') {
    media = document.createElement('img');
    media.src = url;
  } else {
    media = document.createElement('video');
    media.src = url;
    media.controls = true;
    media.autoplay = true;
  }
  
  media.id = 'active-media';
  wrapper.appendChild(media);
  lightbox.style.display = 'flex';
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  const wrapper = document.getElementById('lightbox-media-wrapper');
  lightbox.style.display = 'none';
  wrapper.innerHTML = '';
}

function setupZoomControls() {
  document.getElementById('zoom-in-btn').onclick = () => applyZoom(0.2);
  document.getElementById('zoom-out-btn').onclick = () => applyZoom(-0.2);
  document.getElementById('reset-zoom-btn').onclick = () => {
    currentZoom = 1;
    updateZoomTransform();
  };
}

function applyZoom(delta) {
  currentZoom = Math.max(0.5, Math.min(4, currentZoom + delta));
  updateZoomTransform();
}

function updateZoomTransform() {
  const activeMedia = document.getElementById('active-media');
  if (activeMedia) {
    activeMedia.style.transform = `scale(${currentZoom})`;
  }
}
