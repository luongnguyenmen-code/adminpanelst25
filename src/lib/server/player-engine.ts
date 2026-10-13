import { islePilotClient } from '@/lib/islepilot/client';
import { adminStore } from '@/lib/db/store';
import { theIsleRcon } from '@/lib/server/rcon';

export interface ST25PlayerProfile {
  steamId: string;
  name: string;
  online: boolean;
  species: string;
  female: boolean;
  growth: number;
  health: number;
  maxHealth: number;
  hunger: number;
  maxHunger: number;
  thirst: number;
  maxThirst: number;
  stamina: number;
  maxStamina: number;
  bleed: number;
  brokenLeg: boolean;
  position?: { x: number; y: number; z: number };
  lastSeenAt?: string;
  dinoId?: string;
  elder: 'No elder' | 'Frail' | 'Prime';
  isPrimeElder: boolean;
  // 16 full mutation slots
  mutations: {
    active: string[];
    parent: string[];
    elderA: string[];
    elderB: string[];
    totalCount: number;
  };
  garage: any[];
  notes?: any;
}

export interface ST25PlayerUpdatePayload {
  species?: string;
  female?: boolean;
  growth?: number;
  elder?: 'No elder' | 'Frail' | 'Prime';
  activeMutations?: string[];
  parentMutations?: string[];
  elderAMutations?: string[];
  elderBMutations?: string[];
  health?: number;
  hunger?: number;
  thirst?: number;
}

export class ST25PlayerEngine {
  /**
   * Get full player profile with complete 16 mutations, live stats, and garage.
   */
  async getPlayer(steamId: string): Promise<ST25PlayerProfile | null> {
    const rawPlayer = await islePilotClient.getPlayerDetail(steamId).catch(() => null);
    const savedPlayerMuts = adminStore.getPlayerMutations(steamId);
    const rawGarage = await islePilotClient.getPlayerGarage(steamId).catch(() => []);
    const notes = adminStore.getPlayerNotes(steamId);

    if (!rawPlayer && !savedPlayerMuts) {
      return null;
    }

    const name = rawPlayer?.name || 'Survivor';
    const online = !!rawPlayer?.online;
    const species = rawPlayer?.species || savedPlayerMuts?.species || 'Tyrannosaurus';
    const female = !!rawPlayer?.female;
    const growth = typeof rawPlayer?.growth === 'number' ? rawPlayer.growth : 1.0;

    // Resolve full 16 mutations
    const active = (savedPlayerMuts?.mutations?.length ? savedPlayerMuts.mutations : rawPlayer?.mutations || []).slice(0, 4);
    while (active.length < 4) active.push('-');

    const parent = (savedPlayerMuts?.lineage?.parent || ['-', '-', '-', '-']).map((x) => x || '-').slice(0, 4);
    while (parent.length < 4) parent.push('-');

    const elderA = (savedPlayerMuts?.lineage?.elderA || ['-', '-', '-', '-']).map((x) => x || '-').slice(0, 4);
    while (elderA.length < 4) elderA.push('-');

    const elderB = (savedPlayerMuts?.lineage?.elderB || ['-', '-', '-', '-']).map((x) => x || '-').slice(0, 4);
    while (elderB.length < 4) elderB.push('-');

    const validCount = [...active, ...parent, ...elderA, ...elderB].filter((m) => m && m !== '-' && m !== 'None').length;

    const elder = savedPlayerMuts?.elder || (rawPlayer?.isPrimeElder ? 'Prime' : 'No elder');

    // Enrich garage slots with local mutations & dino info
    const garage = rawGarage.map((slot) => {
      const savedSlot = adminStore.getGarageSlotMutations(slot.id);
      return {
        ...slot,
        mutations: savedSlot?.mutations || slot.mutations || [],
        elder: savedSlot?.elder || (slot.isPrimeElder ? 'Prime' : 'No elder'),
        lineage: savedSlot?.lineage || slot.lineage,
      };
    });

    return {
      steamId,
      name,
      online,
      species,
      female,
      growth,
      health: rawPlayer?.health ?? 1000,
      maxHealth: rawPlayer?.maxHealth ?? 1000,
      hunger: rawPlayer?.hunger ?? 300,
      maxHunger: rawPlayer?.maxHunger ?? 300,
      thirst: rawPlayer?.thirst ?? 800,
      maxThirst: rawPlayer?.maxThirst ?? 800,
      stamina: rawPlayer?.stamina ?? 100,
      maxStamina: rawPlayer?.maxStamina ?? 100,
      bleed: rawPlayer?.bleed ?? 0,
      brokenLeg: !!rawPlayer?.brokenLeg,
      position: rawPlayer?.position,
      lastSeenAt: rawPlayer?.lastSeenAt,
      dinoId: `dino_${steamId}_${species.toLowerCase()}`,
      elder,
      isPrimeElder: elder === 'Prime',
      mutations: {
        active,
        parent,
        elderA,
        elderB,
        totalCount: validCount,
      },
      garage,
      notes,
    };
  }

