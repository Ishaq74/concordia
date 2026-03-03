#!/usr/bin/env node
/**
 * scripts/fix-todo-translate-2.mjs
 * Fix remaining [MISSING] entries in es.json and ar.json
 */
import fs from 'fs';
import path from 'path';

const I18N_DIR = path.join('src', 'i18n');

const TRANSLATIONS = {
  es: {
    // eventsPage
    "Découvrez les événements à venir sur le territoire": "Descubra los próximos eventos en el territorio",
    "À venir": "Próximos",
    "Passés": "Pasados",
    "S'inscrire": "Inscribirse",
    "Inscrit": "Inscrito",
    "participants": "participantes",
    // educationPage
    "Éducation": "Educación",
    "Apprenez et développez vos compétences": "Aprenda y desarrolle sus habilidades",
    "Modules": "Módulos",
    "Leçons": "Lecciones",
    "Progression": "Progreso",
    "Difficulté": "Dificultad",
    "Débutant": "Principiante",
    "Intermédiaire": "Intermedio",
    "Avancé": "Avanzado",
    "Marquer comme terminé": "Marcar como completado",
    "Leçon suivante": "Próxima lección",
    "Leçon précédente": "Lección anterior",
    "Aucun module disponible": "Ningún módulo disponible",
    // volunteerPage
    "Bénévolat": "Voluntariado",
    "Engagez-vous dans des projets solidaires": "Participe en proyectos solidarios",
    "Projets": "Proyectos",
    "Tâches": "Tareas",
    "Participant": "Participante",
    "Bénévoles": "Voluntarios",
    "Compétences": "Competencias",
    "Financement": "Financiación",
    "Faire un don": "Hacer una donación",
    "Objectif atteint": "Objetivo alcanzado",
    "Aucun projet en cours": "Ningún proyecto en curso",
    // contactPage
    "Nous écrire": "Escríbanos",
    // classifiedsPage
    "Annonces": "Anuncios",
    "Petites annonces de la communauté": "Anuncios clasificados de la comunidad",
    "Publier une annonce": "Publicar un anuncio",
    "État": "Estado",
    "Neuf": "Nuevo",
    "Occasion": "Usado",
    "Endommagé": "Dañado",
    "Contacter le vendeur": "Contactar al vendedor",
    "Aucune annonce pour le moment": "Ningún anuncio por el momento",
    // trailsPage
    "Sentiers": "Senderos",
    "Explorez les sentiers et balades du territoire": "Explore los senderos y paseos del territorio",
    "Facile": "Fácil",
    "Modéré": "Moderado",
    "Difficile": "Difícil",
    "Dénivelé": "Desnivel",
    "Points d'intérêt": "Puntos de interés",
    "Aucun sentier disponible": "Ningún sendero disponible",
    // transparencyPage
    "Transparence": "Transparencia",
    "Métriques d'impact et rapports de transparence": "Métricas de impacto e informes de transparencia",
    "Métriques": "Métricas",
    "Rapports": "Informes",
    "Projets réalisés": "Proyectos realizados",
    "Heures de bénévolat": "Horas de voluntariado",
    "Fonds collectés": "Fondos recaudados",
    "Médiations résolues": "Mediaciones resueltas",
    "Leçons terminées": "Lecciones completadas",
    "Citoyens actifs": "Ciudadanos activos",
    "Ressources partagées": "Recursos compartidos",
    // servicesPage
    "Services locaux": "Servicios locales",
    "Services proposés par les professionnels du territoire": "Servicios ofrecidos por los profesionales del territorio",
    "Disponibilités": "Disponibilidades",
    // dashboard
    "Mon profil": "Mi perfil",
    "Mes lieux": "Mis lugares",
    "Mon blog": "Mi blog",
    "Mes annonces": "Mis anuncios",
    "Mes services": "Mis servicios",
    "Mes réservations": "Mis reservas",
    "Mes inscriptions": "Mis inscripciones",
    "Mes favoris": "Mis favoritos",
    "Messagerie": "Mensajería",
    "Notifications": "Notificaciones",
    "Portefeuille": "Cartera",
    "Médiation": "Mediación",
    "Mon contenu éducatif": "Mi contenido educativo",
    "Solde": "Saldo",
    "Transactions": "Transacciones",
    "Aucune notification": "Ninguna notificación",
    "Tout marquer comme lu": "Marcar todo como leído",
    "Non lues": "No leídas",
    "Aucun message": "Ningún mensaje",
    "Nouvelle conversation": "Nueva conversación",
    "Aucun favori": "Ningún favorito",
    "Aucune réservation": "Ninguna reserva",
    "Passées": "Pasadas",
    "Annulées": "Canceladas",
  },
  ar: {
    // eventsPage
    "Découvrez les événements à venir sur le territoire": "اكتشف الفعاليات القادمة في المنطقة",
    "À venir": "القادمة",
    "Passés": "الماضية",
    "S'inscrire": "التسجيل",
    "Inscrit": "مسجل",
    "participants": "مشاركين",
    // educationPage
    "Éducation": "التعليم",
    "Apprenez et développez vos compétences": "تعلم وطور مهاراتك",
    "Modules": "الوحدات",
    "Leçons": "الدروس",
    "Progression": "التقدم",
    "Difficulté": "الصعوبة",
    "Débutant": "مبتدئ",
    "Intermédiaire": "متوسط",
    "Avancé": "متقدم",
    "Marquer comme terminé": "وضع علامة كمكتمل",
    "Leçon suivante": "الدرس التالي",
    "Leçon précédente": "الدرس السابق",
    "Aucun module disponible": "لا توجد وحدات متاحة",
    // volunteerPage
    "Bénévolat": "التطوع",
    "Engagez-vous dans des projets solidaires": "شارك في المشاريع التضامنية",
    "Projets": "المشاريع",
    "Tâches": "المهام",
    "Participant": "مشارك",
    "Bénévoles": "المتطوعون",
    "Compétences": "المهارات",
    "Financement": "التمويل",
    "Faire un don": "التبرع",
    "Objectif atteint": "تم تحقيق الهدف",
    "Aucun projet en cours": "لا توجد مشاريع جارية",
    // contactPage
    "Nous écrire": "اكتب لنا",
    // classifiedsPage
    "Annonces": "إعلانات",
    "Petites annonces de la communauté": "إعلانات مبوبة للمجتمع",
    "Publier une annonce": "نشر إعلان",
    "État": "الحالة",
    "Neuf": "جديد",
    "Occasion": "مستعمل",
    "Endommagé": "تالف",
    "Contacter le vendeur": "الاتصال بالبائع",
    "Aucune annonce pour le moment": "لا توجد إعلانات حالياً",
    // trailsPage
    "Sentiers": "المسارات",
    "Explorez les sentiers et balades du territoire": "استكشف المسارات والممرات في المنطقة",
    "Facile": "سهل",
    "Modéré": "متوسط",
    "Difficile": "صعب",
    "Dénivelé": "ارتفاع",
    "Points d'intérêt": "نقاط الاهتمام",
    "Aucun sentier disponible": "لا توجد مسارات متاحة",
    // transparencyPage
    "Transparence": "الشفافية",
    "Métriques d'impact et rapports de transparence": "مقاييس التأثير وتقارير الشفافية",
    "Métriques": "المقاييس",
    "Rapports": "التقارير",
    "Projets réalisés": "المشاريع المنجزة",
    "Heures de bénévolat": "ساعات التطوع",
    "Fonds collectés": "الأموال المجمعة",
    "Médiations résolues": "الوساطات المحلولة",
    "Leçons terminées": "الدروس المكتملة",
    "Citoyens actifs": "المواطنون النشطون",
    "Ressources partagées": "الموارد المشتركة",
    // servicesPage
    "Services locaux": "الخدمات المحلية",
    "Services proposés par les professionnels du territoire": "الخدمات المقدمة من محترفي المنطقة",
    "Disponibilités": "أوقات التوفر",
    // dashboard
    "Mon profil": "ملفي الشخصي",
    "Mes lieux": "أماكني",
    "Mon blog": "مدونتي",
    "Mes annonces": "إعلاناتي",
    "Mes services": "خدماتي",
    "Mes réservations": "حجوزاتي",
    "Mes inscriptions": "تسجيلاتي",
    "Mes favoris": "مفضلاتي",
    "Messagerie": "الرسائل",
    "Notifications": "الإشعارات",
    "Portefeuille": "المحفظة",
    "Médiation": "الوساطة",
    "Mon contenu éducatif": "محتواي التعليمي",
    "Solde": "الرصيد",
    "Transactions": "المعاملات",
    "Aucune notification": "لا توجد إشعارات",
    "Tout marquer comme lu": "تحديد الكل كمقروء",
    "Non lues": "غير مقروءة",
    "Aucun message": "لا توجد رسائل",
    "Nouvelle conversation": "محادثة جديدة",
    "Aucun favori": "لا توجد مفضلات",
    "Aucune réservation": "لا توجد حجوزات",
    "Passées": "الماضية",
    "Annulées": "الملغاة",
  }
};

for (const locale of ['es', 'ar']) {
  const filePath = path.join(I18N_DIR, `${locale}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const translations = TRANSLATIONS[locale];
  let fixed = 0;

  const processObj = (obj) => {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string' && obj[key].startsWith('[MISSING] ')) {
        const frText = obj[key].replace('[MISSING] ', '');
        if (translations[frText]) {
          obj[key] = translations[frText];
          fixed++;
        } else {
          console.log(`  ❓ Still missing (${locale}): "${frText}"`);
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        processObj(obj[key]);
      }
    }
  };

  processObj(data);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  
  const remaining = (JSON.stringify(data).match(/\[MISSING\]/g) || []).length;
  console.log(`✅ ${locale}.json: ${fixed} fixed, ${remaining} still missing`);
}
