import assert from 'node:assert'
import { maskCPF, mapAssinaturaStatus } from '../utils/signature-utils.js'

// CPF masking
assert.equal(maskCPF('12345678901'), '***.***.***-01')
assert.equal(maskCPF('00000000000'), '***.***.***-00')

// assinatura status mapping
assert.equal(mapAssinaturaStatus('COLETA_ASSINATURA', 0), 'ASSINATURA_ENVIADA')
assert.equal(mapAssinaturaStatus('PLANO_EM_CONSTRUCAO', 0), 'ASSINATURA_NAO_ENVIADA')
assert.equal(mapAssinaturaStatus('APROVADO', 1), 'ASSINATURA_CONCLUIDA')

console.log('All minimal tests passed.')
