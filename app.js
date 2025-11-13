import { create } from 'https://unpkg.com/@storacha/client?module';

let client;
let currentSpace;

document.getElementById('loginBtn').addEventListener('click', login);
document.getElementById('uploadBtn').addEventListener('click', upload);

async function login() {
  const email = document.getElementById('email').value;
  client = await create();
  await client.login(email);
  const spaces = await client.spaces();
  await client.setCurrentSpace(spaces[0].did());
  currentSpace = spaces[0];
  alert('Login successful!');
  await loadUploads();
}

async function upload() {
  const input = document.getElementById('fileInput');
  const file = input.files[0];
  if (!file) return alert('Please select a file.');

  const reader = new FileReader();
  reader.onload = async () => {
    const arrayBuffer = reader.result;
    const fileObj = new File([arrayBuffer], file.name);
    const cid = await client.uploadFile(fileObj);
    alert(`Uploaded with CID: ${cid}`);
    await loadUploads();
  };
  reader.readAsArrayBuffer(file);
}

async function loadUploads() {
  if (!client) return;
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
}
