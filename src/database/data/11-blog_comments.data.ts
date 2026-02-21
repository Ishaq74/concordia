export const blogCommentsSeed = [
    // Article 1 : post-fete-du-lac-2025 (1 commentaire root)
    {
        id: "comment-1",
        entityId: "post-fete-du-lac-2025",
        entityType: "blog",
        authorName: "Alice",
        authorEmail: "alice@email.com",
        content: { fr: "Super article !" },
        rating: 5,
        status: "approved",
        inLanguage: "fr",
        createdAt: new Date(),
        updatedAt: new Date(),
    },

    // Article 2 : post-randonnee-foret-2025 (nested comments)
    {
        id: "comment-2",
        entityId: "post-randonnee-foret-2025",
        entityType: "blog",
        authorName: "Bob",
        authorEmail: "bob@email.com",
        content: { fr: "J'ai adoré la randonnée !" },
        rating: 4,
        status: "approved",
        inLanguage: "fr",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "comment-3",
        entityId: "post-randonnee-foret-2025",
        entityType: "blog",
        parentId: "comment-2",
        authorName: "Charlie",
        authorEmail: "charlie@email.com",
        content: { fr: "Merci pour le retour, Bob !" },
        rating: 0,
        status: "approved",
        inLanguage: "fr",
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        id: "comment-4",
        entityId: "post-randonnee-foret-2025",
        entityType: "blog",
        parentId: "comment-3",
        authorName: "Diane",
        authorEmail: "diane@email.com",
        content: { fr: "Charlie, tu as aussi participé ?" },
        rating: 0,
        status: "approved",
        inLanguage: "fr",
        createdAt: new Date(),
        updatedAt: new Date(),
    },

    // Article 3 : post-marche-printemps-2025 (aucun commentaire)
    // Aucun seed pour cet article
];