import { ArrowRight, Recycle, TrendingUp, Shield, Smartphone, CheckCircle, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router';

export function Landing() {
  const features = [
    {
      icon: Recycle,
      title: 'Setor Limbah Mudah',
      description: 'Upload foto limbah, estimasi berat, dan kami yang urus sisanya'
    },
    {
      icon: TrendingUp,
      title: 'Dapatkan Cuan Instan',
      description: 'Limbah terverifikasi langsung masuk ke wallet digital Anda'
    },
    {
      icon: Shield,
      title: 'Transparan & Aman',
      description: 'Track status real-time dan withdrawal kapan saja'
    },
    {
      icon: Smartphone,
      title: 'UMKM Friendly',
      description: 'Dirancang khusus untuk UMKM dengan AI verification'
    },
  ];

  const steps = [
    { number: '01', title: 'Daftar & Verifikasi', description: 'Login dengan Google, gratis dan cepat' },
    { number: '02', title: 'Setor Limbah', description: 'Upload foto dan estimasi berat limbah Anda' },
    { number: '03', title: 'Verifikasi Admin', description: 'Tim kami verifikasi dan timbang limbah' },
    { number: '04', title: 'Terima Cuan', description: 'Saldo langsung masuk dan bisa ditarik' },
  ];

  const faqs = [
    {
      q: 'Jenis limbah apa yang diterima?',
      a: 'Kami menerima Sampah Sisa Makanan dengan harga per KG dan Minyak Jelantah dengan harga per liter'
    },
    {
      q: 'Berapa minimal setor?',
      a: 'Minimal 1 KG untuk sisa makanan atau 1 liter untuk minyak jelantah. Untuk UMKM bisa konsultasi langsung dengan tim kami'
    },
    {
      q: 'Bagaimana cara penarikan dana?',
      a: 'Bisa langsung ke e-wallet (GoPay, OVO, DANA) atau transfer bank tanpa biaya admin'
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-8">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-500 text-sm">AI-Powered Circular Economy</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Jadikan Limbahmu<br />
              <span className="text-green-500 relative">
                Menjadi Cuan
                <motion.div
                  className="absolute -inset-4 bg-green-500/20 blur-3xl -z-10"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </span>
            </h1>

            <p className="text-base sm:text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Platform digital pertama yang mengubah limbah UMKM menjadi pendapatan pasif.
              Powered by AI verification untuk proses cepat dan transparan.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/50 hover:shadow-green-500/70 group w-full sm:w-auto justify-center"
              >
                <span className="text-base sm:text-lg">Mulai Setor Sekarang</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-4 bg-white/5 text-white rounded-lg hover:bg-white/10 transition-all border border-white/10 w-full sm:w-auto justify-center"
              >
                <span className="text-base sm:text-lg">Sudah Punya Akun</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Floating particles effect */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-green-500/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.5, 0.2],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Kenapa CuanLimbah?</h2>
            <p className="text-gray-400 text-lg">Platform terlengkap untuk monetisasi limbah Anda</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-gradient-to-b from-green-500/10 to-transparent border border-green-500/20 hover:border-green-500/40 transition-all group"
              >
                <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-xl text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Cara Kerja</h2>
            <p className="text-gray-400 text-lg">4 langkah sederhana menuju passive income</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <div className="text-6xl font-bold text-green-500/20 mb-4">{step.number}</div>
                <h3 className="text-xl text-white mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  {step.title}
                </h3>
                <p className="text-gray-400">{step.description}</p>

                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-500/30" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Pertanyaan Umum</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-xl bg-green-500/5 border border-green-500/20 hover:border-green-500/40 transition-all"
              >
                <div className="flex items-start gap-4">
                  <HelpCircle className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg text-white mb-2">{faq.q}</h3>
                    <p className="text-gray-400">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="p-6 sm:p-12 rounded-2xl bg-gradient-to-br from-green-500/20 to-green-500/5 border border-green-500/30 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-green-500/5 blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                Siap Mengubah Limbah Jadi Cuan?
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Bergabung dengan 150+ UMKM yang sudah merasakan manfaatnya
              </p>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all shadow-lg shadow-green-500/50"
              >
                <span className="text-lg">Daftar Gratis Sekarang</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
