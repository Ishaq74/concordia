import { describe, it, expect, beforeAll } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import {
  expectHasText,
} from '@tests/helpers/uiTestHelpers';

import FundingCampaignCard from '@components/ui/FundingCampaignCard.astro';
import VolunteerProjectCard from '@components/ui/VolunteerProjectCard.astro';

describe('Component: FundingCampaignCard', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders with required props', async () => {
    const html = await container.renderToString(FundingCampaignCard, {
      props: {
        href: '/funding/1',
        title: 'Community Garden',
        goalAmount: 10000,
        raisedAmount: 3500,
        donorCount: 42,
        currency: 'EUR',
      },
    });
    expect(html).toBeTruthy();
    expectHasText(html, 'Community Garden');
  });

  it('renders with deadline', async () => {
    const html = await container.renderToString(FundingCampaignCard, {
      props: {
        href: '/funding/1',
        title: 'With Deadline',
        goalAmount: 5000,
        raisedAmount: 1200,
        donorCount: 15,
        currency: 'USD',
        deadline: new Date('2025-12-31'),
      },
    });
    expectHasText(html, 'With Deadline');
  });

  it('applies variant', async () => {
    const html = await container.renderToString(FundingCampaignCard, {
      props: {
        href: '/funding/1',
        title: 'Modern Campaign',
        goalAmount: 2000,
        raisedAmount: 500,
        donorCount: 8,
        currency: 'EUR',
        variant: 'modern',
      },
    });
    expect(html).toContain('modern');
  });
});

describe('Component: VolunteerProjectCard', () => {
  let container: AstroContainer;
  beforeAll(async () => {
    container = await AstroContainer.create();
  });

  it('renders with required props', async () => {
    const html = await container.renderToString(VolunteerProjectCard, {
      props: {
        href: '/volunteer/1',
        title: 'Beach Cleanup',
        status: 'active',
        volunteerCount: 25,
      },
    });
    expect(html).toBeTruthy();
    expectHasText(html, 'Beach Cleanup');
  });

  it('renders with full details', async () => {
    const html = await container.renderToString(VolunteerProjectCard, {
      props: {
        href: '/volunteer/1',
        title: 'Full Project',
        description: 'Help the community',
        location: 'Paris, France',
        status: 'active',
        volunteerCount: 50,
        volunteerGoal: 100,
        fundingRaised: 2500,
        fundingGoal: 5000,
        startDate: new Date('2024-06-01'),
        endDate: new Date('2024-12-31'),
        variant: 'retro',
      },
    });
    expectHasText(html, 'Full Project');
  });
});
