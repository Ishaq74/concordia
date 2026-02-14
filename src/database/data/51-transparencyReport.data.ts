// Seed: transparencyReport — rapports de transparence
export const transparencyReportData = [
  { id: "tr-001", title: "Rapport de transparence — T2 2024", slug: "rapport-transparence-t2-2024", contentJson: JSON.stringify({
    introduction: "Ce rapport couvre l'activité de la plateforme Concordia pour le deuxième trimestre 2024 (avril-juin). Il détaille l'usage des fonds, la modération, et l'impact communautaire.",
    sections: [
      { title: "Utilisation des fonds", content: "4 campagnes de financement actives. 4 770 € collectés auprès de 73 donateurs. Commission plateforme : 2% soit 95,40 €. 100% des fonds reversés aux porteurs de projet dans les 48h suivant la clôture." },
      { title: "Modération", content: "3 cas de médiation ouverts. 1 résolu par accord mutuel. 0 contenu supprimé pour violation des CGU. 2 avis signalés et traités." },
      { title: "Activité communautaire", content: "15 utilisateurs actifs. 28 bénévoles mobilisés. 156 heures de bénévolat. 180 kg de déchets collectés. 48 leçons complétées. 8 annonces publiées." },
      { title: "Gouvernance", content: "0 plainte RGPD. 0 demande de suppression de données. Audit de sécurité interne réalisé le 15 juin 2024." }
    ]
  }), periodStart: "2024-04-01", periodEnd: "2024-06-30", metricIds: ["im-001", "im-002", "im-003", "im-004", "im-005", "im-006", "im-007"], publishedBy: "u-admin-001", status: "published", publishedAt: new Date("2024-07-10"), createdAt: new Date("2024-07-05") },
];
