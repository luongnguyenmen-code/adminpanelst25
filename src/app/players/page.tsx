'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Search,
  Filter,
  Download,
  Eye,
  Heart,
  Beef,
  Droplets,
  ExternalLink,
  Crown,
  ChevronRight,
  RefreshCw,
  Dna,
} from 'lucide-react';
import { IslePilotPlayer } from '@/types/islepilot';
import { getDinoSpeciesImage, formatPlaytime, KNOWN_SPECIES_LIST } from '@/lib/utils';
import { PlayerInspectorModal } from '@/components/players/PlayerInspectorModal';
import { MutationGrantModal } from '@/components/players/MutationGrantModal';

export default function PlayersPage() {
  const [search, setSearch] = useState('');
  const [onlineFilter, setOnlineFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [speciesFilter, setSpeciesFilter] = useState<string>('all');
  const [selectedPlayer, setSelectedPlayer] = useState<IslePilotPlayer | null>(null);
  const [mutationPlayer, setMutationPlayer] = useState<IslePilotPlayer | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery<{ players: IslePilotPlayer[] }>({
    queryKey: ['players', onlineFilter, search],
    queryFn: async () => {
      const q = new URLSearchParams();
      if (onlineFilter === 'online') q.set('online', 'true');
      if (search) q.set('search', search);
      const res = await fetch(`/api/islepilot/players?${q.toString()}`);
      if (!res.ok) throw new Error('Failed to load players');
      return res.json();
    },
    refetchInterval: 15000,
  });

  const players = data?.players || [];

  // Filter list
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (onlineFilter === 'online' && !p.online) return false;
      if (onlineFilter === 'offline' && p.online) return false;
      if (speciesFilter !== 'all' && p.species !== speciesFilter) return false;
      if (search) {
        const s = search.toLowerCase();
        return (
          p.name.toLowerCase().includes(s) ||
          p.steamId.includes(s) ||
          p.species.toLowerCase().includes(s) ||
          (p.mutations && p.mutations.some((m) => m.toLowerCase().includes(s))) ||
          (p.discord?.username && p.discord.username.toLowerCase().includes(s))
        );
      }
      return true;
    });
  }, [players, onlineFilter, speciesFilter, search]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['SteamID', 'Name', 'Species', 'Gender', 'Growth', 'Online', 'Playtime(s)', 'Discord'];
    const rows = filteredPlayers.map((p) => [
      p.steamId,
      `"${p.name.replace(/"/g, '""')}"`,
      p.species,
      p.female ? 'Female' : 'Male',
      p.growth.toFixed(3),
      p.online ? 'Online' : 'Offline',
      p.totalPlaySec,
      p.discord ? `"${p.discord.username}"` : 'None',
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `islepilot_players_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            Danh Sách & Quản Trị Người Chơi
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Hiển thị {filteredPlayers.length} / {players.length} người chơi được ghi nhận trong cơ sở dữ liệu IslePilot
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-emerald-400' : ''}`} />
            Làm mới
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition"
          >
            <Download className="w-3.5 h-3.5" />
            Xuất file CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px] bg-zinc-950/70 px-3.5 py-2 rounded-xl border border-zinc-800">
          <Search className="w-4 h-4 text-emerald-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo SteamID64, tên nhân vật, Discord ID, loài..."
            className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
          />
        </div>

        {/* Online / Offline Filter */}
        <div className="flex items-center gap-1.5 bg-zinc-950/70 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setOnlineFilter('all')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              onlineFilter === 'all'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setOnlineFilter('online')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              onlineFilter === 'online'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Đang Online
          </button>
          <button
            onClick={() => setOnlineFilter('offline')}
            className={`px-3 py-1.5 rounded-lg transition font-medium ${
              onlineFilter === 'offline'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Offline
          </button>
        </div>

        {/* Species Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <select
            value={speciesFilter}
            onChange={(e) => setSpeciesFilter(e.target.value)}
            className="bg-zinc-950/70 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tất cả loài khủng long</option>
            {KNOWN_SPECIES_LIST.map((spec) => (
              <option key={spec} value={spec}>
                {spec}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Players Data Table */}
      <div className="rounded-2xl glass-panel border border-zinc-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-950/80 text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
              <tr>
                <th className="py-3.5 px-4">Người chơi</th>
                <th className="py-3.5 px-4">Khủng long & Loài</th>
                <th className="py-3.5 px-4 min-w-[210px]">Đột biến (Mutations)</th>
                <th className="py-3.5 px-4">Tăng trưởng</th>
                <th className="py-3.5 px-4">Sinh lực (HP / Ăn / Uống)</th>
                <th className="py-3.5 px-4">Thời gian chơi</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
                    Đang tải dữ liệu người chơi từ IslePilot API...
                  </td>
                </tr>
              ) : filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-400">
                    Không tìm thấy người chơi nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredPlayers.map((player) => {
                  const dinoImg = getDinoSpeciesImage(player.species);
                  return (
                    <tr
                      key={player.steamId}
                      className="hover:bg-zinc-900/50 transition cursor-pointer group"
                      onClick={() => setSelectedPlayer(player)}
                    >
                      {/* Player info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white">
                              {player.name.slice(0, 2).toUpperCase()}
                            </div>
                            <span
                              className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-zinc-950 ${
                                player.online ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-600'
                              }`}
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white group-hover:text-emerald-300 transition">
                                {player.name}
                              </span>
                              {player.isPrimeElder && (
                                <Crown className="w-3.5 h-3.5 text-amber-400" />
                              )}
                            </div>
                            <p className="text-[11px] font-mono text-zinc-500">{player.steamId}</p>
                          </div>
                        </div>
                      </td>

                      {/* Dino info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-zinc-900/90 border border-zinc-800 p-0.5 flex items-center justify-center">
                            <Image
                              src={dinoImg}
                              alt={player.species}
                              width={24}
                              height={24}
                              className="object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-zinc-200">{player.species}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <p className="text-[10px] text-zinc-500">
                                {player.female ? 'Cái ♀' : 'Đực ♂'}
                              </p>
                              {player.dinoId && (
                                <span
                                  className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-800/60 select-all cursor-copy"
                                  title="Dino UID của khủng long"
                                >
                                  ID: {player.dinoId}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Mutations info */}
                      <td
                        className="py-3.5 px-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlayer(player);
                        }}
                      >
                        {player.mutations && player.mutations.length > 0 ? (
                          <div className="space-y-1.5 max-w-[340px]">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-800/60 text-purple-300 font-bold">
                                {player.mutations.length} Gen
                              </span>
                              {player.reincarnationCount && player.reincarnationCount > 0 ? (
                                <span
                                  className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-bold"
                                  title="Số lần trùng sinh (cùng 1 UID khủng long)"
                                >
                                  Trùng sinh x{player.reincarnationCount}
                                </span>
                              ) : null}
                              {(player.elder === 'Prime' || player.isPrimeElder) && (
                                <span className="px-1.5 py-0.2 rounded-md bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold font-mono">
                                  Prime
                                </span>
                              )}
                              {player.elder === 'Frail' && (
                                <span className="px-1.5 py-0.2 rounded-md bg-orange-500/20 border border-orange-500/30 text-orange-300 text-[10px] font-bold font-mono">
                                  Frail
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1">
                              {player.mutations.map((mut, mIdx) => (
                                <span
                                  key={`${mut}-${mIdx}`}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[11px] font-medium tracking-tight hover:bg-purple-500/25 transition cursor-pointer"
                                  title={`Đột biến gen #${mIdx + 1}: ${mut}`}
                                >
                                  <Dna className="w-2.5 h-2.5 text-purple-400 flex-shrink-0" />
                                  <span>{mut}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-zinc-500 text-[11px] font-mono">
                            <span>— Chưa có</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setMutationPlayer(player);
                              }}
                              className="opacity-0 group-hover:opacity-100 px-1.5 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-medium transition"
                              title="Cấp / Bù đột biến cho người chơi"
                            >
                              + Cấp bù
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Growth */}
                      <td className="py-3.5 px-4">
                        <div className="w-28">
                          <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                            <span className="text-zinc-400">Growth:</span>
                            <span className="font-bold text-emerald-400">
                              {((player.growth || 0) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                              style={{ width: `${Math.min(100, (player.growth || 0) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Vitals summary */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className="flex items-center gap-1 text-red-400">
                            <Heart className="w-3 h-3" />
                            {Math.round(player.health)}
                          </span>
                          <span className="flex items-center gap-1 text-amber-400">
                            <Beef className="w-3 h-3" />
                            {Math.round(player.hunger)}
                          </span>
                          <span className="flex items-center gap-1 text-cyan-400">
                            <Droplets className="w-3 h-3" />
                            {Math.round(player.thirst)}
                          </span>
                        </div>
                      </td>

                      {/* Playtime */}
                      <td className="py-3.5 px-4 text-zinc-400 font-mono">
                        {formatPlaytime(player.totalPlaySec)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setMutationPlayer(player);
                            }}
                            className="p-1.5 rounded-xl bg-zinc-850 hover:bg-emerald-500/20 text-zinc-400 hover:text-emerald-400 border border-zinc-800 transition"
                            title="Cấp / Bù Đột Biến Gen (Mutations)"
                          >
                            <Dna className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedPlayer(player);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-zinc-300 font-medium transition inline-flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspector Modal */}
      <PlayerInspectorModal
        player={selectedPlayer}
        isOpen={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        onRefresh={() => refetch()}
      />

      {/* Quick Mutation Grant Modal */}
      <MutationGrantModal
        player={mutationPlayer}
        isOpen={!!mutationPlayer}
        onClose={() => setMutationPlayer(null)}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
