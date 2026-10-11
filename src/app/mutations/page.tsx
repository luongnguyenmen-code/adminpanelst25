'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  Dna,
  Search,
  Filter,
  RefreshCw,
  Crown,
  Sparkles,
  History,
  ShieldCheck,
  User,
  CheckCircle2,
  XCircle,
  Plus,
  Eye,
  Sliders,
  Calendar,
} from 'lucide-react';
import { IslePilotPlayer } from '@/types/islepilot';
import { MutationAuditLogItem } from '@/lib/db/store';
import { getDinoSpeciesImage, formatTimeAgo, KNOWN_SPECIES_LIST } from '@/lib/utils';
import { useApp } from '@/components/providers/AppProviders';
import { MutationGrantModal } from '@/components/players/MutationGrantModal';
import { PlayerInspectorModal } from '@/components/players/PlayerInspectorModal';

export default function MutationsHubPage() {
  const { currentSession } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview');
  const [search, setSearch] = useState('');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [elderFilter, setElderFilter] = useState<'all' | 'Prime' | 'Frail' | 'No elder'>('all');

  // Selected player for mutation modals
  const [selectedPlayerForGrant, setSelectedPlayerForGrant] = useState<IslePilotPlayer | null>(null);
  const [selectedPlayerForInspect, setSelectedPlayerForInspect] = useState<IslePilotPlayer | null>(null);

  // 1. Fetch Players data
  const {
    data: playersData,
    isLoading: isLoadingPlayers,
    refetch: refetchPlayers,
    isFetching: isFetchingPlayers,
  } = useQuery<{ players: IslePilotPlayer[] }>({
    queryKey: ['players', 'mutations-hub'],
    queryFn: async () => {
      const res = await fetch('/api/islepilot/players');
      if (!res.ok) throw new Error('Không thể tải danh sách người chơi');
      return res.json();
    },
    refetchInterval: 15000,
  });

  // 2. Fetch Mutations Audit Logs & Catalog
  const {
    data: mutationsData,
    isLoading: isLoadingLogs,
    refetch: refetchLogs,
    isFetching: isFetchingLogs,
  } = useQuery<{
    logs: MutationAuditLogItem[];
    catalog: string[];
    totalLogs: number;
  }>({
    queryKey: ['mutations', 'audit-logs'],
    queryFn: async () => {
      const res = await fetch('/api/islepilot/mutations');
      if (!res.ok) throw new Error('Không thể tải nhật ký đột biến');
      return res.json();
    },
    refetchInterval: 10000,
  });

  const players = playersData?.players || [];
  const logs = mutationsData?.logs || [];
  const catalog = mutationsData?.catalog || [];

  // Filtered Players Overview
  const filteredPlayers = useMemo(() => {
    return players.filter((p) => {
      if (speciesFilter !== 'all' && p.species !== speciesFilter) return false;
      if (elderFilter !== 'all') {
        const pElder = p.elder || (p.isPrimeElder ? 'Prime' : 'No elder');
        if (pElder !== elderFilter) return false;
      }
      if (search.trim()) {
        const s = search.toLowerCase();
        const matchName = p.name.toLowerCase().includes(s);
        const matchSteam = p.steamId.includes(s);
        const matchSpecies = p.species.toLowerCase().includes(s);
        const matchMut = p.mutations?.some((m) => m.toLowerCase().includes(s));
        return matchName || matchSteam || matchSpecies || matchMut;
      }
      return true;
    });
  }, [players, speciesFilter, elderFilter, search]);

  // Filtered Audit Logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (search.trim()) {
        const s = search.toLowerCase();
        const matchActor = log.actorName.toLowerCase().includes(s);
        const matchTarget = (log.targetPlayerName || '').toLowerCase().includes(s);
        const matchSteam = log.targetSteamId.includes(s);
        const matchSpecies = (log.species || '').toLowerCase().includes(s);
        const matchMut = log.mutations.some((m) => m.toLowerCase().includes(s));
        return matchActor || matchTarget || matchSteam || matchSpecies || matchMut;
      }
      return true;
    });
  }, [logs, search]);

  // Metrics
  const playersWithMutationsCount = useMemo(() => {
    return players.filter((p) => p.mutations && p.mutations.length > 0).length;
  }, [players]);

  const primeElderCount = useMemo(() => {
    return players.filter((p) => p.isPrimeElder || p.elder === 'Prime').length;
  }, [players]);

  const handleRefreshAll = () => {
    refetchPlayers();
    refetchLogs();
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
            <Dna className="w-6 h-6 text-purple-400" />
            Trung Tâm Quản Lý Đột Biến Gen (Mutations Hub & Logs)
          </h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Giám sát cấu trúc đột biến, cấp bù gen cho thành viên và truy xuất nhật ký can thiệp thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:text-white transition"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isFetchingPlayers || isFetchingLogs ? 'animate-spin text-purple-400' : ''
              }`}
            />
            Làm mới dữ liệu
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl glass-panel border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Đang Có Đột Biến</span>
            <Dna className="w-4 h-4 text-purple-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">
            {playersWithMutationsCount}{' '}
            <span className="text-xs font-normal text-zinc-500 font-sans">
              / {players.length} người chơi
            </span>
          </p>
          <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden mt-2">
            <div
              className="h-full bg-purple-500"
              style={{
                width: `${Math.min(100, (playersWithMutationsCount / (players.length || 1)) * 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Cấp Độ Prime Elder</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-300 font-mono">{primeElderCount}</p>
          <p className="text-[11px] text-zinc-500">Khủng long đã mở khóa đặc quyền Prime</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Nhật Ký Can Thiệp (Logs)</span>
            <History className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-black text-white font-mono">{logs.length}</p>
          <p className="text-[11px] text-zinc-500">Lượt cấp bù / chỉnh gen được lưu trữ</p>
        </div>

        <div className="p-4 rounded-2xl glass-panel border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
            <span>Danh Mục Đột Biến Evrima</span>
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            {catalog.length || 37}{' '}
            <span className="text-xs font-normal text-zinc-500 font-sans">loại gen</span>
          </p>
          <p className="text-[11px] text-zinc-500">Chuẩn hóa đầy đủ theo IslePilot API</p>
        </div>
      </div>

      {/* Tabs Switcher and Filter Toolbar */}
      <div className="p-4 rounded-2xl glass-panel border border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Main Tab Navigation */}
          <div className="flex items-center gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-purple-600/25 text-purple-300 border border-purple-500/30 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Dna className="w-4 h-4 text-purple-400" />
              Tổng quan Đột Biến Người Chơi ({filteredPlayers.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition ${
                activeTab === 'logs'
                  ? 'bg-purple-600/25 text-purple-300 border border-purple-500/30 shadow-md'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <History className="w-4 h-4 text-cyan-400" />
              Nhật Ký Cấp Bù Đột Biến ({filteredLogs.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="flex items-center gap-2.5 bg-zinc-950 px-3.5 py-2 rounded-xl border border-zinc-800 min-w-[300px] flex-1 max-w-md">
            <Search className="w-4 h-4 text-purple-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên người chơi, SteamID, loài, tên gen..."
              className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Sub-Filters for Overview tab */}
        {activeTab === 'overview' && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-800/60 text-xs">
            <div className="flex items-center gap-3">
              {/* Species Filter */}
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={speciesFilter}
                  onChange={(e) => setSpeciesFilter(e.target.value)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Tất cả loài khủng long</option>
                  {KNOWN_SPECIES_LIST.map((sp) => (
                    <option key={sp} value={sp}>
                      {sp}
                    </option>
                  ))}
                </select>
              </div>

              {/* Elder Filter */}
              <div className="flex items-center gap-1.5">
                <select
                  value={elderFilter}
                  onChange={(e) => setElderFilter(e.target.value as any)}
                  className="bg-zinc-950 border border-zinc-800 text-xs text-zinc-300 rounded-xl px-3 py-1.5 focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Tất cả cấp bậc Elder</option>
                  <option value="Prime">Chỉ Prime</option>
                  <option value="Frail">Chỉ Frail</option>
                  <option value="No elder">Chưa Elder (No elder)</option>
                </select>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 font-mono">
              Hiển thị {filteredPlayers.length} người chơi phù hợp
            </p>
          </div>
        )}
      </div>

      {/* Tab 1: Overview Table */}
      {activeTab === 'overview' && (
        <div className="rounded-2xl glass-panel border border-zinc-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Người chơi</th>
                  <th className="py-3.5 px-4">Khủng long & Loài</th>
                  <th className="py-3.5 px-4">Cấp độ Elder</th>
                  <th className="py-3.5 px-4 min-w-[280px]">Đột biến gen kích hoạt (Active Mutations)</th>
                  <th className="py-3.5 px-4 text-right">Thao tác can thiệp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {isLoadingPlayers ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
                      Đang tải danh sách người chơi và đột biến...
                    </td>
                  </tr>
                ) : filteredPlayers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-zinc-400">
                      Không tìm thấy người chơi nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredPlayers.map((player) => {
                    const dinoImg = getDinoSpeciesImage(player.species);
                    const elder = player.elder || (player.isPrimeElder ? 'Prime' : 'No elder');
                    const hasMutations = player.mutations && player.mutations.length > 0;

                    return (
                      <tr key={player.steamId} className="hover:bg-zinc-900/50 transition group">
                        {/* Player */}
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
                              <div className="flex items-center gap-1.5 font-bold text-white">
                                <span>{player.name}</span>
                                {elder === 'Prime' && (
                                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                                )}
                              </div>
                              <p className="text-[11px] font-mono text-zinc-500">{player.steamId}</p>
                            </div>
                          </div>
                        </td>

                        {/* Dino */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 p-0.5 flex items-center justify-center">
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
                              <p className="text-[10px] text-zinc-500">
                                {player.female ? 'Cái ♀' : 'Đực ♂'} • Growth:{' '}
                                {((player.growth || 0) * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Elder status */}
                        <td className="py-3.5 px-4 font-mono">
                          {elder === 'Prime' ? (
                            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs inline-flex items-center gap-1">
                              <Crown className="w-3 h-3 text-amber-400" /> Prime Elder
                            </span>
                          ) : elder === 'Frail' ? (
                            <span className="px-2 py-0.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-300 font-bold text-xs">
                              Frail Elder
                            </span>
                          ) : (
                            <span className="text-zinc-500 text-xs">No elder</span>
                          )}
                        </td>

                        {/* Mutations */}
                        <td className="py-3.5 px-4">
                          {hasMutations ? (
                            <div className="space-y-1.5 max-w-lg">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30">
                                  <Dna className="w-3 h-3 text-purple-400" />
                                  {player.mutations!.length} / 16 Đột biến gen
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {player.mutations!.map((mut, mIdx) => (
                                  <span
                                    key={`${mut}-${mIdx}`}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-zinc-300 text-[11px] font-medium hover:border-purple-500/50 hover:text-purple-200 transition cursor-default"
                                    title={`Đột biến gen #${mIdx + 1}: ${mut}`}
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                    <span>{mut}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-500 font-mono italic">
                              — Chưa có đột biến nào (0 / 16)
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedPlayerForGrant(player)}
                              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition flex items-center gap-1.5"
                              title="Mở bảng cấp bù / sửa đổi đột biến"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Cấp Bù / Đổi Gen</span>
                            </button>

                            <button
                              onClick={() => setSelectedPlayerForInspect(player)}
                              className="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                              title="Xem chi tiết người chơi"
                            >
                              <Eye className="w-3.5 h-3.5" />
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
      )}

      {/* Tab 2: Mutation Audit Logs Table */}
      {activeTab === 'logs' && (
        <div className="rounded-2xl glass-panel border border-zinc-800/80 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-950/80 text-zinc-400 font-mono uppercase text-[11px] border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Thời gian</th>
                  <th className="py-3.5 px-4">Admin thực hiện</th>
                  <th className="py-3.5 px-4">Người chơi nhận</th>
                  <th className="py-3.5 px-4">Loài</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Đột biến được cấp</th>
                  <th className="py-3.5 px-4">Trạng thái</th>
                  <th className="py-3.5 px-4">Lý do can thiệp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 font-sans">
                {isLoadingLogs ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-purple-400 mb-2" />
                      Đang tải nhật ký can thiệp đột biến...
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      Chưa ghi nhận lượt can thiệp đột biến nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-900/50 transition">
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 font-mono text-zinc-400 whitespace-nowrap">
                        <span title={log.createdAt}>{formatTimeAgo(log.createdAt)}</span>
                      </td>

                      {/* Actor */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-white">{log.actorName}</span>
                        <p className="text-[10px] font-mono text-purple-400">{log.actorRole}</p>
                      </td>

                      {/* Target */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-zinc-200">
                          {log.targetPlayerName || 'Survivor'}
                        </span>
                        <p className="text-[10px] font-mono text-zinc-500">
                          {log.targetSteamId}
                        </p>
                      </td>

                      {/* Species */}
                      <td className="py-3.5 px-4 font-semibold text-zinc-300">
                        {log.species || '—'}
                      </td>

                      {/* Mutations granted */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {log.mutations.length > 0 ? (
                            log.mutations.map((m) => (
                              <span
                                key={m}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[11px]"
                              >
                                <Dna className="w-2.5 h-2.5 text-purple-400" />
                                <span>{m}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-zinc-500 italic">None / Reset</span>
                          )}
                          {log.elder === 'Prime' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                              Prime
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {log.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Thành công
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-bold">
                            <XCircle className="w-3 h-3" /> Thất bại
                          </span>
                        )}
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 text-zinc-400 text-xs max-w-xs truncate" title={log.reason}>
                        {log.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mutation Grant Modal */}
      <MutationGrantModal
        player={selectedPlayerForGrant}
        isOpen={!!selectedPlayerForGrant}
        onClose={() => setSelectedPlayerForGrant(null)}
        onSuccess={() => handleRefreshAll()}
      />

      {/* Player Inspector Modal */}
      <PlayerInspectorModal
        player={selectedPlayerForInspect}
        isOpen={!!selectedPlayerForInspect}
        onClose={() => setSelectedPlayerForInspect(null)}
        onRefresh={() => handleRefreshAll()}
      />
    </div>
  );
}
