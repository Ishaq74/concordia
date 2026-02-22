import { auth } from "@lib/auth/auth";

type OrganizationRoleValue = string | string[];

export async function listOrganizations(
  headers: Headers,
  query: Record<string, string | number | undefined> = {},
) {
  if (!auth) throw new Error("Auth not initialized");
  return (auth.api as any).listOrganizations({
    headers,
    query,
  });
}

export async function createOrganization(
  headers: Headers,
  params: {
    name: string;
    slug: string;
  },
) {
  if (!auth) throw new Error("Auth not initialized");
  return (auth.api as any).createOrganization({
    headers,
    body: {
      name: params.name,
      slug: params.slug,
    },
  });
}

export async function listOrganizationMembers(headers: Headers, organizationId: string) {
  if (!auth) throw new Error("Auth not initialized");
  return (auth.api as any).listMembers({
    headers,
    query: {
      organizationId,
    },
  });
}

export async function addOrganizationMember(
  headers: Headers,
  params: {
    organizationId: string;
    userId: string;
    role: OrganizationRoleValue;
  },
) {
  if (!auth) throw new Error("Auth not initialized");
  return (auth.api as any).addMember({
    headers,
    body: {
      organizationId: params.organizationId,
      userId: params.userId,
      // API definitions restrict to admin/member/owner but backend accepts our custom values too.
      role: params.role as unknown as "admin" | "member" | "owner" | ("admin" | "member" | "owner")[],
    },
  });
}

export async function updateOrganizationMember(
  headers: Headers,
  params: {
    organizationId: string;
    memberId: string;
    role: OrganizationRoleValue;
  },
) {
  if (!auth) throw new Error("Auth not initialized");
  return (auth.api as any).updateMemberRole({
    headers,
    body: {
      organizationId: params.organizationId,
      memberId: params.memberId,
      role: params.role as unknown as "admin" | "member" | "owner" | ("admin" | "member" | "owner")[],
    },
  });
}

export async function setActiveOrganization(headers: Headers, organizationId: string) {
  if (!auth) throw new Error("Auth not initialized");
  return (auth.api as any).setActiveOrganization({
    headers,
    body: {
      organizationId,
    },
  });
}
