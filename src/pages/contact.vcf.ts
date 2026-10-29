import { card } from '../data/card';

// vCard 3.0: the widest-supported version on iOS and Android contacts.
export function GET() {
  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${card.lastName};${card.firstName};;;`,
    `FN:${card.fullName}`,
    `ORG:${card.org}`,
    `TITLE:${card.headline}`,
    `EMAIL;TYPE=INTERNET:${card.email}`,
    `URL:${card.site}`,
    `URL;TYPE=LinkedIn:${card.linkedin}`,
    'END:VCARD',
    '',
  ].join('\r\n');

  return new Response(vcard, {
    headers: {
      'Content-Type': 'text/vcard; charset=utf-8',
      'Content-Disposition': `attachment; filename="${card.firstName}-${card.lastName}.vcf"`,
    },
  });
}