  /**
   * List all players with complete real-time information.
   */
  async getAllPlayers(onlineOnly = false, search = ''): Promise<ST25PlayerProfile[]> {
    const rawList = await islePilotClient.getPlayers(onlineOnly, search).catch(() => []);

    const profiles: ST25PlayerProfile[] = [];
    for (const p of rawList) {
      const savedMuts = adminStore.getPlayerMutations(p.steamId);
      const active = (savedMuts?.mutations?.length ? savedMuts.mutations : p.mutations || []).slice(0, 4);
      while (active.length < 4) active.push('-');

      const parent = (savedMuts?.lineage?.parent || ['-', '-', '-', '-']).map((x) => x || '-').slice(0, 4);
      while (parent.length < 4) parent.push('-');

      const elderA = (savedMuts?.lineage?.elderA || ['-', '-', '-', '-']).map((x) => x || '-').slice(0, 4);
      while (elderA.length < 4) elderA.push('-');

      const elderB = (savedMuts?.lineage?.elderB || ['-', '-', '-', '-']).map((x) => x || '-').slice(0, 4);
      while (elderB.length < 4) elderB.push('-');

      const validCount = [...active, ...parent, ...elderA, ...elderB].filter((m) => m && m !== '-' && m !== 'None').length;

      profiles.push({
        steamId: p.steamId,
        name: p.name,
        online: !!p.online,
        species: p.species,
        female: !!p.female,
        growth: typeof p.growth === 'number' ? p.growth : 0.5,
        health: p.health ?? 1000,
        maxHealth: p.maxHealth ?? 1000,
        hunger: p.hunger ?? 300,
        maxHunger: p.maxHunger ?? 300,
        thirst: p.thirst ?? 800,
        maxThirst: p.maxThirst ?? 800,
        stamina: 100,
        maxStamina: 100,
        bleed: 0,
        brokenLeg: false,
        position: p.position,
        lastSeenAt: p.lastSeenAt,
        dinoId: `dino_${p.steamId}_${p.species.toLowerCase()}`,
        elder: savedMuts?.elder || (p.isPrimeElder ? 'Prime' : 'No elder'),
        isPrimeElder: !!p.isPrimeElder,
        mutations: {
          active,
          parent,
          elderA,
          elderB,
          totalCount: validCount,
        },
        garage: [],
      });
    }

    return profiles;
  }

  /**
   * Real-time PUT update: executes commands into live server and syncs DB.
   */
  async updatePlayer(steamId: string, payload: ST25PlayerUpdatePayload): Promise<ST25PlayerProfile | null> {
    const current = await this.getPlayer(steamId);
    if (!current) {
      throw new Error(`Không tìm thấy người chơi với SteamID ${steamId}`);
    }

    const executedCommands: string[] = [];

    // 1. Swap species / gender
    if (
      (payload.species && payload.species !== current.species) ||
      (typeof payload.female === 'boolean' && payload.female !== current.female)
    ) {
      const targetSpecies = payload.species || current.species;
      const targetFemale = typeof payload.female === 'boolean' ? payload.female : current.female;
      const cmd = `swap ${steamId} ${targetSpecies} ${targetFemale}`;
      await theIsleRcon.execute(cmd);
      executedCommands.push(cmd);
    }

    // 2. Set Growth
    if (typeof payload.growth === 'number' && payload.growth !== current.growth) {
      const safeGrowth = Math.max(0.1, Math.min(1.0, payload.growth));
      const cmd = `setgrowth ${steamId} ${safeGrowth}`;
      await theIsleRcon.execute(cmd);
      executedCommands.push(cmd);
    }

    // 3. Set Prime Elder
    if (payload.elder === 'Prime' && current.elder !== 'Prime') {
      const cmd = `setprime ${steamId}`;
      await theIsleRcon.execute(cmd);
      executedCommands.push(cmd);
    }

    // 4. Set Stats (health, hunger, thirst)
    if (
      typeof payload.health === 'number' ||
      typeof payload.hunger === 'number' ||
      typeof payload.thirst === 'number'
    ) {
      const h = payload.health ?? current.health;
      const hu = payload.hunger ?? current.hunger;
      const t = payload.thirst ?? current.thirst;
      const cmd = `setstats ${steamId} ${h} ${hu} ${t}`;
      await theIsleRcon.execute(cmd);
      executedCommands.push(cmd);
    }

    // 5. Update Full 16 Mutations
    const nextActive = payload.activeMutations || current.mutations.active;
    const nextParent = payload.parentMutations || current.mutations.parent;
    const nextElderA = payload.elderAMutations || current.mutations.elderA;
    const nextElderB = payload.elderBMutations || current.mutations.elderB;

    const allValidMuts = [...nextActive, ...nextParent, ...nextElderA, ...nextElderB].filter(
      (m) => m && m !== '-' && m !== 'None'
    );

    // Apply mutations in game via RCON
    for (const mut of allValidMuts) {
      await theIsleRcon.execute(`mutations ${steamId} ${mut}`).catch(() => null);
    }

    // Save full snapshot in ST25 DB
    adminStore.setPlayerMutations(steamId, {
      mutations: nextActive.filter((m) => m && m !== '-'),
      elder: payload.elder || current.elder,
      species: payload.species || current.species,
      lineage: {
        parent: nextParent,
        elderA: nextElderA,
        elderB: nextElderB,
      },
    });

    // Return updated profile
    return await this.getPlayer(steamId);
  }
}

export const st25PlayerEngine = new ST25PlayerEngine();
