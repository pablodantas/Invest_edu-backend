export function maskCPF(cpf: string) {
  const digits = (cpf || '').replace(/\D/g, '').padStart(11, '0').slice(-11)
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.***.***-$4')
}

export function mapAssinaturaStatus(planStatus: string, signaturesCount: number): 'ASSINATURA_NAO_ENVIADA' | 'ASSINATURA_ENVIADA' | 'ASSINATURA_CONCLUIDA' {
  if (planStatus === 'COLETA_ASSINATURA') return 'ASSINATURA_ENVIADA'
  if (signaturesCount > 0 && planStatus !== 'COLETA_ASSINATURA') return 'ASSINATURA_CONCLUIDA'
  return 'ASSINATURA_NAO_ENVIADA'
}
