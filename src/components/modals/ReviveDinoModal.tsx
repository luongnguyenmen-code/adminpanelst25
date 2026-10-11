'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Sparkles,
  HeartHandshake,
  Heart,
  X,
  AlertTriangle,
  MapPin,
  ShieldCheck,
  Check,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { KNOWN_SPECIES_LIST, TELEPORT_SAFE_ZONES, getDinoSpeciesImage } from '@/lib/utils';
import { useApp } from '@/components/providers/AppProviders';

interface ReviveTargetInfo {
  steamId: string;
  name?: string;
  species?: string;
  growth?: number;
  reason?: string;
  coordinates?: { x: number; y: number; z: number };
}

interface ReviveDinoModalProps {
  isOpen: boolean;
  onClose: () => void;
  target?: ReviveTargetInfo | null;
  onSuccess?: () => void;
}

export function ReviveDinoModal({ isOpen, onClose, target, onSuccess }: ReviveDinoModalProps) {
  const { addToast } = useApp();

  const [steamId, setSteamId] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [species, setSpecies] = useState('Tyrannosaurus');
  const [growth, setGrowth] = useState<number>(1.0);
  const [healFull, setHealFull] = useState(true);
  const [selectedSafeZone, setSelectedSafeZone] = useState('');
  const [reason, setReason] = useState('Đền bù sự cố / Khôi phục khủng long tử nạn');
  const [loading, setLoading] = useState(false);

  // Sync state when target changes
  useEffect(() => {
    if (target) {
      setSteamId(target.steamId || '');
      setPlayerName(target.name || '');
      if (target.species) {
        // Find best match in KNOWN_SPECIES_LIST
        const match = KNOWN_SPECIES_LIST.find(
          (s) => s.toLowerCase() === target.species?.toLowerCase()
        );
        setSpecies(match || target.species);
      }
      if (target.growth !== undefined) {
        setGrowth(Math.min(1.0, Math.max(0.1, target.growth)));
      } else {
        setGrowth(1.0);
      }
      if (target.reason) {
        setReason(target.reason);
      } else {
        setReason('Đền bù sự cố / Khôi phục khủng long tử nạn');
      }
    }
  }, [target, isOpen]);

  if (!isOpen) return null;

  const handleQuickGrowth = (val: number) => {
    setGrowth(val);
  };

  const handleRevive = async () => {
    if (!steamId.trim()) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng nhập SteamID người chơi cần hồi sinh');
      return;
    }

    if (!species.trim()) {
      addToast('error', 'Lỗi nhập liệu', 'Vui lòng chọn loài khủng long cần hồi sinh');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/islepilot/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'revive',
          steamId: steamId.trim(),
          playerName: playerName.trim() || undefined,
          reason: reason.trim() || 'Hồi sinh khủng long tử nạn',
          params: {
            species: species.trim(),
            growth,
            healFull,
            teleportLocationId: selectedSafeZone || undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Lỗi từ máy chủ khi thực hiện hồi sinh');
      }

      addToast(
        'success',
        'HỒI SINH THÀNH CÔNG! ✨',
        `Đã hồi sinh ${species} (${(growth * 100).toFixed(0)}% Growth) cho ${playerName || steamId}`
      );

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      addToast('error', 'Hồi sinh thất bại', err.message);
    } finally {
      setLoading(false);
    }
  };

  const speciesImg = getDinoSpeciesImage(species);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-[#090e18] border border-emerald-500/40 shadow-2xl shadow-emerald-500/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-zinc-800 bg-gradient-to-r from-emerald-950/40 via-zinc-900 to-[#090e18] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide flex items-center gap-2">
                Phục Hồi / Hồi Sinh Khủng Long Tử Nạn
              </h3>
              <p className="text-xs text-zinc-400">
                Tự động hoán đổi loài (Swap), bơm lại tăng trưởng, hồi phục đầy đủ Máu & Thức ăn in-game
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-zinc-300">
          {/* Target Player Banner */}
          <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase font-mono text-zinc-400 font-bold">Nạn Nhân Cần Hồi Sinh</p>
              <p className="text-sm font-bold text-white mt-0.5">
                {playerName || 'Chưa rõ tên'} <span className="text-xs font-mono text-cyan-400 font-normal">({steamId || 'Chưa nhập SteamID'})</span>
              </p>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px] font-bold">
              REVIVE READY
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* SteamID */}
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">
                SteamID64 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                placeholder="76561198..."
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 font-mono text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Player Name */}
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">Tên Người Chơi (Hiển Thị)</label>
              <input
                type="text"
                placeholder="VD: Survivor..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Species Selection */}
          <div>
            <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Loài Khủng Long Khôi Phục <span className="text-red-400">*</span></span>
              <span className="text-[11px] text-zinc-400 font-normal">Hiện tại: <b className="text-emerald-400">{species}</b></span>
            </label>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-700">
              {speciesImg && (
                <img
                  src={speciesImg}
                  alt={species}
                  className="w-10 h-10 rounded-lg object-cover bg-black/50 border border-zinc-800 flex-shrink-0"
                />
              )}
              <select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                className="w-full bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
              >
                {KNOWN_SPECIES_LIST.map((sp) => (
                  <option key={sp} value={sp} className="bg-zinc-900 text-white">
                    {sp}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Growth Slider & Presets */}
          <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-zinc-200">
                Mức Độ Tăng Trưởng (Growth): <span className="font-mono text-emerald-400 font-bold text-sm">{(growth * 100).toFixed(0)}% ({growth.toFixed(2)})</span>
              </label>
              <div className="flex items-center gap-1.5">
                {[
                  { label: '20% Non', val: 0.2 },
                  { label: '50% Thiếu niên', val: 0.5 },
                  { label: '80% Lớn', val: 0.8 },
                  { label: '100% Max', val: 1.0 },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleQuickGrowth(item.val)}
                    className={`px-2 py-1 rounded-lg text-[10px] font-mono transition ${
                      growth === item.val
                        ? 'bg-emerald-500 text-black font-bold shadow-md shadow-emerald-500/30'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={growth}
              onChange={(e) => setGrowth(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>

          {/* Options: Full Heal & Safe Zone Teleport */}
          <div className="space-y-3">
            {/* Full Heal Checkbox */}
            <label className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/70 border border-zinc-800 cursor-pointer hover:border-zinc-700 transition">
              <input
                type="checkbox"
                checked={healFull}
                onChange={(e) => setHealFull(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-zinc-950 border-zinc-700"
              />
              <div>
                <p className="font-semibold text-white">Bơm Đầy Máu, Độ Đói & Độ Khát (Full Vital Stats)</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Tự động hồi 10,000 HP, 10,000 Thức ăn, 10,000 Nước uống, xóa vết chảy máu và hồi chân gãy.
                </p>
              </div>
            </label>

            {/* Safe Zone Teleport */}
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                Dịch Chuyển Về Vị Trí An Toàn (Tùy chọn)
              </label>
              <select
                value={selectedSafeZone}
                onChange={(e) => setSelectedSafeZone(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="">-- Giữ nguyên vị trí hiện tại (Không Teleport) --</option>
                {TELEPORT_SAFE_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Audit Reason */}
            <div>
              <label className="block text-zinc-300 font-semibold mb-1.5">
                Lý Do Phục Hồi (Ghi Sổ Nhật Ký BQT) <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="VD: Chết do bug kẹt map / Đền bù mixpack trái luật..."
                className="w-full p-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 transition"
          >
            Hủy Bỏ
          </button>

          <button
            type="button"
            onClick={handleRevive}
            disabled={loading || !steamId.trim()}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Đang hồi sinh in-game...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Xác Nhận Hồi Sinh Khủng Long</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
