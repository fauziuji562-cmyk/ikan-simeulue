// ==========================================
// CONFIGURATION (KONFIGURASI URL)
// ==========================================
// Silakan ganti URL di bawah ini dengan URL publik yang kamu dapatkan dari Localtunnel di Google Colab!
const URL_COLAB_AI = "https://curly-wolves-shout.loca.lt/api/ai"; 

// URL untuk server backend lokal Python (Flask/FastAPI) yang mengurus database Excel
const URL_BACKEND_EXCEL = "http://localhost:5000/beli";

let hargaPerKg = 0;

// ==========================================
// 1. FITUR KATALOG & HITUNG HARGA
// ==========================================

// Fungsi saat tombol 'Pesan Sekarang' di katalog diklik
function pilihIkan(namaIkan, harga) {
    document.getElementById('ikanPilihan').value = namaIkan;
    hargaPerKg = harga;
    hitungTotal();
    
    // Efek scroll otomatis yang mulus langsung mengarah ke area Form Pesanan
    document.getElementById('order').scrollIntoView({ behavior: 'smooth' });
}

// Fungsi untuk menghitung total harga berdasarkan input jumlah kilogram
function hitungTotal() {
    let jumlah = document.getElementById('jumlah').value;
    let total = jumlah * hargaPerKg;
    document.getElementById('totalHarga').value = total;
}


// ==========================================
// 2. FITUR LOGIKA CHAT WIDGET AI
// ==========================================

// Fungsi untuk membuka dan menutup (toggle) kotak chat AI di pojok kanan bawah
function toggleChat() {
    let body = document.getElementById('chatBody');
    let footer = document.getElementById('chatFooter');
    
    if (body.style.display === "none" || body.style.display === "") {
        body.style.display = "block";
        footer.style.display = "flex";
    } else {
        body.style.display = "none";
        footer.style.display = "none";
    }
}

// Fungsi utama untuk mengirim pesan dari user ke Otak AI di Google Colab
async function kirimKeAI() {
    let input = document.getElementById('inputChat');
    let text = input.value.trim();
    if (!text) return; // Jika input kosong, batalkan pengiriman

    let chatBody = document.getElementById('chatBody');
    
    // Tampilkan pesan user ke dalam bubble chat website
    chatBody.innerHTML += `<div class="pesan user">${text}</div>`;
    input.value = ''; // Kosongkan kembali kolom input text
    chatBody.scrollTop = chatBody.scrollHeight; // Scroll otomatis ke pesan paling bawah

    try {
        // Kirim data request menggunakan fetch API menuju Google Colab
        let response = await fetch(URL_COLAB_AI, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pesan: text })
        });

        let hasil = await response.json();
        
        // Tampilkan jawaban pintar dari server AI Google Colab ke dalam bubble chat
        chatBody.innerHTML += `<div class="pesan bot">${hasil.jawaban}</div>`;
    } catch (error) {
        // Antisipasi jika link localtunnel mati atau Google Colab belum di-run
        chatBody.innerHTML += `<div class="pesan bot" style="color: red;">Gagal terhubung ke Otak AI di Colab. Pastikan Colab Anda sedang berjalan dan URL-nya benar!</div>`;
    }
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Menambahkan fungsi agar user bisa mengirim pesan chat hanya dengan menekan tombol 'Enter'
document.getElementById('inputChat').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        kirimKeAI();
    }
});


// ==========================================
// 3. FITUR KIRIM DATA PESANAN KE EXCEL (BACKEND)
// ==========================================

// Menangkap event submit dari form pembelian ikan
document.getElementById('formBeli').addEventListener('submit', async function(e) {
    e.preventDefault(); // Mencegah halaman web melakukan reload otomatis
    
    // Membaca data yang diisi oleh user di form input
    let dataPesanan = {
        nama: document.getElementById('nama').value,
        ikan: document.getElementById('ikanPilihan').value,
        jumlah: document.getElementById('jumlah').value,
        total_harga: document.getElementById('totalHarga').value
    };

    let notifDiv = document.getElementById('notifikasi');
    notifDiv.innerHTML = `<p style="color: blue;">Sedang memproses dan menyimpan data...</p>`;

    try {
        // Kirim objek data pesanan ke backend Python lokal kita
        let response = await fetch(URL_BACKEND_EXCEL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dataPesanan)
        });

        let hasil = await response.json();
        
        if (hasil.status === 'success') {
            // Tampilkan pesan sukses jika data berhasil tertulis di database.xlsx
            notifDiv.innerHTML = `<p style="color: green; font-weight: bold;">✓ ${hasil.message}</p>`;
            document.getElementById('formBeli').reset(); // Bersihkan isi form setelah berhasil
        }
    } catch (error) {
        // Pesan eror jika server python backend/app.py belum dinyalakan di terminal
        notifDiv.innerHTML = `<p style="color: red; font-weight: bold;">⚠️ Gagal terhubung ke database server Python. Pastikan server lokal Anda (backend/app.py) sudah aktif!</p>`;
    }
});
