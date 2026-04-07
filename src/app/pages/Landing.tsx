import { Link } from "react-router";
import { ArrowRight, Bot, Mic, Mic2, Play, Activity, ChevronDown, Mail, MapPin, Phone } from "lucide-react";
import { useState } from "react";

export function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Apa itu CuanLimbah?",
      answer: "CuanLimbah adalah platform B2B Circular Economy yang menghubungkan UMKM kuliner dengan industri daur ulang. Kami membantu Anda mengelola minyak jelantah dan residu organik menjadi sumber penghasilan tambahan."
    },
    {
      question: "Berapa biaya yang harus saya bayar?",
      answer: "Pendaftaran dan penggunaan platform CuanLimbah sepenuhnya GRATIS. Anda bahkan akan mendapatkan bayaran dari limbah yang Anda setor. Tidak ada biaya tersembunyi."
    },
    {
      question: "Bagaimana cara mendapatkan pembayaran?",
      answer: "Setelah limbah Anda dijemput dan diverifikasi, dana akan langsung ditransfer ke rekening bank yang Anda daftarkan dalam waktu 1-3 hari kerja."
    },
    {
      question: "Berapa minimum volume limbah yang bisa disetor?",
      answer: "Minimum 10 liter untuk minyak jelantah dan 5 kg untuk residu organik. Semakin banyak volume yang Anda setor, semakin besar penghasilan Anda."
    },
    {
      question: "Apakah ada kontrak jangka panjang?",
      answer: "Tidak ada kontrak mengikat. Anda bebas menggunakan layanan kami kapan saja sesuai kebutuhan. Namun, mitra rutin akan mendapatkan prioritas penjemputan dan bonus loyalty."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#94A3B8] relative overflow-hidden font-sans">
      {/* Background Grid Pattern */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(to right, #164E63 1px, transparent 1px), linear-gradient(to bottom, #164E63 1px, transparent 1px)`,
          backgroundSize: '20px 20px'
        }}
      />
      
      {/* Soft neon radial glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#00FF94] opacity-10 blur-[150px] z-0 pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#4ADE80] opacity-5 blur-[120px] z-0 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-[#4ADE80] flex items-center justify-center">
            <Bot className="w-5 h-5 text-[#050505]" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">CuanLimbah</span>
        </div>
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <a href="#" className="text-white hover:text-[#4ADE80] transition-colors">Home</a>
          <a href="#" className="hover:text-white transition-colors">Platform</a>
          <a href="#" className="hover:text-white transition-colors">Harga</a>
          <a href="#" className="hover:text-white transition-colors">Tentang Kami</a>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-medium text-white hover:text-[#4ADE80] transition-colors">Masuk</Link>
          <Link to="/login" className="text-sm font-medium bg-[#0A0A0A] border border-[#164E63] text-white px-5 py-2.5 rounded-full hover:border-[#4ADE80] hover:text-[#4ADE80] transition-all">
            Daftar Mitra
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-8 pt-20 pb-32">
        {/* Hero Section */}
        <div className="text-center max-w-4xl mx-auto mb-20">
          <div className="inline-flex items-center space-x-2 bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#164E63] px-4 py-1.5 rounded-full mb-8">
            <span className="w-2 h-2 rounded-full bg-[#00FF94] animate-pulse" />
            <span className="text-xs font-semibold text-[#4ADE80] uppercase tracking-wider">AI-Powered Circular Economy</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Jadikan Limbahmu <br className="hidden md:block"/> Menjadi <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FF94] to-[#4ADE80]">Cuan</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
            Membantu UMKM mengelola minyak jelantah & residu organik secara cerdas dengan AI. Maksimalkan insentif, minimalkan jejak karbon.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/dashboard" className="w-full sm:w-auto px-8 py-4 bg-[#4ADE80] hover:bg-[#00FF94] text-[#050505] font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(0,255,148,0.4)] hover:shadow-[0_0_40px_rgba(0,255,148,0.6)] flex items-center justify-center space-x-2">
              <span>Mulai Setor Sekarang</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Impact Projection Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-32">
          {[
            { label: "Limbah Terkelola", value: "1,200+ Ton" },
            { label: "CO2 Reduksi", value: "450 Ton" },
            { label: "Insentif Cair", value: "Rp 1.8M" },
            { label: "Mitra UMKM", value: "10k+" }
          ].map((stat, i) => (
            <div key={i} className="bg-[#0A0A0A]/60 backdrop-blur-md border border-[#164E63] p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-[#4ADE80]/50 transition-colors">
              <span className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.value}</span>
              <span className="text-sm font-medium text-[#94A3B8]">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Innovation Highlight */}
        <div className="flex flex-col lg:flex-row items-center gap-16 bg-[#0A0A0A]/40 border border-[#164E63]/50 rounded-[2.5rem] p-8 lg:p-12 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#00FF94]/5 to-transparent pointer-events-none" />
          
          <div className="lg:w-1/2 relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Gree-Bot (LLM Assistant)</h2>
            <p className="text-lg leading-relaxed text-[#94A3B8] mb-8">
              Tidak punya waktu untuk mencatat limbah harian? Cukup gunakan pesan suara. AI kami secara otomatis mengkalkulasi volume, jenis limbah, dan potensi cuan yang bisa Anda cairkan hari ini.
            </p>
            <ul className="space-y-4">
              {['Kenali volume limbah dari foto', 'Input dengan pesan suara WhatsApp', 'Prediksi penjemputan cerdas'].map((feat, i) => (
                <li key={i} className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-[#164E63] flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#00FF94]" />
                  </div>
                  <span className="text-white font-medium">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat UI Mockup */}
          <div className="lg:w-1/2 w-full relative z-10">
            <div className="bg-[#050505] border border-[#164E63] rounded-3xl p-6 shadow-2xl relative">
              <div className="absolute top-0 right-10 w-32 h-32 bg-[#4ADE80] opacity-10 blur-[60px]" />
              
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-[#164E63]/50">
                <div className="w-10 h-10 rounded-full bg-[#0A0A0A] border border-[#164E63] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#4ADE80]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">Gree-Bot</h3>
                  <span className="text-xs text-[#00FF94] flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-[#00FF94] mr-1.5" /> Online</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* User Voice Note */}
                <div className="flex justify-end">
                  <div className="bg-[#164E63]/30 border border-[#164E63] rounded-2xl rounded-tr-none px-4 py-3 max-w-[85%] flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#4ADE80] flex items-center justify-center cursor-pointer">
                      <Play className="w-4 h-4 text-[#050505] ml-0.5" />
                    </div>
                    <div className="flex-1">
                      <div className="h-8 w-32 md:w-48 flex items-center space-x-1">
                         {/* Audio wave mockup */}
                         {[...Array(15)].map((_, i) => (
                           <div key={i} className="w-1 bg-[#4ADE80] rounded-full" style={{ height: `${Math.random() * 80 + 20}%` }} />
                         ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-[#94A3B8] self-end">0:08</span>
                  </div>
                </div>

                {/* Bot Processing */}
                <div className="flex justify-start">
                  <div className="bg-[#0A0A0A] border border-[#164E63] rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] flex flex-col space-y-2">
                    <div className="flex items-center space-x-2 text-xs text-[#94A3B8]">
                      <Activity className="w-3.5 h-3.5 text-[#00FF94] animate-spin" />
                      <span>Menganalisis audio...</span>
                    </div>
                  </div>
                </div>

                {/* Bot Response */}
                <div className="flex justify-start">
                  <div className="bg-[#0A0A0A] border border-[#164E63] rounded-2xl rounded-tl-none p-4 max-w-[85%] shadow-lg">
                    <p className="text-sm text-white leading-relaxed mb-3">
                      Tercatat! 15 Liter Minyak Jelantah dan 5 Kg sisa makanan dari shift malam. 
                    </p>
                    <div className="bg-[#050505] border border-[#164E63]/50 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-[#94A3B8]">Potensi Cuan</span>
                        <span className="text-sm font-bold text-[#4ADE80]">Rp 112.500</span>
                      </div>
                      <div className="w-full bg-[#164E63]/30 rounded-full h-1.5">
                        <div className="bg-[#00FF94] h-1.5 rounded-full w-[75%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="mt-6 flex items-center space-x-3">
                <div className="flex-1 bg-[#0A0A0A] border border-[#164E63] rounded-full px-4 py-3 flex items-center">
                  <span className="text-sm text-[#94A3B8]">Ketik atau rekam suara...</span>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#4ADE80] flex items-center justify-center cursor-pointer hover:bg-[#00FF94] transition-colors shadow-[0_0_15px_rgba(0,255,148,0.3)]">
                  <Mic2 className="w-5 h-5 text-[#050505]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#164E63] px-4 py-1.5 rounded-full mb-6">
              <span className="text-xs font-semibold text-[#4ADE80] uppercase tracking-wider">Cara Penggunaan</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Mudah & Cepat</h2>
            <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
              Hanya 3 langkah untuk mulai mengubah limbah menjadi cuan
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Daftar & Verifikasi",
                description: "Buat akun gratis dan lengkapi data usaha Anda. Proses verifikasi hanya 24 jam.",
                icon: "📝"
              },
              {
                step: "02",
                title: "Catat Limbah dengan AI",
                description: "Gunakan Gree-Bot untuk mencatat limbah harian Anda. Bisa dengan foto, suara, atau ketik manual.",
                icon: "🤖"
              },
              {
                step: "03",
                title: "Jemput & Terima Cuan",
                description: "Tim kami jemput limbah di lokasi Anda. Dana langsung masuk rekening dalam 1-3 hari.",
                icon: "💰"
              }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="bg-[#0A0A0A]/60 backdrop-blur-md border border-[#164E63] p-8 rounded-3xl hover:border-[#4ADE80]/50 transition-all group">
                  <div className="text-6xl mb-6">{item.icon}</div>
                  <div className="absolute top-8 right-8 text-6xl font-bold text-[#164E63]/30 group-hover:text-[#4ADE80]/20 transition-colors">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                  <p className="text-[#94A3B8] leading-relaxed">{item.description}</p>
                </div>
                {i < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-8 h-8 text-[#164E63]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-32">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-[#0A0A0A]/80 backdrop-blur-sm border border-[#164E63] px-4 py-1.5 rounded-full mb-6">
              <span className="text-xs font-semibold text-[#4ADE80] uppercase tracking-wider">FAQ</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Pertanyaan Umum</h2>
            <p className="text-lg text-[#94A3B8] max-w-2xl mx-auto">
              Jawaban untuk pertanyaan yang sering diajukan
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-[#0A0A0A]/60 backdrop-blur-md border border-[#164E63] rounded-2xl overflow-hidden hover:border-[#4ADE80]/50 transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left"
                >
                  <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 text-[#4ADE80] transition-transform flex-shrink-0 ${
                      openFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 pt-0">
                    <p className="text-[#94A3B8] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-[#0A0A0A] border-t border-[#164E63] mt-32">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#4ADE80] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#050505]" />
                </div>
                <span className="text-white font-bold text-xl tracking-tight">CuanLimbah</span>
              </div>
              <p className="text-[#94A3B8] text-sm leading-relaxed mb-6">
                Platform B2B Circular Economy Indonesia yang mengubah limbah menjadi nilai ekonomi dengan teknologi AI.
              </p>
              <div className="flex space-x-4">
                {["facebook", "twitter", "instagram", "linkedin"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="w-10 h-10 rounded-full bg-[#050505] border border-[#164E63] flex items-center justify-center hover:border-[#4ADE80] hover:bg-[#164E63]/30 transition-all"
                    aria-label={social}
                  >
                    <span className="text-[#4ADE80] text-xs font-bold">{social[0].toUpperCase()}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-3">
                {["Tentang Kami", "Cara Kerja", "Harga", "Mitra Industri"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#94A3B8] hover:text-[#4ADE80] transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Layanan */}
            <div>
              <h4 className="text-white font-semibold mb-4">Layanan</h4>
              <ul className="space-y-3">
                {["Pengumpulan Limbah", "Gree-Bot AI", "Analytics Dashboard", "Program Loyalty"].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[#94A3B8] hover:text-[#4ADE80] transition-colors text-sm">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kontak */}
            <div>
              <h4 className="text-white font-semibold mb-4">Kontak Kami</h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-[#4ADE80] flex-shrink-0 mt-0.5" />
                  <a href="mailto:info@cuanlimbah.id" className="text-[#94A3B8] hover:text-[#4ADE80] transition-colors text-sm">
                    info@cuanlimbah.id
                  </a>
                </li>
                <li className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-[#4ADE80] flex-shrink-0 mt-0.5" />
                  <a href="tel:+6281234567890" className="text-[#94A3B8] hover:text-[#4ADE80] transition-colors text-sm">
                    +62 812-3456-7890
                  </a>
                </li>
                <li className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-[#4ADE80] flex-shrink-0 mt-0.5" />
                  <span className="text-[#94A3B8] text-sm">
                    Jakarta, Indonesia
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#164E63] flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-[#94A3B8] text-sm">
              © 2026 CuanLimbah. Semua hak dilindungi.
            </p>
            <div className="flex space-x-6">
              {["Syarat & Ketentuan", "Kebijakan Privasi"].map((item) => (
                <a key={item} href="#" className="text-[#94A3B8] hover:text-[#4ADE80] transition-colors text-sm">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
