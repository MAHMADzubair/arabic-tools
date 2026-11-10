/**
 * lib/founder.js — single source for the founder's public identity.
 * Change the name here only; every page and schema reads from this file.
 */
export const FOUNDER = {
  nameAr: "محمد أحمد زبير",
  nameEn: "Muhammad Ahmad Zubair",
  roleAr: "مؤسس Qemlo",
  avatar: "/brand/founder-avatar.svg",
};

export function founderSchema(siteUrl) {
  return {
    "@type": "Person",
    name: FOUNDER.nameAr,
    alternateName: FOUNDER.nameEn,
    jobTitle: FOUNDER.roleAr,
    image: `${siteUrl}${FOUNDER.avatar}`,
    url: `${siteUrl}/about`,
  };
}
