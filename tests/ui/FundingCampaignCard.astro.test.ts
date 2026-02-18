import { expect, test } from 'vitest';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import FundingCampaignCard from '@components/ui/FundingCampaignCard.astro';

test('FundingCampaignCard: rendu avec slots', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(FundingCampaignCard, {
    slots: { default: '<h3>Campaign</h3><p>Goal: $1000</p>' }
  });
  expect(html).toContain('funding-campaign-card');
  expect(html).toContain('Campaign');
  expect(html).toContain('$1000');
});

test('FundingCampaignCard: props variant et color', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(FundingCampaignCard, {
    props: { variant: 'futuristic', color: 'primary', className: 'custom-funding' },
    slots: { default: '<h3>Campaign</h3>' }
  });
  expect(html).toContain('futuristic');
  expect(html).toContain('primary');
  expect(html).toContain('custom-funding');
});

test('FundingCampaignCard: a11y role et aria-label', async () => {
  const container = await AstroContainer.create();
  const html = await container.renderToString(FundingCampaignCard, {
    props: { 'aria-label': 'Funding', role: 'region' },
    slots: { default: '<h3>Campaign</h3>' }
  });
  expect(html).toContain('aria-label="Funding"');
  expect(html).toContain('role="region"');
});
