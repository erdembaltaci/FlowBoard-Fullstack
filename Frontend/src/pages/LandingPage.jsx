import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { BarChart, Bell, Settings, LayoutDashboard } from 'lucide-react';

// Animasyon varyantları (Değişiklik yok)
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

function LandingPage() {
  // "Çok Yakında" bölümü için özellik listesi (Değişiklik yok)
  const upcomingFeatures = [
    {
      icon: <BarChart className="h-6 w-6 text-purple-400" />,
      title: "Detaylı Raporlama",
      description: "Projelerinizin performansı hakkında derinlemesine analizler ve görsel raporlar."
    },
    {
      icon: <Bell className="h-6 w-6 text-amber-400" />,
      title: "Bildirim Merkezi",
      description: "Size atanan görevler ve önemli güncellemeler için anlık bildirimler."
    },
    {
      icon: <Settings className="h-6 w-6 text-green-400" />,
      title: "Kişisel Ayarlar",
      description: "Arayüz temasını ve bildirim tercihlerinizi özelleştirin."
    }
  ];

  return (
    // DEĞİŞİKLİK 1: Yatay taşmayı engellemek için relative ve overflow-hidden eklendi.
    <div className="relative w-full bg-slate-900 text-white overflow-hidden">
      {/* Arka Plan Efekti */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-0 -left-4 w-72 h-72 lg:w-[500px] lg:h-[500px] bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 lg:w-[500px] lg:h-[500px] bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 lg:w-[500px] lg:h-[500px] bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Sayfa İçeriği */}
      <div className="relative z-10">
        {/* Navigasyon Çubuğu */}
        <nav className="container mx-auto p-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-wider">
            <LayoutDashboard className="text-blue-400" />
            <span>FlowBoard</span>
          </Link>
          {/* DEĞİŞİKLİK 2: Menü, mobil cihazlarda gizlendi (hamburger menü alternatifi) */}
          <div className="hidden md:flex items-center gap-6">
            <a href="mailto:flow.boardd@gmail.com" className="text-slate-300 hover:text-white transition-colors">
              Destek
            </a>
            <Link to="/login" className="text-slate-300 hover:text-white transition-colors">Giriş Yap</Link>
            <Button asChild className="bg-blue-600 hover:bg-blue-500 text-white rounded-full">
              <Link to="/register">Hemen Başla</Link>
            </Button>
          </div>
        </nav>

        {/* Ana Karşılama (Hero) Bölümü */}
        <main className="container mx-auto mt-20 md:mt-32 px-4 text-center min-h-[70vh] flex flex-col justify-center items-center">
          <motion.div variants={containerVariants} initial="hidden" animate="visible">
            {/* DEĞİŞİKLİK 3: Başlık font boyutu mobil için daha uygun hale getirildi */}
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
              Proje Yönetiminde Yeni Bir Dönem
            </motion.h1>
            <motion.p variants={itemVariants} className="mt-6 text-lg md:text-xl text-slate-400 max-w-2xl mx-auto">
              Takımınızla sinerji içinde çalışın. Kanban panoları, detaylı görev takibi ve güçlü raporlama ile hedeflerinize hiç olmadığı kadar hızlı ulaşın.
            </motion.p>
            <motion.div variants={itemVariants} className="mt-10 flex justify-center gap-4">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-500 text-lg text-white rounded-full shadow-lg shadow-blue-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/50">
                <Link to="/register">Ücretsiz Kayıt Ol</Link>
              </Button>
            </motion.div>
          </motion.div>
        </main>

        {/* Çok Yakında Bölümü (Değişiklik yok, bu bölüm zaten mobil uyumlu) */}
        <section className="container mx-auto px-4 py-24">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-bold text-center mb-4">Geliştirme Yol Haritamız</h2>
            <p className="text-lg text-slate-400 text-center mb-12 max-w-2xl mx-auto">FlowBoard'u sürekli olarak daha iyi hale getirmek için çalışıyoruz. İşte çok yakında eklenecek bazı özellikler:</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {upcomingFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-slate-800/50 border-slate-700 h-full">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <CardTitle className="text-xl text-white">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="text-slate-400">
                    {feature.description}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer (Değişiklik yok) */}
        <footer className="container mx-auto text-center py-8 border-t border-slate-800">
          <p className="text-slate-500">&copy; {new Date().getFullYear()} FlowBoard. Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </div>
  );
}

export default LandingPage;
