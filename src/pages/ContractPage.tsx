import { ArrowLeft, Printer } from '@phosphor-icons/react'
import { Link, useParams } from 'react-router'
import { ContractDoc } from '../components/Contract'
import { Logo } from '../components/Layout'
import { Button } from '../components/ui'
import { useLang } from '../lib/i18n'
import { useStore } from '../lib/store'

export default function ContractPage() {
  const { code = '' } = useParams()
  const { t } = useLang()
  const { bookings, unitById } = useStore()
  const bk = bookings.find((b) => b.code === code)
  const u = bk ? unitById(bk.unitId) : undefined
  return (
    <div className="min-h-dvh bg-mist py-8 print:bg-white print:py-0">
      <div className="no-print mx-auto mb-6 flex max-w-[52rem] items-center justify-between px-4">
        <Link to={bk ? `/reserva/${bk.code}` : '/'} className="inline-flex min-h-10 items-center gap-2 text-[0.875rem] text-mute hover:text-ink">
          <ArrowLeft size={16} />
          {t('Volver a la reserva', 'Voltar à reserva')}
        </Link>
        {bk && (
          <Button variant="ink" size="sm" onClick={() => window.print()}>
            <span className="inline-flex items-center gap-2">
              <Printer size={16} />
              {t('Imprimir o guardar PDF', 'Imprimir ou salvar PDF')}
            </span>
          </Button>
        )}
      </div>
      <div className="mx-auto max-w-[52rem] rounded-[18px] bg-white p-6 shadow-[var(--shadow-ambient)] md:p-12 print:max-w-none print:rounded-none print:p-0 print:shadow-none">
        {bk && u ? (
          <>
            <Logo className="mb-8" />
            <ContractDoc d={{ unit: u, period: bk.period, net: bk.net, fee: bk.fee, guest: bk.guest, date: bk.signedAt, code: bk.code, signature: bk.signature, signedAt: bk.signedAt }} />
          </>
        ) : (
          <p>{t('No encontramos este contrato.', 'Não encontramos este contrato.')}</p>
        )}
      </div>
    </div>
  )
}
