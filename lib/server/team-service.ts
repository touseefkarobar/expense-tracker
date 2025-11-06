import { AppwriteException, ID } from "node-appwrite";

import { teams } from "./appwrite";
import { fetchWallet, linkWalletToTeam } from "./finance-service";

const formatAppwriteError = (error: unknown) => {
  if (error instanceof AppwriteException) {
    return `${error.message} (Appwrite code ${error.code})`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown error";
};

export interface CreateWalletTeamInput {
  walletId: string;
  teamName: string;
}

export async function createTeamForWallet({ walletId, teamName }: CreateWalletTeamInput) {
  try {
    const team = await teams.create(ID.unique(), teamName);
    await linkWalletToTeam(walletId, team.$id);
    return team;
  } catch (error) {
    throw new Error(`Unable to create Appwrite team: ${formatAppwriteError(error)}`);
  }
}

export interface AttachWalletTeamInput {
  walletId: string;
  teamId: string;
}

export async function attachExistingTeamToWallet({ walletId, teamId }: AttachWalletTeamInput) {
  try {
    await teams.get(teamId);
  } catch (error) {
    throw new Error(`Unable to load Appwrite team: ${formatAppwriteError(error)}`);
  }

  return linkWalletToTeam(walletId, teamId);
}

export interface AddTeamMemberInput {
  walletId: string;
  userId: string;
  role: string;
}

export async function addTeamMemberToWallet({ walletId, userId, role }: AddTeamMemberInput) {
  const wallet = await fetchWallet(walletId);

  if (!wallet.owner_team_id) {
    throw new Error("Link an Appwrite team to this wallet before adding members.");
  }

  try {
    const membership = await teams.createMembership(wallet.owner_team_id, [role], undefined, userId);
    return membership;
  } catch (error) {
    throw new Error(`Unable to add member: ${formatAppwriteError(error)}`);
  }
}
