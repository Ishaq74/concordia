// Simple blog navigation config (inspired by docs/navigation.ts)
export const getBlogNavConfig = (locale: string, t: any) => [
  {
    title: t.nav.blog || 'Blog',
    items: [
      { label: t.nav.blog || 'Blog', href: `/${locale}/blog` },
      { label: t.blog?.categories ?? 'Categories', href: `/${locale}/blog/categorie` },
      { label: 'Auteurs', href: `/${locale}/blog/auteur` },
      { label: 'Archives', href: `/${locale}/blog/archives` },
    ]
  }
];