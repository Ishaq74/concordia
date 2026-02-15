import { auth } from "@lib/auth/auth";

type OrganizationRoleValue = string | string[];

export async function listOrganizations(
  headers: Headers,
  query: Record<string, string | number | undefined> = {},
) {
  return auth.api.listOrganizations({
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
  return auth.api.createOrganization({
    headers,
    body: {
      name: params.name,
      slug: params.slug,
    },
  });
}

export async function listOrganizationMembers(headers: Headers, organizationId: string) {
  return auth.api.listMembers({
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
  return auth.api.addMember({
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
  return auth.api.updateMemberRole({
    headers,
    body: {
      organizationId: params.organizationId,
      memberId: params.memberId,
      role: params.role as unknown as "admin" | "member" | "owner" | ("admin" | "member" | "owner")[],
    },
  });
}

export async function setActiveOrganization(headers: Headers, organizationId: string) {
  return auth.api.setActiveOrganization({
    headers,
    body: {
      organizationId,
    },
  });
}
