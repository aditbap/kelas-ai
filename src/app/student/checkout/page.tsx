import { getAllAccessPayment } from '@/lib/access';
import { Role } from '@/generated/prisma/client/enums';
import { getTranslations } from '@/lib/i18n/get-locale';
import { ALL_ACCESS_PRICE_IDR } from '@/lib/pricing';
import { requireRole } from '@/lib/session';

import { CheckoutPanel } from './checkout-panel';
import { ManageSubscription } from './manage-subscription';

export default async function CheckoutPage() {
  const session = await requireRole(Role.Student);
  const { t, locale } = await getTranslations();

  const payment = await getAllAccessPayment(session.userId);

  if (payment) {
    return (
      <div className="w-full py-12 md:py-24">
        <ManageSubscription payment={payment} locale={locale} t={t.student.manageSubscription} />
      </div>
    );
  }

  return (
    <div className="w-full py-12 md:py-24">
      <CheckoutPanel priceAmount={ALL_ACCESS_PRICE_IDR} t={t.student.checkout.panel} />
    </div>
  );
}
