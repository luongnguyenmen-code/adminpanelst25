import { NextRequest, NextResponse } from 'next/server';
import { islePilotClient } from '@/lib/islepilot/client';
import { adminStore } from '@/lib/db/store';
import { DinoSlot } from '@/types/islepilot';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const steamId = searchParams.get('steamId');
    const search = searchParams.get('search')?.trim().toLowerCase();

    // Fetch players map for player name lookup
    const allPlayers = await islePilotClient.getPlayers(false).catch(() => []);
    const playerMap = new Map(allPlayers.map((p) => [p.steamId, p.name]));

    let slots: DinoSlot[] = [];
    if (steamId) {
      slots = await islePilotClient.getPlayerGarage(steamId);
    } else if (search) {
      // Check if search matches a steamId or a player's name
      if (/^\d{17}$/.test(search)) {
        slots = await islePilotClient.getPlayerGarage(search);
      } else {
        const matchingPlayer = allPlayers.find((p) =>
          p.name.toLowerCase().includes(search)
        );
        if (matchingPlayer) {
          const pSlots = await islePilotClient.getPlayerGarage(matchingPlayer.steamId);
          if (pSlots && pSlots.length > 0) {
            slots = pSlots;
          }
        }
      }

      // Check if search matches an indexed Dino UID
      if (!slots || slots.length === 0) {
        const allStoredDinos = adminStore.getAllDinos();
        const matchedDino = Object.values(allStoredDinos).find((d) =>
          d.dinoId.toLowerCase().includes(search)
        );
        if (matchedDino && matchedDino.steamId) {
          slots = await islePilotClient.getPlayerGarage(matchedDino.steamId);
        }
      }

      // If not resolved, search across all server slots
      if (!slots || slots.length === 0) {
        slots = await islePilotClient.getAllServerGarage();
      }
    } else {
      slots = await islePilotClient.getAllServerGarage();
    }

    // Auto-index returned dinos to keep UID lookup instantaneous
    (slots || []).forEach((slot) => {
      if (slot.id && slot.steamId) {
        adminStore.saveDino(slot.id, {
          dinoId: slot.id,
          steamId: slot.steamId,
          playerName: slot.playerName || playerMap.get(slot.steamId),
          species: slot.species,
          mutations: slot.mutations,
          isPrimeElder: slot.isPrimeElder,
        });
      }
    });



    // Real IslePilot garage slot data mapping
    let enriched = (slots || []).map((slot) => {
      const playerName = slot.playerName || playerMap.get(slot.steamId) || 'Survivor';
      const activeMutations = slot.mutations || [];
      const elder = slot.elder || (slot.isPrimeElder ? 'Prime' : 'No elder');
      const isPrimeElder = slot.isPrimeElder || elder === 'Prime';

      return {
        ...slot,
        id: slot.id, // Explicit Dino UID
        playerName,
        mutations: activeMutations,
        elder,
        isPrimeElder,
      };
    });

    // Filter by specific steamId if selected
    if (steamId) {
      enriched = enriched.filter((s) => s.steamId === steamId);
    }

    // Multi-field search filtering (dino UID, species, steamId, player name, mutation)
    if (search) {
      const q = search.trim().toLowerCase();
      enriched = enriched.filter((s) => {
        const matchesId = (s.id || '').toLowerCase().includes(q);
        const matchesSpecies = s.species.toLowerCase().includes(q);
        const matchesSteamId = s.steamId.toLowerCase().includes(q);
        const matchesName = (s.playerName || '').toLowerCase().includes(q);
        const matchesMutations = (s.mutations || []).some((m) =>
          m.toLowerCase().includes(q)
        );
        return matchesId || matchesSpecies || matchesSteamId || matchesName || matchesMutations;
      });
    }

    return NextResponse.json({ garage: enriched, total: enriched.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
