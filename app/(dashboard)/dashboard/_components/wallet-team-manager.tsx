"use client";

import { useEffect, useMemo } from "react";
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
  inviteTeamMemberAction
} from "../actions";
import { initialState } from "../types";

interface WalletTeamManagerProps {
  walletId: string;
  walletName: string;
  team: { id: string; memberships: Models.Membership[] } | null;
  teamError: string | null;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={cn(buttonVariants({ variant: "secondary" }), "w-full sm:w-auto")}
      disabled={pending}
    >
      {pending ? "Saving..." : label}
    </button>
  );
}

export function WalletTeamManager({ walletId, walletName, team, teamError }: WalletTeamManagerProps) {
  const router = useRouter();
  const [createState, createAction] = useFormState(createWalletTeamAction, initialState);
  const [attachState, attachAction] = useFormState(attachTeamToWalletAction, initialState);
  const [inviteState, inviteAction] = useFormState(inviteTeamMemberAction, initialState);

  useEffect(() => {
    if (createState.status === "success" || attachState.status === "success" || inviteState.status === "success") {
      router.refresh();
    }
  }, [createState.status, attachState.status, inviteState.status, router]);

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
    if (inviteState.status === "success") {
      const form = document.getElementById("invite-team-member-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [inviteState.status]);

  const defaultRedirect = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}/api/auth/callback`;
  }, []);

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
            <form id="invite-team-member-form" action={inviteAction} className="space-y-4 rounded-lg border border-slate-200 p-4">
              <input type="hidden" name="walletId" value={walletId} />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900">Invite a teammate</h3>
                <p className="text-xs text-slate-500">
                  Appwrite will send them an email with the link you provide below.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="invite-email">Email</Label>
                  <Input
                    id="invite-email"
                    name="email"
                    type="email"
                    placeholder="teammate@email.com"
                    required
                    aria-invalid={Boolean(inviteState.fieldErrors?.email)}
                  />
                  {inviteState.fieldErrors?.email ? (
                    <p className="text-sm text-red-600">{inviteState.fieldErrors.email}</p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invite-name">Name (optional)</Label>
                  <Input id="invite-name" name="name" placeholder="Teammate name" />
                  {inviteState.fieldErrors?.name ? (
                    <p className="text-sm text-red-600">{inviteState.fieldErrors.name}</p>
                  ) : null}
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="invite-role">Role</Label>
                  <select
                    id="invite-role"
                    name="role"
                    defaultValue="member"
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                    aria-invalid={Boolean(inviteState.fieldErrors?.role)}
                  >
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {inviteState.fieldErrors?.role ? (
                    <p className="text-sm text-red-600">{inviteState.fieldErrors.role}</p>
                  ) : null}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="invite-redirect">Invite link</Label>
                  <Input
                    id="invite-redirect"
                    name="redirectUrl"
                    type="url"
                    defaultValue={defaultRedirect}
                    placeholder="https://your-app.com/auth/callback"
                    required
                    aria-invalid={Boolean(inviteState.fieldErrors?.redirectUrl)}
                  />
                  {inviteState.fieldErrors?.redirectUrl ? (
                    <p className="text-sm text-red-600">{inviteState.fieldErrors.redirectUrl}</p>
                  ) : null}
                </div>
              </div>
              {inviteState.message ? (
                <p
                  className={cn(
                    "text-sm",
                    inviteState.status === "error" ? "text-red-600" : "text-emerald-600"
                  )}
                >
                  {inviteState.message}
                </p>
              ) : null}
              <SubmitButton label="Send invite" />
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
                          No members yet. Invite your first teammate above.
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
