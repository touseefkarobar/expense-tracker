"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import type { Models } from "node-appwrite";

import { buttonVariants } from "@/lib/utils/button-variants";
import { cn } from "@/lib/utils/cn";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  attachTeamToWalletAction,
  createWalletTeamAction,
  addTeamMemberAction
} from "../actions";
import { initialState } from "../types";

interface WalletTeamManagerProps {
  walletId: string;
  walletName: string;
  team: { id: string; memberships: Models.Membership[] } | null;
  teamError: string | null;
  currentUserId: string | null;
}

function SubmitButton({ label, disabled }: { label: string; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto")}
      disabled={pending || disabled}
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

interface SearchResult {
  id: string;
  email: string;
  name: string;
  status: string;
}

export function WalletTeamManager({ walletId, walletName, team, teamError, currentUserId }: WalletTeamManagerProps) {
  const router = useRouter();
  const [createState, createAction] = useFormState(createWalletTeamAction, initialState);
  const [attachState, attachAction] = useFormState(attachTeamToWalletAction, initialState);
  const [addMemberState, addMemberAction] = useFormState(addTeamMemberAction, initialState);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<SearchResult | null>(null);

  useEffect(() => {
    if (createState.status === "success" || attachState.status === "success" || addMemberState.status === "success") {
      router.refresh();
    }
  }, [createState.status, attachState.status, addMemberState.status, router]);

  useEffect(() => {
    if (createState.status === "success") {
      const form = document.getElementById("create-wallet-team-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [createState.status]);

  useEffect(() => {
    if (attachState.status === "success") {
      const form = document.getElementById("attach-wallet-team-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [attachState.status]);

  useEffect(() => {
    if (addMemberState.status === "success") {
      const form = document.getElementById("add-team-member-form") as HTMLFormElement | null;
      form?.reset();
      setSearchTerm("");
      setSearchResults([]);
      setSelectedUser(null);
    }
  }, [addMemberState.status]);

  const existingUserIds = useMemo(() => {
    if (!team) {
      return new Set<string>();
    }
    const ids = team.memberships
      .map(member => member.userId)
      .filter((id): id is string => typeof id === "string" && id.length > 0);
    return new Set(ids);
  }, [team]);

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchTerm.trim())}`, {
          signal: controller.signal
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => ({}))) as { error?: string };
          throw new Error(payload.error ?? "Unable to search users.");
        }

        const payload = (await response.json()) as { users: SearchResult[] };
        const filtered = payload.users.filter(user => {
          if (existingUserIds.has(user.id)) {
            return false;
          }
          if (currentUserId && user.id === currentUserId) {
            return false;
          }
          return true;
        });
        setSearchResults(filtered);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setSearchError(error instanceof Error ? error.message : "Unable to search users.");
        }
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm, existingUserIds, currentUserId]);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-slate-900">Wallet collaboration</h2>
        <p className="text-sm text-slate-600">
          Manage the Appwrite team that controls access to <strong>{walletName}</strong>.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {teamError ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700">{teamError}</div>
        ) : null}

        {team ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-500">
              Team ID: <span className="font-mono text-slate-700">{team.id}</span>
            </div>
            <form
              id="add-team-member-form"
              action={addMemberAction}
              className="space-y-4 rounded-lg border border-slate-200 p-4"
            >
              <input type="hidden" name="walletId" value={walletId} />
              <input type="hidden" name="userId" value={selectedUser?.id ?? ""} />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">Add an existing user</h3>
                <p className="text-xs text-slate-500">
                  Teammates need to sign up before they can be added. Search their email to link them instantly.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="team-member-search">Search users</Label>
                <div className="relative">
                  <Input
                    id="team-member-search"
                    name="memberSearch"
                    autoComplete="off"
                    placeholder="person@email.com"
                    value={searchTerm}
                    onChange={event => {
                      const value = event.target.value;
                      setSearchTerm(value);
                      if (!value) {
                        setSelectedUser(null);
                      }
                    }}
                    aria-invalid={Boolean(addMemberState.fieldErrors?.userId)}
                  />
                  {searchTerm ? (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedUser(null);
                      }}
                      className="absolute inset-y-0 right-2 flex items-center text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
                <p className="text-xs text-slate-500">Enter at least two characters to start searching.</p>
                {searchError ? <p className="text-sm text-red-600">{searchError}</p> : null}
                {searchTerm.trim().length >= 2 ? (
                  <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm">
                    {isSearching ? (
                      <p className="px-3 py-2 text-sm text-slate-500">Searching…</p>
                    ) : searchResults.length === 0 ? (
                      <p className="px-3 py-2 text-sm text-slate-500">No matching users found.</p>
                    ) : (
                      <ul className="divide-y divide-slate-100 text-sm">
                        {searchResults.map(result => (
                          <li key={result.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedUser(result);
                                setSearchTerm(result.email);
                              }}
                              className={cn(
                                "flex w-full flex-col items-start gap-1 px-3 py-2 text-left transition hover:bg-slate-50",
                                selectedUser?.id === result.id ? "bg-slate-100" : "bg-white"
                              )}
                            >
                              <span className="font-medium text-slate-700">{result.name}</span>
                              <span className="text-xs text-slate-500">{result.email}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : null}
                {addMemberState.fieldErrors?.userId ? (
                  <p className="text-sm text-red-600">{addMemberState.fieldErrors.userId}</p>
                ) : null}
                {selectedUser ? (
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Ready to add <span className="font-semibold">{selectedUser.name}</span> ({selectedUser.email})
                  </div>
                ) : null}
              </div>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="team-member-role">Role</Label>
                  <select
                    id="team-member-role"
                    name="role"
                    defaultValue="member"
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                    aria-invalid={Boolean(addMemberState.fieldErrors?.role)}
                  >
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {addMemberState.fieldErrors?.role ? (
                    <p className="text-sm text-red-600">{addMemberState.fieldErrors.role}</p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label>Selected user</Label>
                  <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                    {selectedUser ? (
                      <>
                        <span className="block font-medium text-slate-700">{selectedUser.name}</span>
                        <span className="text-xs text-slate-500">{selectedUser.email}</span>
                      </>
                    ) : (
                      <span>No user selected yet.</span>
                    )}
                  </div>
                </div>
              </div>
              {addMemberState.message ? (
                <p
                  className={cn(
                    "text-sm",
                    addMemberState.status === "error" ? "text-red-600" : "text-emerald-600"
                  )}
                >
                  {addMemberState.message}
                </p>
              ) : null}
              <SubmitButton label="Add member" disabled={!selectedUser} />
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Team members</h3>
              <div className="overflow-hidden rounded-lg border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Member</th>
                      <th className="px-3 py-2">Role</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {team.memberships.length === 0 ? (
                      <tr>
                        <td className="px-3 py-3 text-sm text-slate-500" colSpan={3}>
                          No members yet. Add your first teammate above.
                        </td>
                      </tr>
                    ) : (
                      team.memberships.map(member => (
                        <tr key={member.$id} className="bg-white">
                          <td className="px-3 py-2">
                            <div className="flex flex-col">
                              <span className="font-medium text-slate-700">{member.userName ?? "Pending invite"}</span>
                              <span className="text-xs text-slate-500">{member.userEmail ?? "Awaiting acceptance"}</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-slate-600">{member.roles.join(", ") || "member"}</td>
                          <td className="px-3 py-2">
                            <span
                              className={cn(
                                "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
                                member.confirm
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              )}
                            >
                              {member.confirm ? "Active" : "Pending"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <form id="create-wallet-team-form" action={createAction} className="space-y-4">
              <input type="hidden" name="walletId" value={walletId} />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">Create a new team</h3>
                <p className="text-xs text-slate-500">
                  Instantly create an Appwrite team named after this wallet.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team-name">Team name</Label>
                <Input
                  id="team-name"
                  name="teamName"
                  placeholder={`${walletName} collaborators`}
                  required
                  aria-invalid={Boolean(createState.fieldErrors?.teamName)}
                />
                {createState.fieldErrors?.teamName ? (
                  <p className="text-sm text-red-600">{createState.fieldErrors.teamName}</p>
                ) : null}
              </div>
              {createState.message ? (
                <p
                  className={cn(
                    "text-sm",
                    createState.status === "error" ? "text-red-600" : "text-emerald-600"
                  )}
                >
                  {createState.message}
                </p>
              ) : null}
              <SubmitButton label="Create and link team" />
            </form>
            <div className="relative">
              <div className="absolute inset-x-0 top-0 flex items-center">
                <span className="mx-auto h-px w-16 bg-slate-200" aria-hidden="true" />
              </div>
              <p className="text-center text-xs uppercase tracking-wide text-slate-400">or</p>
            </div>
            <form id="attach-wallet-team-form" action={attachAction} className="space-y-4">
              <input type="hidden" name="walletId" value={walletId} />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">Link an existing team</h3>
                <p className="text-xs text-slate-500">
                  Paste the Appwrite team ID that already manages this wallet.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="team-id">Team ID</Label>
                <Input
                  id="team-id"
                  name="teamId"
                  placeholder="appwrite-team-id"
                  required
                  aria-invalid={Boolean(attachState.fieldErrors?.teamId)}
                />
                {attachState.fieldErrors?.teamId ? (
                  <p className="text-sm text-red-600">{attachState.fieldErrors.teamId}</p>
                ) : null}
              </div>
              {attachState.message ? (
                <p
                  className={cn(
                    "text-sm",
                    attachState.status === "error" ? "text-red-600" : "text-emerald-600"
                  )}
                >
                  {attachState.message}
                </p>
              ) : null}
              <SubmitButton label="Link team" />
            </form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
