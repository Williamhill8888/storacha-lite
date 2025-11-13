import { create } from '@storacha/client';

let client;
let currentSpace;

async function login() {
  const email = document.getElementById('email').value;
  if (!email) {
    alert('Please enter a valid email.');
    return;
  }

  try {
    client = await create();
    await client.login(email);

    alert('✅ Please check your email to confirm login.');

    const spaces = await client.spaces();
    if (!spaces.length) {
      alert('⏳ Login not confirmed yet. Please check your email and try again.');
      return;
    }

    await client.setCurrentSpace(spaces[0].did());
    currentSpace = spaces[0];
    alert('🎉 Login successful!');
    await loadUploads();

  } catch (error) {
    console.error(error);
    alert('❌ Login failed. Please try again.');
  }
}

async function upload() {
  if (!client || !currentSpace) {
    alert('Please login first.');
    return;
  }

  const input = document.getElementById('fileInput');
  const file = input.files[0];
  if (!file) return alert('Please select a file.');

  const reader = new FileReader();
  reader.onload = async () => {
    const arrayBuffer = reader.result;
    const fileObj = new File([arrayBuffer], file.name);
    try {
      const cid = await client.uploadFile(fileObj);
      alert(`✅ Uploaded with CID: ${cid}`);
      await loadUploads();
    } catch (error) {
      console.error(error);
      alert('❌ Upload failed.');
    }
  };
  reader.readAsArrayBuffer(file);
}

async function loadUploads() {
  if (!client) return;
  try {
    const uploads = await client.capability.upload.list({});
    const uploadsDiv = document.getElementById('uploads');
    uploadsDiv.innerHTML = '';
    for (const item of uploads.results) {
      const link = `https://gateway.storacha.network/ipfs/${item.root}`;
      const div = document.createElement('div');
      div.className = 'file-entry';
      div.innerHTML = `<a href="${link}" target="_blank">${item.root}</a>`;
      uploadsDiv.appendChild(div);
    }
  } catch (error) {
    console.error(error);
    alert('❌ Failed to load uploaded files.');
  }
}

// Button bindings (recommended modern method)
document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('uploadBtn').addEventListener('click', upload);
