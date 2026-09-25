import { WorshipEvent, Member, Song } from '../types';

export function generateWhatsAppScaleMessage(
  event: WorshipEvent,
  members: Member[],
  songs: Song[]
): string {
  const memberMap = new Map(members.map(m => [m.id, m]));
  const songMap = new Map(songs.map(s => [s.id, s]));

  const dateObj = new Date(event.date + 'T' + event.time);
  const formattedDate = dateObj.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  let message = `🕊️ *IGREJA BATISTA ELOHIM*\n`;
  message += `🎵 *Ministério de Louvor - Escala Oficial*\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n\n`;
  message += `📅 *${event.title}*\n`;
  message += `🗓️ ${capitalizedDate} às ${event.time}\n`;
  message += `📍 ${event.location}\n`;
  if (event.theme) {
    message += `📖 Tema: *${event.theme}*\n`;
  }
  if (event.notes) {
    message += `ℹ️ Obs: _${event.notes}_\n`;
  }

  message += `\n👥 *EQUIPE ESCALADA:*\n`;
  event.team.forEach(t => {
    const mem = memberMap.get(t.memberId);
    const statusIcon = t.status === 'confirmed' ? '✅' : t.status === 'declined' ? '❌' : '⏳';
    const statusText = t.status === 'confirmed' ? '(Confirmado)' : t.status === 'declined' ? '(Indisponível)' : '(Pendente)';
    message += `• *${t.roleName}:* ${mem ? mem.name : 'A definir'} ${statusIcon} ${statusText}\n`;
  });

  if (event.setlist && event.setlist.length > 0) {
    message += `\n🎼 *REPERTÓRIO (LOUVORES):*\n`;
    event.setlist.forEach((item, index) => {
      const song = songMap.get(item.songId);
      if (song) {
        message += `${index + 1}. *${song.title}* - ${song.artist}\n   Tom: *[${item.key}]* | BPM: ${song.tempoBpm}\n`;
        if (item.notes) {
          message += `   _Nota: ${item.notes}_\n`;
        }
      }
    });
  }

  message += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `⚠️ _Por favor, confirme sua presença no aplicativo ou responda aqui com antecedência para alinhamento dos ensaios._\n`;
  message += `_"Cantai-lhe um cântico novo; tocai bem e com júbilo." (Salmos 33:3)_`;

  return message;
}
