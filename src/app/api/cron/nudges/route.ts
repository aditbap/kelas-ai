import { NextRequest, NextResponse } from 'next/server';

import { sendPostTrainingNudges } from '@/lib/nudges';

/**
 * Triggered on a schedule (see the `crons` entry in vercel.json - weekly,
 * matching NUDGE_INTERVAL_DAYS in src/lib/nudges.ts). Vercel Cron calls this
 * with `Authorization: Bearer $CRON_SECRET`; reject anything else so this
 * can't be used to spam every employee's inbox on demand.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const result = await sendPostTrainingNudges();
  return NextResponse.json({ ok: true, ...result });
}
