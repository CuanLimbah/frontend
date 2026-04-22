import { MapPin, Phone, Clock } from 'lucide-react';
import { mockDropPoints } from '../../lib/mockData';

export function DropPointList() {
  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl text-white mb-6">Titik Setor Limbah</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {mockDropPoints.map((point) => (
          <div
            key={point.id}
            className="p-6 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 hover:border-green-500/30 transition-all group"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
                <MapPin className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg text-white mb-1">{point.name}</h3>
                <p className="text-gray-400 text-sm">{point.address}</p>
              </div>
            </div>

            <div className="space-y-2 pl-16">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>{point.operating_hours}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Phone className="w-4 h-4" />
                <span>{point.contact}</span>
              </div>
            </div>

            <button className="w-full mt-4 py-2 bg-green-500/10 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors border border-green-500/30">
              Lihat Peta
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 p-6 rounded-xl bg-blue-500/10 border border-blue-500/30">
        <h3 className="text-white mb-2">💡 Tips Setor Limbah</h3>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• Kami menerima: Sampah Sisa Makanan dan Minyak Jelantah</li>
          <li>• Pastikan limbah sudah dipilah berdasarkan jenisnya</li>
          <li>• Minyak jelantah dalam kondisi bersih (sudah disaring)</li>
          <li>• Datang sesuai jam operasional drop point</li>
          <li>• Gunakan fitur "Setor Limbah" untuk pre-register sebelum datang</li>
        </ul>
      </div>
    </div>
  );
}
