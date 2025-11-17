# 📸 Sistema de Identificação de Pragas por Foto

## Descrição

Sistema completo de identificação de pragas através de upload de imagens, permitindo que usuários leigos identifiquem problemas em suas plantas sem conhecimento prévio.

## ✨ Funcionalidades Implementadas

### 1. **Interface de Upload** (`/identificar`)
- ✅ Upload de fotos via câmera do dispositivo (mobile)
- ✅ Upload de fotos da galeria
- ✅ Drag & Drop para desktop
- ✅ Preview da imagem antes do envio
- ✅ Validação de tipo de arquivo (JPG, PNG, WEBP)
- ✅ Limite de tamanho (10MB)
- ✅ Feedback visual durante upload (loading overlay)
- ✅ Design responsivo para mobile e desktop

### 2. **Backend de Processamento**
- ✅ Rota POST `/identificar` para processar uploads
- ✅ Armazenamento seguro de imagens em `/public/images/uploads/`
- ✅ Algoritmo de correspondência (simulado) que retorna top 5 pragas
- ✅ Cálculo de nível de confiança para cada resultado
- ✅ Geração de razões/motivos para cada identificação

### 3. **Tela de Resultados**
- ✅ Exibição da imagem analisada
- ✅ Lista de até 5 possíveis pragas encontradas
- ✅ Cards informativos com:
  - Ranking (1º, 2º, 3º resultado)
  - Imagem da praga
  - Nome comum e científico
  - Categoria
  - Nível de confiança visual (círculo colorido com percentual)
  - Razão da identificação
  - Botão para ver detalhes completos
- ✅ Código de cores por confiança:
  - Verde: >= 75% (alta confiança)
  - Laranja: 50-74% (média confiança)
  - Vermelho: < 50% (baixa confiança)
- ✅ Disclaimer sobre necessidade de consulta profissional
- ✅ Botões para nova análise ou explorar catálogo

## 🎯 Fluxo de Uso

```
1. Usuário acessa /identificar
   ↓
2. Tira foto ou faz upload da galeria
   ↓
3. Vê preview e clica em "Analisar"
   ↓
4. Sistema processa e exibe resultados
   ↓
5. Usuário pode:
   - Ver detalhes de cada praga
   - Fazer nova análise
   - Explorar catálogo completo
```

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
- `routes/identificar.js` - Rota e lógica de processamento
- `views/identificar/index.jade` - Interface de upload
- `views/identificar/resultados.jade` - Tela de resultados
- `public/images/uploads/.gitkeep` - Diretório para uploads

### Arquivos Modificados
- `app.js` - Registro da nova rota
- `views/index.jade` - Link no menu principal
- `views/layout.jade` - Link no header global

## 🚀 Como Usar

### Para Usuários

1. Acesse a aplicação em `http://localhost:3210`
2. Clique em "🔍 Identificar" no menu
3. Tire uma foto ou faça upload de uma imagem
4. Aguarde a análise
5. Veja os resultados com níveis de confiança
6. Clique em "Ver Detalhes" para mais informações

### Para Desenvolvedores

#### Estrutura da Rota

```javascript
GET  /identificar         // Exibe página de upload
POST /identificar         // Processa imagem e retorna resultados
```

#### Melhorias Futuras (Integração com IA Real)

O sistema atual usa uma simulação. Para integrar com IA real:

1. **Integrar com API de Machine Learning**
```javascript
// Exemplo com TensorFlow ou API externa
const resultado = await analisarImagemIA(req.file.path);
```

2. **Usar serviços como:**
   - Google Cloud Vision API
   - AWS Rekognition
   - Azure Computer Vision
   - Modelo próprio com TensorFlow.js

3. **Treinar modelo personalizado:**
   - Coletar dataset de imagens de pragas
   - Treinar modelo CNN (Convolutional Neural Network)
   - Exportar para produção
   - Integrar no backend

## 🎨 Design e UX

### Cores e Estados
- **Verde (#4caf50)**: Alta confiança, resultados confiáveis
- **Laranja (#ff9800)**: Média confiança, verificar detalhes
- **Vermelho (#f44336)**: Baixa confiança, considerar outras opções

### Elementos Interativos
- Drag & Drop intuitivo
- Preview imediato da foto
- Loading overlay com spinner
- Hover effects nos cards
- Botões de ação claramente identificados

### Responsividade
- Layout adaptativo para mobile/tablet/desktop
- Captura de câmera nativa em dispositivos móveis
- Grid flexível de resultados
- Botões empilhados em telas pequenas

## 🔒 Segurança

- ✅ Validação de tipo de arquivo (apenas imagens)
- ✅ Limite de tamanho de arquivo (10MB)
- ✅ Nomes de arquivo únicos (timestamp)
- ✅ Armazenamento em diretório específico
- ⚠️ **TODO**: Adicionar sanitização de nomes de arquivo
- ⚠️ **TODO**: Implementar limpeza automática de uploads antigos

## 📊 Métricas de Sucesso

Para avaliar o sucesso desta funcionalidade, monitore:

- Taxa de uploads bem-sucedidos
- Tempo médio de análise
- Taxa de cliques em "Ver Detalhes"
- Taxa de retorno (nova análise)
- Feedback sobre precisão dos resultados

## 🐛 Troubleshooting

### Erro: "Apenas imagens são permitidas"
**Causa**: Arquivo não é JPG, PNG ou WEBP
**Solução**: Use formato de imagem válido

### Erro: Imagem não aparece nos resultados
**Causa**: Diretório `/public/images/uploads/` não existe
**Solução**: Execute `mkdir -p public/images/uploads/`

### Erro: "Cannot read property 'filename'"
**Causa**: Multer não está processando upload corretamente
**Solução**: Verifique configuração de `enctype="multipart/form-data"`

## 📝 Notas Técnicas

### Algoritmo de Simulação

O sistema atual usa um algoritmo simples:
1. Busca 5 pragas aleatórias do banco
2. Atribui scores de confiança decrescentes (95% a 45%)
3. Gera razões genéricas de identificação

Para produção, substitua por:
- Análise real de características da imagem
- Comparação com banco de imagens de pragas
- Machine Learning para classificação

### Performance

- Upload máximo: 10MB
- Tempo de resposta: < 3s (simulado)
- Suporte a múltiplos formatos de imagem
- Otimização de imagens antes do processamento (futuro)

## 🔄 Próximas Melhorias

1. **Integração com IA Real**
   - Treinar modelo de classificação
   - Implementar API de ML
   - Melhorar precisão

2. **Histórico de Análises**
   - Salvar análises por usuário
   - Permitir comparações
   - Exportar relatórios

3. **Melhorias de UX**
   - Crop e rotação de imagem
   - Múltiplos uploads simultâneos
   - Compartilhamento de resultados

4. **Analytics**
   - Dashboard de métricas
   - Pragas mais identificadas
   - Taxa de acerto

## 📄 Licença

ISC - Parte do projeto PestControl Pro

---

**Desenvolvido para a Sprint 4 - História 16**
