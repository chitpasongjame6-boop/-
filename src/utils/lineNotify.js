import { format } from 'date-fns'
import { th } from 'date-fns/locale'

/**
 * Send a Line Notify message using the user's token.
 * Line Notify API supports direct browser calls.
 * Token is stored in localStorage settings.
 */
export async function sendLineNotify(token, message) {
  if (!token || !token.trim()) return { ok: false, reason: 'no_token' }
  try {
    const body = new URLSearchParams()
    body.append('message', message)
    const res = await fetch('https://notify-api.line.me/api/notify', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.trim()}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    })
    return { ok: res.ok, status: res.status }
  } catch (err) {
    return { ok: false, reason: err.message }
  }
}

export function buildCashInMessage(staffName, amount, note) {
  const now = format(new Date(), 'HH:mm น. (d MMM)', { locale: th })
  return [
    '',
    '💰 แจ้งเตือน: โอนเงินเข้าตู้',
    `👤 พนักงาน: ${staffName}`,
    `💵 ຈໍານວນ: ₭${new Intl.NumberFormat('lo-LA').format(amount)}`,
    note ? `📝 หมายเหตุ: ${note}` : null,
    `🕐 เวลา: ${now}`,
  ].filter(Boolean).join('\n')
}

export function buildTransactionMessage(staffName, type, sourceAmount, rate, profit) {
  const now = format(new Date(), 'HH:mm น. (d MMM)', { locale: th })
  const fmt = v => new Intl.NumberFormat('lo-LA').format(Math.round(v))
  return [
    '',
    '📊 ຈັດການແລກເງິນໃຫມ່',
    `👤 ພນັກງານ: ${staffName}`,
    `🔖 ປະເພດ: ${type}`,
    `💵 ຍອດຕົ້ນທາງ: ₭${fmt(sourceAmount)}`,
    `📉 ເຣດ: ${rate}%`,
    `✅ ກຳໄລ: +₭${fmt(profit)}`,
    `🕐 เวลา: ${now}`,
  ].join('\n')
}
