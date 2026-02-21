import { render } from 'astro-testing-library';
import { expect, describe, it } from 'vitest';
import BannerPage from '@/components/templates/BannerPage.astro';

describe('BannerPage template with video background', () => {
  it('renders a video background when videoUrl is provided', async () => {
    const videoUrl = '/videos/sample.mp4';
    const { container } = await render(BannerPage, {
      title: 'Vidéo en fond',
      videoUrl,
    });
    const video = container.querySelector('video.banner-media');
    expect(video).not.toBeNull();
    expect(video?.getAttribute('src')).toBe(videoUrl);
    expect(video?.hasAttribute('autoplay')).toBe(true);
    expect(video?.hasAttribute('loop')).toBe(true);
    expect(video?.hasAttribute('muted')).toBe(true);
    expect(video?.hasAttribute('playsinline')).toBe(true);
  });
});
