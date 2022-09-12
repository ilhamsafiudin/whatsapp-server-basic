# Whatsapp Server Basic
contoh WA API memakai library whatsapp web js (https://github.com/pedroslopez/whatsapp-web.js)

## Instalasi
Langkah2 **instalasi** di gui system (untuk non gui linux server ada tambahan instalasi dependencies, baca di https://wwebjs.dev/guide/#installation)
1. install node js latest version
2. untuk windows taruh di direktori d:, klo linux bisa ditaruh di home
3. ketik di terminal: npm install
4. tunggu proses selesai
5. ketik di terminal: npm run start:dev (dev menggunakan nodemon, klo untuk production bisa memakai pm2)
6. allow port 7456 (firewall)

## Penggunaan
Untuk pengunaan atau uji coba nya bisa memakai Postman atau Insomnia  
**API_URL:** http://localhost:7456  
**HEADER:** API-KEY = 123456789

**1. Kirim pesan**  
End-Point: /send-message  
Params Body: number (int), message (string)  
Response sukses: 
`{ "status": true, "response": {} }`  
**Response error:** 
`{ "status": false, "message": "sesuai validasi error" }`

**2. Kirim pesan ke grup wa**  
End-Point: /send-group-message  
Params Body: id (string), name (string), message (string) //*bisa pilih salah satu id atau name*  
Response sukses: 
`{ "status": true, "response": {} }`  
Response error: 
`{ "status": false, "message": "sesuai validasi error" }`

**3. Kirim image dengan url**  
End-Point: /send-image  
Params Body: number (int), file (string, berupa url), caption (string)  
Response sukses: 
`{ "status": true, "response": {} }`  
Response error: 
`{ "status": false, "message": "sesuai validasi error" }`
